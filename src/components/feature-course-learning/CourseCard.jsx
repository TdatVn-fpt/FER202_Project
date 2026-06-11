import React from 'react';
import { Link } from 'react-router-dom';

// EARS[State-driven]: WHILE course data is loading or rendered, THE system SHALL display course preview information safely.
const CourseCard = ({ course }) => {
  if (!course) {
    // EARS[Unwanted]: WHERE course object is null or undefined, THE system SHALL render a safe empty state or null to prevent crash.
    return null;
  }

  const {
    id,
    title,
    thumbnail,
    teacherName, // Giả định component cha truyền vào sau khi join với users
    teacherId,
    skill,
    level,
    price,
    isPremium,
    enrolledCount,
    rating
  } = course;

  // Xử lý Fallbacks cho các trường hợp thiếu dữ liệu (Unwanted cases)
  const displayThumbnail = thumbnail || 'https://via.placeholder.com/300x200?text=No+Thumbnail';
  const displayTeacher = teacherName || teacherId || 'Unknown Teacher';
  const displayPrice = (price === 0 || !price) ? 'Free' : `$${price}`;

  return (
    <div className="card h-100 shadow-sm rounded-4 border-0 overflow-hidden" data-testid={`course-card-${id || 'unknown'}`}>
      {/* EARS[State-driven]: WHILE thumbnail is missing, THE system SHALL use a fallback image. */}
      <img 
        src={displayThumbnail} 
        className="card-img-top" 
        alt={title || 'Course thumbnail'} 
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          {/* Badge Level */}
          <span className="badge bg-secondary rounded-pill">{level || 'Beginner'}</span>
          {/* Badge Price */}
          <span className={`badge ${isPremium ? 'bg-warning text-dark' : 'bg-success'} rounded-pill`}>
            {displayPrice}
          </span>
        </div>
        
        <h5 className="card-title fw-bold text-truncate" title={title || 'Untitled Course'}>
          {title || 'Untitled Course'}
        </h5>
        
        <p className="card-text text-muted small mb-3">
          <i className="bi bi-person-fill me-1"></i> {displayTeacher}
          <br/>
          <i className="bi bi-book-fill me-1"></i> {skill || 'General'}
        </p>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            <i className="bi bi-people-fill me-1"></i> {enrolledCount || 0} enrolled
          </span>
          {rating && (
            <span className="text-warning small fw-bold">
              <i className="bi bi-star-fill me-1"></i> {rating}
            </span>
          )}
        </div>
        
        <Link to={`/learning/courses/${id}`} className="btn btn-primary w-100 mt-3 rounded-pill fw-semibold">
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
