import React from 'react';

export default function Profile() {
  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <div className="profile-info">
        <div className="profile-card">
          <h2>User Information</h2>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Email:</strong> john@example.com</p>
          <p><strong>Level:</strong> Intermediate</p>
          <p><strong>Joined:</strong> January 2024</p>
          <button className="btn-primary-sm">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
