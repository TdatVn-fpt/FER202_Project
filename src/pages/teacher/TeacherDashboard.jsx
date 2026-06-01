import React from 'react';

export default function TeacherDashboard() {
  return (
    <div className="teacher-dashboard">
      <h1>Teacher Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-value">342</p>
        </div>
        <div className="stat-card">
          <h3>Courses Created</h3>
          <p className="stat-value">12</p>
        </div>
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p className="stat-value">$5,240</p>
        </div>
        <div className="stat-card">
          <h3>Rating</h3>
          <p className="stat-value">4.8/5</p>
        </div>
      </div>
    </div>
  );
}
