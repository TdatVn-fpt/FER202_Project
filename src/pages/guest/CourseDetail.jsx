import React from 'react';
import { useParams } from 'react-router-dom';

export default function CourseDetail() {
  const { id } = useParams();

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <h1>IELTS Course: {id}</h1>
        <p className="course-subtitle">Comprehensive preparation for IELTS examination</p>
      </div>

      <div className="course-content">
        <div className="course-info">
          <h2>Course Overview</h2>
          <p>This course provides comprehensive preparation for the IELTS examination, covering all four skills: Listening, Reading, Writing, and Speaking.</p>
          
          <h2>What You'll Learn</h2>
          <ul>
            <li>Master IELTS listening strategies</li>
            <li>Improve reading comprehension</li>
            <li>Develop writing skills</li>
            <li>Build speaking confidence</li>
          </ul>

          <button className="btn-primary">Enroll Now</button>
        </div>
      </div>
    </div>
  );
}
