import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrollmentsByUser, getCourseById } from '../../services/courseLearning.service';

// Mock userId — in production this comes from auth context/Redux store
const MOCK_USER_ID = 'u-001';

/**
 * MyCoursesPage — CL-05
 * Hiển thị danh sách khóa học mà Student đang enrolled,
 * kèm ProgressBar cho từng khóa và nút Continue Learning.
 *
 * EARS[Ubiquitous]: THE system SHALL protect this route via ProtectedRoute role='student'.
 * EARS[Event]: WHEN Student opens /learning/courses (my courses view),
 *   THE system SHALL fetch enrollments then map each to its course detail.
 */
const MyCoursesPage = () => {
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]); // [{enrollment, course}]
  const [isLoading, setIsLoading]             = useState(true);
  const [error, setError]                     = useState(null);

  // ── Fetch: enrollments → map to courses ──────────────────────────────────
  useEffect(() => {
    const fetchMyCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Step 1: Get all enrollments for this user
        // EARS[Event]: WHEN Student opens MyCoursesPage, fetch all enrollments.
        const enrollments = await getEnrollmentsByUser(MOCK_USER_ID);

        // Step 2: For each enrollment, fetch the matching course in parallel
        // EARS[Unwanted]: WHERE progress calculation receives invalid records,
        //   THE system SHALL recover gracefully (filter out null courses).
        const courseResults = await Promise.allSettled(
          enrollments.map((enr) => getCourseById(enr.courseId))
        );

        // Zip enrollment + course, skip any course that failed to load
        const combined = enrollments
          .map((enr, idx) => {
            const result = courseResults[idx];
            if (result.status === 'fulfilled' && result.value) {
              return { enrollment: enr, course: result.value };
            }
            return null;
          })
          .filter(Boolean);

        setEnrolledCourses(combined);
      } catch (err) {
        // EARS[Unwanted]: IF fetching fails, show recoverable error state.
        setError(err.message || 'Failed to load your courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  // ── Handler: Continue Learning ────────────────────────────────────────────
  // EARS[Event]: WHEN Student clicks Continue Learning,
  //   THE system SHALL navigate to the first incomplete lesson of that course.
  const handleContinueLearning = (courseId) => {
    navigate(`/learning/courses/${courseId}/lessons`);
  };

  // ── Derived: progress status label ────────────────────────────────────────
  const getStatusBadge = (enrollment) => {
    if (enrollment.status === 'completed') {
      return <span className="badge bg-success rounded-pill">Completed</span>;
    }
    if (enrollment.progress > 0) {
      return <span className="badge bg-warning text-dark rounded-pill">In Progress</span>;
    }
    return <span className="badge bg-secondary rounded-pill">Not Started</span>;
  };

  // ── Render: Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container py-5 text-center" data-testid="loading-spinner">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your courses...</p>
      </div>
    );
  }

  // ── Render: Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container py-5">
        <div
          className="alert alert-danger shadow-sm rounded-4 d-flex align-items-center gap-2"
          role="alert"
          data-testid="error-alert"
        >
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>
            <strong>Something went wrong.</strong> {error}
            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Empty State ───────────────────────────────────────────────────
  // EARS[State-driven]: WHILE course list has no results, show empty state.
  if (enrolledCourses.length === 0) {
    return (
      <div className="container py-5 text-center" data-testid="empty-state">
        <div
          className="mx-auto d-flex align-items-center justify-content-center rounded-circle bg-light mb-4"
          style={{ width: '96px', height: '96px' }}
        >
          <i className="bi bi-journal-bookmark text-primary" style={{ fontSize: '2.5rem' }}></i>
        </div>
        <h3 className="fw-semibold mb-2">No courses yet</h3>
        <p className="text-muted mb-4">
          You haven't enrolled in any courses. Browse our catalog and start learning!
        </p>
        <button
          className="btn btn-primary rounded-pill px-4"
          onClick={() => navigate('/learning/courses')}
          data-testid="btn-browse-courses"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  // ── Render: Course List ───────────────────────────────────────────────────
  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Courses</h2>
        <p className="text-muted mb-0">
          {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      {/* Course Cards */}
      <div className="row g-4" data-testid="course-list">
        {enrolledCourses.map(({ enrollment, course }) => {
          const progress = enrollment.progress ?? 0;

          return (
            <div className="col-12 col-md-6 col-xl-4" key={enrollment.id}>
              <div
                className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
                style={{ transition: 'box-shadow 0.2s' }}
                data-testid={`course-card-${course.id}`}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#eef0f3' }}>
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                      <i className="bi bi-play-circle text-muted" style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  {/* Status badge overlay */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    {getStatusBadge(enrollment)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body d-flex flex-column gap-2 p-4">
                  {/* Skill + Level tags */}
                  <div className="d-flex gap-2 flex-wrap">
                    {course.skill && (
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-normal rounded-pill px-2">
                        {course.skill}
                      </span>
                    )}
                    {course.level && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal rounded-pill px-2">
                        {course.level}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h5
                    className="fw-semibold mb-0"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.title}
                  </h5>

                  {/* Teacher */}
                  {course.teacherName && (
                    <p className="text-muted small mb-0">
                      <i className="bi bi-person me-1"></i>
                      {course.teacherName}
                    </p>
                  )}

                  {/* Spacer */}
                  <div className="flex-grow-1" />

                  {/* Progress Bar */}
                  {/* EARS[State-driven]: WHILE enrolled, show progress bar per course. */}
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Progress</span>
                      <span className="fw-semibold" data-testid={`progress-${course.id}`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar rounded-pill ${
                          progress === 100 ? 'bg-success' : 'bg-primary'
                        }`}
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        data-testid={`progress-bar-${course.id}`}
                      />
                    </div>
                  </div>

                  {/* Continue Learning Button */}
                  {/* EARS[Event]: WHEN Student clicks Continue Learning,
                        THE system SHALL navigate to the first incomplete lesson. */}
                  <button
                    className="btn btn-primary w-100 rounded-pill mt-2"
                    onClick={() => handleContinueLearning(course.id)}
                    data-testid={`btn-continue-${course.id}`}
                  >
                    {progress === 100 ? (
                      <>
                        <i className="bi bi-trophy me-1"></i> Review Course
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-fill me-1"></i> Continue Learning
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCoursesPage;
