import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">2,450</p>
        </div>
        <div className="stat-card">
          <h3>Total Courses</h3>
          <p className="stat-value">156</p>
        </div>
        <div className="stat-card">
          <h3>Platform Revenue</h3>
          <p className="stat-value">$125,680</p>
        </div>
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <p className="stat-value">1,203</p>
        </div>
      </div>
    </div>
  );
}
