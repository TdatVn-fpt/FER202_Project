import React, { useState, useEffect } from 'react';

export default function CourseList() {
  const [courses, setCourses] = useState([
    { id: 1, title: 'IELTS Listening Mastery', level: 'Beginner', students: 1200 },
    { id: 2, title: 'IELTS Reading Strategies', level: 'Intermediate', students: 890 },
    { id: 3, title: 'IELTS Writing Excellence', level: 'Advanced', students: 650 }
  ]);

  return (
    <div className="course-list-page">
      <div className="page-header">
        <h1>Available Courses</h1>
        <p>Choose from our comprehensive IELTS preparation courses</p>
      </div>
      
      <div className="courses-container">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p className="level-badge">{course.level}</p>
            <p>{course.students} students enrolled</p>
            <button className="btn-primary-sm">View Course</button>
          </div>
        ))}
      </div>
    </div>
  );
}
