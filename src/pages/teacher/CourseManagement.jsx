import React from 'react';

export default function CourseManagement() {
  const [courses] = React.useState([
    { id: 1, title: 'IELTS Listening Mastery', students: 145 },
    { id: 2, title: 'IELTS Reading Strategies', students: 98 }
  ]);

  return (
    <div className="course-management-page">
      <h1>Course Management</h1>
      <button className="btn-primary">Create New Course</button>
      
      <div className="courses-list">
        {courses.map(course => (
          <div key={course.id} className="course-item">
            <h3>{course.title}</h3>
            <p>Students: {course.students}</p>
            <button className="btn-secondary-sm">Edit</button>
            <button className="btn-danger-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
