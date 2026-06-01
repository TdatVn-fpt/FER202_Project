import React from 'react';

export default function Dashboard() {
  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Courses Enrolled</h3>
          <p className="stat-value">3</p>
        </div>
        <div className="stat-card">
          <h3>Progress</h3>
          <p className="stat-value">65%</p>
        </div>
        <div className="stat-card">
          <h3>Lessons Completed</h3>
          <p className="stat-value">28</p>
        </div>
        <div className="stat-card">
          <h3>Quiz Score</h3>
          <p className="stat-value">8.5/10</p>
        </div>
      </div>
    </div>
  );
}
