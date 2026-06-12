import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  if (!course) return null;

  const {
    id, title, thumbnail, teacherName, teacherId, skill, level, price, enrolledCount, rating
  } = course;

  const displayThumbnail = thumbnail || 'https://via.placeholder.com/300x200?text=No+Thumbnail';
  const displayTeacher = teacherName || teacherId || 'IELTS Expert';
  
  // Format price
  let displayPrice = 'Free';
  if (price > 0) {
    displayPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  // Get skill color class
  const skillClass = skill ? `skill-${skill.toLowerCase()}` : 'skill-general';

  return (
    <div className="card h-100 rounded-4 course-card-custom" data-testid={`course-card-${id || 'unknown'}`}>
      <Link to={`/learning/courses/${id}`} className="text-decoration-none text-dark d-flex flex-column h-100">
        
        {/* Thumbnail Wrapper */}
        <div className="course-card-img-wrapper" style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
          <img 
            src={displayThumbnail} 
            className="card-img-top course-card-img" 
            alt={title} 
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {/* Top Badges overlay */}
          <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
            <span className={`badge rounded-pill skill-badge ${skillClass}`}>
              {skill || 'General'}
            </span>
          </div>
          <div className="position-absolute top-0 end-0 m-3">
            <span className="badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 fw-semibold">
              <i className="bi bi-bullseye me-1 text-warning"></i> {level || 'Band 5.0+'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column p-4">
          
          <h5 className="card-title fw-bold mb-3 lh-base" style={{ fontSize: '1.15rem' }}>
            {title || 'Untitled Course'}
          </h5>
          
          <div className="d-flex align-items-center mb-4 mt-auto">
            <div 
              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
              style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
            >
              {displayTeacher.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="mb-0 small fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>Instructor</p>
              <p className="mb-0 fw-semibold" style={{ fontSize: '0.9rem' }}>{displayTeacher}</p>
            </div>
          </div>

          {/* Footer stats */}
          <div className="pt-3 border-top d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3 text-muted small fw-medium">
              <span>
                <i className="bi bi-people-fill text-primary me-1"></i>
                {enrolledCount || 0}
              </span>
              {rating && (
                <span>
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  {rating}
                </span>
              )}
            </div>
            
            <div className={`price-tag ${price === 0 || !price ? 'free-tag' : ''}`}>
              {displayPrice}
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
