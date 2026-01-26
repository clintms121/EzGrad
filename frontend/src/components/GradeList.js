import React from 'react';
import GradeItem from './GradeItem';
import './GradeList.css';

const GradeList = ({ grades, onDeleteGrade }) => {
  if (!grades || grades.length === 0) {
    return (
      <div className="grade-list-empty">
        <p>No grades found. Add your first grade above!</p>
      </div>
    );
  }

  // Calculate overall statistics
  const totalGrades = grades.length;
  const averagePercentage = grades.reduce((sum, grade) => {
    const percentage = (grade.grade / grade.maxGrade) * 100;
    return sum + percentage;
  }, 0) / totalGrades;

  // Group grades by subject
  const gradesBySubject = grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = [];
    }
    acc[grade.subject].push(grade);
    return acc;
  }, {});

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#4caf50'; // Green
    if (percentage >= 80) return '#8bc34a'; // Light Green
    if (percentage >= 70) return '#ff9800'; // Orange
    if (percentage >= 60) return '#ff5722'; // Deep Orange
    return '#f44336'; // Red
  };

  return (
    <div className="grade-list">
      {/* Statistics Section */}
      <div className="statistics">
        <div className="stat-item">
          <div className="stat-number">{totalGrades}</div>
          <div className="stat-label">Total Grades</div>
        </div>
        <div className="stat-item">
          <div 
            className="stat-number"
            style={{ color: getGradeColor(averagePercentage) }}
          >
            {averagePercentage.toFixed(1)}%
          </div>
          <div className="stat-label">Average</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{Object.keys(gradesBySubject).length}</div>
          <div className="stat-label">Subjects</div>
        </div>
      </div>

      {/* Grades by Subject */}
      <div className="grades-by-subject">
        {Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
          const subjectAverage = subjectGrades.reduce((sum, grade) => {
            return sum + (grade.grade / grade.maxGrade) * 100;
          }, 0) / subjectGrades.length;

          return (
            <div key={subject} className="subject-group">
              <div className="subject-header">
                <h3 className="subject-name">{subject}</h3>
                <div className="subject-stats">
                  <span className="subject-count">{subjectGrades.length} grades</span>
                  <span 
                    className="subject-average"
                    style={{ color: getGradeColor(subjectAverage) }}
                  >
                    {subjectAverage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="grades-grid">
                {subjectGrades
                  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                  .map((grade, index) => (
                    <GradeItem
                      key={grade.id || `${subject}-${index}`}
                      grade={grade}
                      onDelete={onDeleteGrade}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GradeList;