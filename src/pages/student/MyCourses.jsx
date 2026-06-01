import React from 'react';

export default function MyCourses() {
  const [courses] = React.useState([
    { id: 1, title: 'IELTS Listening', progress: 75 },
    { id: 2, title: 'IELTS Reading', progress: 60 },
    { id: 3, title: 'IELTS Writing', progress: 45 }
  ]);

  return (
    <div className="my-courses-page">
      <h1>My Courses</h1>
      <div className="courses-container">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <div className="progress-bar">
              <div className="progress" style={{width: `${course.progress}%`}}></div>
            </div>
            <p className="progress-text">{course.progress}% Complete</p>
            <button className="btn-primary-sm">Continue Learning</button>
          </div>
        ))}
      </div>
    </div>
  );
}
