import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getEnrollment, createEnrollment } from '../../services/courseLearning.service';
import EnrollmentCTA from '../../components/feature-course-learning/EnrollmentCTA';

const CourseDetailPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState(null);

  // Trong đồ án thực tế, userId sẽ được lấy từ AuthContext (Redux/Context API).
  // Ở đây mock tạm userId là 'u-001' để demo tính năng.
  const currentUserId = 'u-001'; 

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        // Chỉ call API kiểm tra enrollment nếu lấy được thông tin course
        if (courseData) {
          const enrollmentData = await getEnrollment(currentUserId, courseId);
          setEnrollment(enrollmentData);
        }
      } catch (err) {
        // EARS[Unwanted]: IF fetching fails, THE system SHALL show an error message.
        setError(err.message || 'An error occurred while fetching course details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // EARS[Event]: WHEN user clicks Join Course, THEN trigger enrollment flow.
  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const newEnrollment = await createEnrollment(currentUserId, courseId);
      setEnrollment(newEnrollment);
    } catch (err) {
      setError(err.message || 'Failed to enroll in the course.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // EARS[Event]: WHEN user clicks Continue Learning, THEN navigate to lesson page.
  const handleContinue = () => {
    // Điều hướng vào học bài học (thường sẽ tự vào bài đang học dở hoặc bài đầu tiên)
    navigate(`/learning/courses/${courseId}/lessons`);
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center" data-testid="loading-spinner">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm rounded-4" role="alert" data-testid="error-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  // EARS[State-driven]: IF course is not found, THEN display a 404/Empty state.
  if (!course) {
    return (
      <div className="container py-5 text-center" data-testid="empty-state">
        <i className="bi bi-x-circle fs-1 text-danger mb-3 d-block"></i>
        <h3 className="fw-bold">Course Not Found</h3>
        <p className="text-muted">The course you are looking for does not exist or has been removed.</p>
        <button className="btn btn-outline-primary rounded-pill mt-3 px-4" onClick={() => navigate('/learning/courses')}>
          Browse other courses
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-5">
        {/* Main Content Area */}
        <div className="col-lg-8">
          <img 
            src={course.thumbnail || 'https://via.placeholder.com/800x400?text=Course+Thumbnail'} 
            alt={course.title} 
            className="img-fluid rounded-4 shadow-sm mb-4 w-100" 
            style={{ objectFit: 'cover', maxHeight: '400px' }}
          />
          
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-secondary rounded-pill me-2 px-3 py-2">{course.level || 'Beginner'}</span>
            <span className="badge bg-info rounded-pill px-3 py-2 text-dark">{course.skill || 'General'}</span>
          </div>

          <h1 className="fw-bold mb-3 display-5">{course.title}</h1>
          <p className="text-muted mb-4 fs-5">
            <i className="bi bi-person-fill me-2 text-primary"></i> 
            Instructor: <span className="fw-semibold text-dark">{course.teacherName || course.teacherId || 'Unknown'}</span>
          </p>

          <hr className="mb-4" />

          <h4 className="fw-bold mb-3">About this course</h4>
          <div className="text-secondary lh-lg mb-5 fs-6" style={{ whiteSpace: 'pre-wrap' }}>
            {course.description || 'No description available for this course.'}
          </div>

          <h4 className="fw-bold mb-3">Syllabus Highlights</h4>
          <ul className="list-group list-group-flush mb-4 rounded-4 shadow-sm">
            <li className="list-group-item py-3 bg-light border-0 mb-1 rounded-3">
              <i className="bi bi-check2-circle text-success me-3 fs-5"></i> Comprehensive understanding of the test format
            </li>
            <li className="list-group-item py-3 bg-light border-0 mb-1 rounded-3">
              <i className="bi bi-check2-circle text-success me-3 fs-5"></i> Proven strategies for high band scores
            </li>
            <li className="list-group-item py-3 bg-light border-0 rounded-3">
              <i className="bi bi-check2-circle text-success me-3 fs-5"></i> Practice with real exam questions
            </li>
          </ul>
        </div>

        {/* Sticky Sidebar Area */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '2rem', zIndex: 10 }}>
            <div className="card-body p-4 text-center">
              <h2 className="fw-bold mb-4 text-primary">
                {course.price === 0 || !course.price ? 'Free' : `$${course.price}`}
              </h2>
              
              <div className="d-grid gap-2 mb-4">
                <EnrollmentCTA 
                  courseId={course.id}
                  enrollment={enrollment}
                  isLoading={isEnrolling}
                  onEnroll={handleEnroll}
                  onContinue={handleContinue}
                />
              </div>

              <div className="d-flex justify-content-around text-muted small mt-4 pt-3 border-top">
                <div className="text-center">
                  <i className="bi bi-people-fill d-block fs-3 mb-1 text-secondary"></i>
                  {course.enrolledCount || 0} enrolled
                </div>
                <div className="text-center">
                  <i className="bi bi-star-fill text-warning d-block fs-3 mb-1"></i>
                  {course.rating || 'N/A'} rating
                </div>
                <div className="text-center">
                  <i className="bi bi-clock-history d-block fs-3 mb-1 text-secondary"></i>
                  Lifetime access
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
