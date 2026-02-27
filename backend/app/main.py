"""
EzGrad — command-line entry point.

Usage
-----
python main.py

The CLI will prompt for:
  1. A degree program name
  2. A comma-separated list of already-completed course codes (optional)
  3. Max credit hours per semester (optional, default 15)

It then prints a semester-by-semester course plan to the terminal.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from recommend import recommend


def _print_plan(result: dict) -> None:
    print()
    print(f"Degree:               {result['degree']}")
    print(f"Total courses:        {result['total_courses_in_degree']}")
    print(f"Already completed:    {result['completed_count']}")
    print(f"Remaining:            {result['remaining_count']}")
    print(f"Semesters to finish:  {result['semesters_to_graduate']}")
    print()

    for semester in result["plan"]:
        print(f"--- Semester {semester['semester']}  ({semester['total_hours']} credit hours) ---")
        for course in semester["courses"]:
            prereq_str = ""
            if course["prerequisites"]:
                prereq_str = f"  [prereqs: {', '.join(course['prerequisites'])}]"
            print(f"  {course['code']:12s}  {course['name']:45s}  {course['credit_hours']} cr  difficulty {course['difficulty']}/5{prereq_str}")
        print()


def main() -> None:
    # --- Degree selection ---
    degree = input("Enter degree name (e.g. 'Accounting, A.A.'): ").strip()
    if not degree:
        print("No degree entered. Exiting.")
        return

    # --- Completed courses ---
    raw_completed = input(
        "Enter completed course codes separated by commas (or press Enter to skip): "
    ).strip()
    completed_courses = (
        [c.strip() for c in raw_completed.split(",") if c.strip()]
        if raw_completed
        else []
    )

    # --- Credit hour cap ---
    raw_hours = input("Max credit hours per semester (default 15): ").strip()
    try:
        max_hours = int(raw_hours) if raw_hours else 15
        if not (1 <= max_hours <= 30):
            raise ValueError
    except ValueError:
        print("Invalid value — using default of 15 hours per semester.")
        max_hours = 15

    # --- Run algorithm ---
    result = recommend(degree, completed_courses, max_hours)

    if "error" in result:
        print(f"\nError: {result['error']}")
        return

    _print_plan(result)


if __name__ == "__main__":
    main()
