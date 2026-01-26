import React, { useState } from 'react';
import './AddGradeForm.css';

const AddGradeForm = ({ onAddGrade }) => {
  const [formData, setFormData] = useState({
    subject: '',
    assignment: '',
    grade: '',
    maxGrade: '',
    date: '',
    category: 'assignment'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.subject || !formData.assignment || !formData.grade || !formData.maxGrade) {
        alert('Please fill in all required fields');
        return;
      }

      const gradeNum = parseFloat(formData.grade);
      const maxGradeNum = parseFloat(formData.maxGrade);

      if (isNaN(gradeNum) || isNaN(maxGradeNum) || gradeNum < 0 || maxGradeNum <= 0 || gradeNum > maxGradeNum) {
        alert('Please enter valid grades (grade should be between 0 and max grade)');
        return;
      }

      await onAddGrade({
        ...formData,
        grade: gradeNum,
        maxGrade: maxGradeNum,
        percentage: ((gradeNum / maxGradeNum) * 100).toFixed(2)
      });

      // Reset form
      setFormData({
        subject: '',
        assignment: '',
        grade: '',
        maxGrade: '',
        date: '',
        category: 'assignment'
      });

      alert('Grade added successfully!');
    } catch (error) {
      console.error('Error adding grade:', error);
      alert('Failed to add grade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-grade-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Mathematics, English"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="assignment">Assignment *</label>
          <input
            type="text"
            id="assignment"
            name="assignment"
            value={formData.assignment}
            onChange={handleChange}
            placeholder="e.g., Midterm Exam, Quiz 1"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="grade">Grade Received *</label>
          <input
            type="number"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            placeholder="e.g., 85"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="maxGrade">Max Grade *</label>
          <input
            type="number"
            id="maxGrade"
            name="maxGrade"
            value={formData.maxGrade}
            onChange={handleChange}
            placeholder="e.g., 100"
            min="1"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
            <option value="homework">Homework</option>
            <option value="participation">Participation</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Grade'}
      </button>
    </form>
  );
};

export default AddGradeForm;