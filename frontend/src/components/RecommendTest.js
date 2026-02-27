import React, { useEffect, useState } from 'react';

const DIFFICULTY_LABELS = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];

function RecommendTest() {
    const [degrees, setDegrees] = useState([]);
    const [degreeInput, setDegreeInput] = useState('');
    const [filteredDegrees, setFilteredDegrees] = useState([]);
    const [selectedDegree, setSelectedDegree] = useState('');

    const [courseInput, setCourseInput] = useState('');
    const [completedCourses, setCompletedCourses] = useState([]);

    const [maxHours, setMaxHours] = useState(15);

    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5002/api/degrees')
            .then(r => r.json())
            .then(data => setDegrees(data))
            .catch(() => setError('Could not load degrees from API (is the backend running on port 5002?)'));
    }, []);

    const handleDegreeInput = (e) => {
        const val = e.target.value;
        setDegreeInput(val);
        setSelectedDegree('');
        setFilteredDegrees(
            val.trim() ? degrees.filter(d => d.toLowerCase().includes(val.toLowerCase())) : []
        );
    };

    const pickDegree = (degree) => {
        setDegreeInput(degree);
        setSelectedDegree(degree);
        setFilteredDegrees([]);
    };

    const addCourse = () => {
        const code = courseInput.trim().toUpperCase();
        if (code && !completedCourses.includes(code)) {
            setCompletedCourses([...completedCourses, code]);
        }
        setCourseInput('');
    };

    const removeCourse = (code) => {
        setCompletedCourses(completedCourses.filter(c => c !== code));
    };

    const handleSubmit = async () => {
        const degree = selectedDegree || degreeInput.trim();
        if (!degree) { setError('Please select a degree.'); return; }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            const resp = await fetch('http://localhost:5001/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    degree,
                    completed_courses: completedCourses,
                    max_hours_per_semester: maxHours,
                }),
            });
            const data = await resp.json();
            if (!resp.ok || data.error) {
                setError(data.error || `HTTP ${resp.status}`);
            } else {
                setResult(data);
            }
        } catch (err) {
            setError('Request failed. Is the recommend server running on port 5001?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <h1 style={styles.title}>Recommendation Tester</h1>

            {/* Degree selector */}
            <section style={styles.card}>
                <label style={styles.label}>Degree Program</label>
                <div style={styles.autocompleteWrap}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Search degree..."
                        value={degreeInput}
                        onChange={handleDegreeInput}
                    />
                    {filteredDegrees.length > 0 && (
                        <ul style={styles.dropdown}>
                            {filteredDegrees.map((d, i) => (
                                <li key={i} style={styles.dropdownItem} onClick={() => pickDegree(d)}>
                                    {d}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {selectedDegree && (
                    <p style={styles.selected}>Selected: <strong>{selectedDegree}</strong></p>
                )}
            </section>

            {/* Completed courses */}
            <section style={styles.card}>
                <label style={styles.label}>Completed Courses</label>
                <div style={styles.row}>
                    <input
                        style={{ ...styles.input, flex: 1 }}
                        type="text"
                        placeholder="e.g. ENGL 1113"
                        value={courseInput}
                        onChange={e => setCourseInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCourse()}
                    />
                    <button style={styles.btnSecondary} onClick={addCourse}>Add</button>
                </div>
                <div style={styles.tagList}>
                    {completedCourses.map(code => (
                        <span key={code} style={styles.tag}>
                            {code}
                            <button style={styles.tagRemove} onClick={() => removeCourse(code)}>×</button>
                        </span>
                    ))}
                    {completedCourses.length === 0 && (
                        <span style={styles.muted}>None — plan will include all degree courses.</span>
                    )}
                </div>
            </section>

            {/* Max hours */}
            <section style={styles.card}>
                <label style={styles.label}>Max Credit Hours / Semester: <strong>{maxHours}</strong></label>
                <input
                    type="range"
                    min={1} max={21} step={1}
                    value={maxHours}
                    onChange={e => setMaxHours(Number(e.target.value))}
                    style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                    <span>1</span><span>21</span>
                </div>
            </section>

            {/* Submit */}
            <button style={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Loading...' : 'Generate Plan'}
            </button>

            {/* Error */}
            {error && <p style={styles.error}>{error}</p>}

            {/* Results */}
            {result && (
                <div>
                    <section style={styles.summary}>
                        <h2 style={{ margin: '0 0 8px' }}>{result.degree}</h2>
                        <div style={styles.statsRow}>
                            <Stat label="Total Courses" value={result.total_courses_in_degree} />
                            <Stat label="Completed" value={result.completed_count} />
                            <Stat label="Remaining" value={result.remaining_count} />
                            <Stat label="Semesters" value={result.semesters_to_graduate} />
                        </div>
                    </section>

                    {result.plan.map(sem => (
                        <section key={sem.semester} style={styles.semCard}>
                            <div style={styles.semHeader}>
                                <span>Semester {sem.semester}</span>
                                <span>{sem.total_hours} credit hours</span>
                            </div>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {['Code', 'Name', 'Hrs', 'Difficulty', 'Prerequisites'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sem.courses.map(c => (
                                        <tr key={c.code} style={styles.tr}>
                                            <td style={styles.td}><code>{c.code}</code></td>
                                            <td style={styles.td}>{c.name}</td>
                                            <td style={{ ...styles.td, textAlign: 'center' }}>{c.credit_hours}</td>
                                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                                <span style={{
                                                    ...styles.diffBadge,
                                                    background: diffColor(c.difficulty),
                                                }}>
                                                    {DIFFICULTY_LABELS[c.difficulty] || c.difficulty}
                                                </span>
                                            </td>
                                            <td style={{ ...styles.td, fontSize: 12 }}>
                                                {c.prerequisites.length > 0
                                                    ? c.prerequisites.join(', ')
                                                    : <span style={styles.muted}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div style={styles.stat}>
            <div style={styles.statValue}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
        </div>
    );
}

function diffColor(d) {
    return ['', '#4caf50', '#8bc34a', '#ffc107', '#ff9800', '#f44336'][d] || '#999';
}

const styles = {
    page:         { maxWidth: 900, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' },
    title:        { fontSize: 28, marginBottom: 20 },
    card:         { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 },
    label:        { display: 'block', fontWeight: 600, marginBottom: 8 },
    input:        { padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', width: '100%' },
    row:          { display: 'flex', gap: 8, marginBottom: 10 },
    autocompleteWrap: { position: 'relative' },
    dropdown:     { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 6, listStyle: 'none', margin: 0, padding: 0, zIndex: 10, maxHeight: 220, overflowY: 'auto' },
    dropdownItem: { padding: '8px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #eee' },
    selected:     { marginTop: 8, fontSize: 13, color: '#444' },
    tagList:      { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    tag:          { background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 16, padding: '4px 10px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
    tagRemove:    { background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#555', padding: 0, fontSize: 15 },
    muted:        { color: '#aaa', fontSize: 13 },
    btnPrimary:   { background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 15, cursor: 'pointer', marginBottom: 20 },
    btnSecondary: { background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '8px 14px', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' },
    error:        { color: '#c62828', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 6, padding: 12, marginBottom: 16 },
    summary:      { background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 8, padding: 20, marginBottom: 20 },
    statsRow:     { display: 'flex', gap: 24, flexWrap: 'wrap' },
    stat:         { textAlign: 'center' },
    statValue:    { fontSize: 28, fontWeight: 700, color: '#2e7d32' },
    statLabel:    { fontSize: 12, color: '#555' },
    semCard:      { border: '1px solid #ddd', borderRadius: 8, marginBottom: 16, overflow: 'hidden' },
    semHeader:    { background: '#1976d2', color: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 },
    table:        { width: '100%', borderCollapse: 'collapse' },
    th:           { textAlign: 'left', padding: '8px 12px', background: '#f5f5f5', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #ddd' },
    td:           { padding: '8px 12px', fontSize: 13, borderBottom: '1px solid #eee', verticalAlign: 'top' },
    tr:           {},
    diffBadge:    { color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
};

export default RecommendTest;
