"""
parse_courses.py
----------------
Reads needed_format.py (raw RSU course catalog text) and writes
prerequisites.json in the format expected by backend/app/recommend.py.

Run from the backend/data/ directory:
    python parse_courses.py

Schema produced per course
--------------------------
{
  "DEPT NNNN": {
    "name": "Course Title",
    "credit_hours": 3,          # int; variable-credit courses use their max
    "difficulty": 1-5,          # inferred from course level (1xxx=2, 2xxx=3, etc.)
    "prerequisites": [          # ALL of these must be satisfied before enrollment
      "DEPT NNNN", ...
    ],
    "prerequisites_any": [      # OPTIONAL; only present when the catalog lists alternatives
      ["DEPT AAAA", "DEPT BBBB"],   # need at least ONE from this group
      ...                           # AND at least ONE from every other group
    ]
  }
}

Prerequisite parsing rules (in order of precedence)
----------------------------------------------------
1. "Instructor's permission", "equivalent", ACT/placement scores, standing text
   → not a course; ignored
2. "CC 5113 - Counseling Theory"  → name annotation stripped; yields "CC 5113"
3. "A and B"                      → both required → prerequisites: [A, B]
4. "A or B" / "A, B, or C"       → any one satisfies → prerequisites_any: [[A,B,...]]
5. "A and either B or C"          → A required, (B or C) any-one
                                  → prerequisites: [A], prerequisites_any: [[B,C]]
6. "A and B, or C and D"          → major OR between two AND-groups
                                  → prerequisites_any: [[A,C],[B,D]]  (conservative)
7. "Prerequisite(s) or Corequisite(s): X" → treated as a hard prerequisite
"""

import re
import json
import os

# ---------------------------------------------------------------------------
# Regex helpers
# ---------------------------------------------------------------------------

# Matches a course code like "ACCT 2103" or "BIOL 3512"
COURSE_CODE_RE = re.compile(r'\b([A-Z]{2,5})\s+(\d{3,4}[A-Z]?)\b')

# Matches the start of a course block: "DEPT NNNN - Course Name"
BLOCK_HEADER_RE = re.compile(
    r'^([A-Z]{2,5})\s+(\d{3,4}[A-Z]?)\s*[-\u2013]\s*(.+)$',
    re.MULTILINE,
)

# Matches credit hour lines
CREDIT_HOURS_RE = re.compile(r'(\d+)(?:\s+to\s+(\d+))?\s+Credit\s+Hour', re.IGNORECASE)

# Prerequisite line (also matches "Prerequisite(s) or Corequisite(s):")
PREREQ_LINE_RE = re.compile(
    r'Prerequisite\(s\)(?:\s+or\s+Corequisite\(s\))?\s*:\s*(.+)',
    re.IGNORECASE,
)

# Phrases that never contain a course code worth scheduling
IGNORE_PHRASES_RE = re.compile(
    r"instructor'?s?\s+permission|"
    r"\bequivalent\b|"
    r"\bplacement\b|"
    r"\bACT\b|"
    r"\bstanding\b|"
    r"program\s+chair|"
    r"department|"
    r"sophomore|junior|senior|freshman|"
    r"completion\s+of\s+all|"
    r"consent|"
    r"special\s+admission|"
    r"higher\s+math",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def extract_codes(text: str) -> list[str]:
    """Return all course codes found in text, in order."""
    return [f"{m.group(1)} {m.group(2)}" for m in COURSE_CODE_RE.finditer(text)]


def strip_name_annotations(text: str) -> str:
    """
    Remove inline name annotations that follow course codes.
    e.g. "CC 5113 - Counseling Theory and CC 5213 - Ethnicity..."
       → "CC 5113 and CC 5213"
    """
    # Replace "CODE - Some Title" with just "CODE" when the dash is a name annotation.
    # We do this by replacing dashes that are preceded by a course code and followed
    # by text that does NOT look like another course code.
    return re.sub(
        r'(\b[A-Z]{2,5}\s+\d{3,4}[A-Z]?)\s*-\s*(?![A-Z]{2,5}\s+\d)[^,\n;]+',
        r'\1',
        text,
    )


def infer_difficulty(code: str) -> int:
    """Infer 1–5 difficulty from the first digit of the course number."""
    m = re.search(r'(\d)', code)
    if not m:
        return 3
    level = int(m.group(1))
    return {0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 5}.get(level, 3)


def parse_credit_hours(block_text: str) -> int:
    """Extract credit hours; for variable-credit courses return the maximum."""
    m = CREDIT_HOURS_RE.search(block_text)
    if not m:
        return 3
    return int(m.group(2) or m.group(1))


# ---------------------------------------------------------------------------
# Prerequisite parser
# ---------------------------------------------------------------------------

def _parse_single_segment(text: str) -> tuple[list[str], list[list[str]]]:
    """
    Parse one semicolon-delimited segment of a prerequisite string.
    Returns (prereq_all, prereq_any) for that segment.
    """
    def remove_noise_segments_from_or_list(segments):
        good = []
        for seg in segments:
            seg = seg.strip().strip(',').strip()
            if IGNORE_PHRASES_RE.search(seg) and not extract_codes(seg):
                continue
            good.append(seg)
        return good

    has_and       = bool(re.search(r'\band\b',    text, re.IGNORECASE))
    has_comma_or  = bool(re.search(r',\s*or\b',   text, re.IGNORECASE))
    has_plain_or  = bool(re.search(r'\bor\b',     text, re.IGNORECASE))

    # ---- Case 1: pure AND, no OR ----------------------------------------
    if has_and and not has_plain_or:
        parts = re.split(r'\s+and\s+', text, flags=re.IGNORECASE)
        return [c for p in parts for c in extract_codes(p)], []

    # ---- Case 2: pure OR (no AND) ----------------------------------------
    if not has_and and has_plain_or:
        segments = re.split(r',\s*or\s+|,\s+|\s+or\s+', text, flags=re.IGNORECASE)
        segments = remove_noise_segments_from_or_list(segments)
        codes = [c for seg in segments for c in extract_codes(seg)]
        if len(codes) == 1:
            return codes, []
        if len(codes) > 1:
            return [], [codes]
        return [], []

    # ---- Case 3: mixed AND + OR ------------------------------------------
    major_or_match = re.search(r',\s+or\s+', text, re.IGNORECASE)
    if major_or_match:
        left  = text[:major_or_match.start()]
        right = text[major_or_match.end():]
        left_codes  = extract_codes(left)
        right_codes = extract_codes(right)
        if left_codes and right_codes:
            max_len = max(len(left_codes), len(right_codes))
            left_codes  += left_codes[-1:]  * (max_len - len(left_codes))
            right_codes += right_codes[-1:] * (max_len - len(right_codes))
            return [], [[l, r] for l, r in zip(left_codes, right_codes)]
        all_codes = extract_codes(text)
        return ([], [all_codes]) if len(all_codes) > 1 else (all_codes, [])

    # Standard mixed: split by "and", check each part for "or"
    and_parts = re.split(r'\s+and\s+', text, flags=re.IGNORECASE)
    prereq_all: list[str] = []
    prereq_any: list[list[str]] = []
    for part in and_parts:
        part = part.strip()
        part = re.sub(r'^either\s+', '', part, flags=re.IGNORECASE)
        if re.search(r'\bor\b', part, re.IGNORECASE):
            segments = re.split(r',\s*or\s+|,\s+|\s+or\s+', part, flags=re.IGNORECASE)
            segments = remove_noise_segments_from_or_list(segments)
            codes = [c for seg in segments for c in extract_codes(seg)]
            if len(codes) == 1:
                prereq_all.extend(codes)
            elif len(codes) > 1:
                prereq_any.append(codes)
        else:
            prereq_all.extend(extract_codes(part))
    return prereq_all, prereq_any


def parse_prereq_line(raw: str) -> tuple[list[str], list[list[str]]]:
    """
    Parse a raw prerequisite string into:
      (prerequisites_all, prerequisites_any)

    prerequisites_all  – list of codes ALL required
    prerequisites_any  – list of groups; student needs ≥1 from each group

    Semicolons are treated as AND separators between requirement groups.
    """
    # Clean up
    text = raw.strip().rstrip('.')
    text = strip_name_annotations(text)
    text = re.sub(r'\s{2,}', ' ', text)

    # If the whole string is non-course text, bail out early
    if not extract_codes(text):
        return [], []

    # Semicolons act as AND separators between distinct requirement groups
    # e.g. "BIOL 1114, BIOL 1134, or BIOL 1144; ENGL 1113"
    #   → segment 1: "BIOL 1114, BIOL 1134, or BIOL 1144"  (any one)
    #   → segment 2: "ENGL 1113"                           (required)
    segments = [s.strip() for s in text.split(';') if s.strip()]

    combined_all: list[str] = []
    combined_any: list[list[str]] = []

    for seg in segments:
        seg_all, seg_any = _parse_single_segment(seg)
        combined_all.extend(seg_all)
        combined_any.extend(seg_any)

    return combined_all, combined_any


# ---------------------------------------------------------------------------
# Main parser
# ---------------------------------------------------------------------------

def parse_catalog(raw_text: str) -> dict:
    courses: dict = {}
    matches = list(BLOCK_HEADER_RE.finditer(raw_text))

    for i, match in enumerate(matches):
        dept   = match.group(1)
        num    = match.group(2)
        name   = match.group(3).strip()
        code   = f"{dept} {num}"

        # Text of the block (between this header and the next)
        start     = match.end()
        end       = matches[i + 1].start() if i + 1 < len(matches) else len(raw_text)
        block     = raw_text[start:end]

        credit_hours = parse_credit_hours(block)
        difficulty   = infer_difficulty(code)

        prereq_all: list[str] = []
        prereq_any: list[list[str]] = []

        prereq_match = PREREQ_LINE_RE.search(block)
        if prereq_match:
            raw_prereq = prereq_match.group(1).strip()
            # Skip if the line is entirely non-course text
            if not IGNORE_PHRASES_RE.fullmatch(raw_prereq.rstrip('.')):
                prereq_all, prereq_any = parse_prereq_line(raw_prereq)

        entry: dict = {
            "name":         name,
            "credit_hours": credit_hours,
            "difficulty":   difficulty,
            "prerequisites": prereq_all,
        }
        if prereq_any:
            entry["prerequisites_any"] = prereq_any

        courses[code] = entry

    return courses


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path  = os.path.join(script_dir, "needed_format.py")
    output_path = os.path.join(script_dir, "prerequisites.json")

    print(f"Reading:  {input_path}")
    with open(input_path, "r", encoding="utf-8") as f:
        raw = f.read()

    print("Parsing …")
    courses = parse_catalog(raw)
    print(f"Parsed {len(courses)} courses.")

    # Write output
    output = {
        "_metadata": {
            "description": "Per-course prerequisite, credit-hour, and difficulty data for EzGrad.",
            "source":      "Rogers State University Course Catalog (needed_format.py)",
            "generated_by":"parse_courses.py",
            "note":        "Re-run parse_courses.py to refresh this file from the raw catalog data.",
        }
    }
    output.update(courses)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"Written:  {output_path}")

    # Quick sanity check – print a sample
    sample_codes = ["ENGL 1113", "ENGL 1213", "ACCT 2203", "BIOL 3204", "BIOL 3214"]
    print("\nSample output:")
    for c in sample_codes:
        if c in courses:
            print(f"  {c}: {json.dumps(courses[c])}")
        else:
            print(f"  {c}: NOT FOUND")
