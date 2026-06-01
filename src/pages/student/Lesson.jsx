import React from 'react';
import { useParams } from 'react-router-dom';

export default function Lesson() {
  const { id } = useParams();

  return (
    <div className="lesson-page">
      <h1>Lesson {id}</h1>
      <div className="lesson-content">
        <h2>Lesson Title</h2>
        <p>Lesson content goes here</p>
        <div className="video-placeholder">
          <p>Video Player Placeholder</p>
        </div>
        <div className="lesson-actions">
          <button className="btn-primary-sm">Mark as Complete</button>
          <button className="btn-secondary-sm">Next Lesson</button>
        </div>
      </div>
    </div>
  );
}
