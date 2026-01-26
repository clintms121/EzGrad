import React from 'react';
import './GradeItem.css';

const GradeItem = ({ grade, onDelete }) => {
  const percentage = ((grade.grade / grade.maxGrade) * 100).toFixed(1);
  
  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#4caf50'; // Green - A
    if (percentage >= 80) return '#8bc34a'; // Light Green - B
    if (percentage >= 70) return '#ff9800'; // Orange - C
    if (percentage >= 60) return '#ff5722'; // Deep Orange - D
    return '#f44336'; // Red - F
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this grade for "${grade.assignment}"?`)) {
      onDelete(grade.id);
    }
  };

  return (
    <div className="grade-item">
      <div className="grade-item-header">
        <div className="assignment-info">
          <h4 className="assignment-name">{grade.assignment}</h4>
          <span className="category-badge" data-category={grade.category}>
            {grade.category}
          </span>
        </div>
        <button className="delete-button" onClick={handleDelete} title="Delete grade">
          ✕
        </button>
      </div>
      
      <div className="grade-details">
        <div className="score-section">
          <div className="fraction">
            <span className="received">{grade.grade}</span>
            <span className="separator">/</span>
            <span className="total">{grade.maxGrade}</span>
          </div>
          
          <div 
            className="percentage"
            style={{ color: getGradeColor(percentage) }}
          >
            {percentage}%
          </div>
          
          <div 
            className="letter-grade"
            style={{ color: getGradeColor(percentage) }}
          >
            {getLetterGrade(percentage)}
          </div>
        </div>
        
        <div className="meta-info">
          <div className="date">{formatDate(grade.date)}</div>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getGradeColor(percentage)
          }}
        ></div>
      </div>
    </div>
  );
};

export default GradeItem;