import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrollmentsByUser, getCourseById } from '../../services/courseLearning.service';
import { getCurrentUser } from '../../services/authService';
import './MyCoursesPage.css';

/**
 * MyCoursesPage — CL-05
 * EARS[Ubiquitous]: THE system SHALL protect this route via ProtectedRoute role='student'.
 */
const MyCoursesPage = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  // Dùng id của user đang đăng nhập, fallback về u-001 nếu cần
  const userId = user?.id || 'u-001';

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchMyCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Re-fetch user từ server theo email để tránh localStorage bị stale
        let resolvedUserId = userId;
        if (user?.email) {
          try {
            const res = await fetch(`http://localhost:9999/users?email=${encodeURIComponent(user.email)}`);
            const freshUsers = await res.json();
            if (freshUsers.length > 0) {
              resolvedUserId = freshUsers[0].id;
              // Cập nhật localStorage nếu id thay đổi
              if (resolvedUserId !== user.id) {
                const { saveAuthUser } = await import('../../services/authService');
                saveAuthUser({ ...user, ...freshUsers[0] });
              }
            }
          } catch (_) {
            // Nếu không fetch được thì dùng id cũ
          }
        }

        const enrollments = await getEnrollmentsByUser(resolvedUserId);
        const courseResults = await Promise.allSettled(
          enrollments.map((enr) => getCourseById(enr.courseId))
        );
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
        setError(err.message || 'Failed to load your courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyCourses();
  }, [userId]);

  const handleContinueLearning = (courseId) => {
    navigate(`/learning/courses/${courseId}/lessons`);
  };

  const getProgressStatus = (enrollment) => {
    if (enrollment.status === 'completed' || enrollment.progress === 100) return 'completed';
    if (enrollment.progress > 0) return 'inprogress';
    return 'notstarted';
  };

  const filteredCourses = enrolledCourses.filter(({ enrollment }) => {
    if (activeFilter === 'all') return true;
    return getProgressStatus(enrollment) === activeFilter;
  });

  const stats = {
    total: enrolledCourses.length,
    completed: enrolledCourses.filter(({ enrollment }) => getProgressStatus(enrollment) === 'completed').length,
    inprogress: enrolledCourses.filter(({ enrollment }) => getProgressStatus(enrollment) === 'inprogress').length,
  };

  if (isLoading) {
    return (
      <div className="my-courses-page">
        <div className="container py-5 text-center" data-testid="loading-spinner">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fw-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-courses-page">
        <div className="container py-5">
          <div className="alert alert-danger shadow-sm rounded-4 d-flex align-items-center gap-2" role="alert" data-testid="error-alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>
              <strong>Something went wrong.</strong> {error}
              <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="my-courses-page">
        <div className="container py-5 text-center" data-testid="empty-state">
          <div className="empty-state-icon mx-auto mb-4">
            <i className="bi bi-journal-bookmark"></i>
          </div>
          <h3 className="fw-bold mb-2">No courses yet</h3>
          <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            You haven't enrolled in any courses. Browse our catalog and start your IELTS journey!
          </p>
          <button className="btn btn-primary rounded-pill px-5 py-2 fw-semibold shadow-sm" onClick={() => navigate('/learning/courses')} data-testid="btn-browse-courses">
            <i className="bi bi-compass me-2"></i>Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-courses-page">
      <div className="container py-5">

        {/* ── Page Header ── */}
        <div className="row align-items-end mb-5">
          <div className="col">
            <p className="text-primary fw-semibold mb-1" style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              <i className="bi bi-mortarboard me-2"></i>Student Portal
            </p>
            <h2 className="fw-bolder mb-2" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>My Courses</h2>
            <p className="text-muted mb-0 fs-6">Track your progress and continue learning.</p>
          </div>
          <div className="col-auto">
            <button className="btn btn-outline-primary rounded-pill px-4 fw-semibold" onClick={() => navigate('/learning/courses')}>
              <i className="bi bi-plus-lg me-2"></i>Enroll More
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="row g-3 mb-5">
          {[
            { label: 'Total Enrolled', value: stats.total, icon: 'bi-collection', color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Completed', value: stats.completed, icon: 'bi-patch-check-fill', color: '#16a34a', bg: '#f0fdf4' },
            { label: 'In Progress', value: stats.inprogress, icon: 'bi-play-circle-fill', color: '#d97706', bg: '#fffbeb' },
          ].map(({ label, value, icon, color, bg }) => (
            <div className="col-12 col-sm-4" key={label}>
              <div className="stat-card p-4 rounded-4 d-flex align-items-center gap-3" style={{ background: bg }}>
                <div className="stat-icon rounded-3 d-flex align-items-center justify-content-center" style={{ background: color, color: '#fff', width: '48px', height: '48px', fontSize: '1.3rem', flexShrink: 0 }}>
                  <i className={`bi ${icon}`}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '1.8rem', lineHeight: 1, color }}>{value}</div>
                  <div className="text-muted fw-medium" style={{ fontSize: '0.82rem' }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="filter-tabs mb-4">
          {[
            { key: 'all', label: 'All Courses', count: stats.total },
            { key: 'inprogress', label: 'In Progress', count: stats.inprogress },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'notstarted', label: 'Not Started', count: stats.total - stats.completed - stats.inprogress },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              className={`filter-tab ${activeFilter === key ? 'active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
              <span className="tab-count">{count}</span>
            </button>
          ))}
        </div>

        {/* ── Course Cards ── */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-filter-circle fs-1 d-block mb-3 opacity-50"></i>
            <p className="fw-medium">No courses in this category.</p>
          </div>
        ) : (
          <div className="row g-4" data-testid="course-list">
            {filteredCourses.map(({ enrollment, course }) => {
              const progress = enrollment.progress ?? 0;
              const status = getProgressStatus(enrollment);

              const skillColorMap = {
                Reading: { bg: '#e0f2fe', text: '#0369a1' },
                Listening: { bg: '#f3e8ff', text: '#7e22ce' },
                Writing: { bg: '#ffedd5', text: '#c2410c' },
                Speaking: { bg: '#ecfdf5', text: '#047857' },
              };
              const skillStyle = skillColorMap[course.skill] || { bg: '#f1f5f9', text: '#475569' };

              return (
                <div className="col-12 col-md-6 col-xl-4" key={enrollment.id}>
                  <div className="course-card rounded-4 overflow-hidden" data-testid={`course-card-${course.id}`}>

                    {/* Thumbnail */}
                    <div className="course-thumb" style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                          <i className="bi bi-play-circle text-muted" style={{ fontSize: '3rem' }}></i>
                        </div>
                      )}
                      {/* Status Badge */}
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        {status === 'completed' && (
                          <span className="badge rounded-pill fw-semibold px-3 py-2" style={{ background: 'rgba(22,163,74,0.92)', color: '#fff', fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}>
                            <i className="bi bi-patch-check me-1"></i>Completed
                          </span>
                        )}
                        {status === 'inprogress' && (
                          <span className="badge rounded-pill fw-semibold px-3 py-2" style={{ background: 'rgba(217,119,6,0.92)', color: '#fff', fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}>
                            <i className="bi bi-play-fill me-1"></i>In Progress
                          </span>
                        )}
                        {status === 'notstarted' && (
                          <span className="badge rounded-pill fw-semibold px-3 py-2" style={{ background: 'rgba(71,85,105,0.85)', color: '#fff', fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}>
                            Not Started
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 d-flex flex-column gap-3" style={{ background: '#fff' }}>
                      {/* Tags */}
                      <div className="d-flex gap-2 flex-wrap">
                        {course.skill && (
                          <span className="badge rounded-pill fw-semibold" style={{ background: skillStyle.bg, color: skillStyle.text, fontSize: '0.75rem', padding: '5px 12px' }}>
                            {course.skill}
                          </span>
                        )}
                        {course.level && (
                          <span className="badge rounded-pill fw-medium" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '5px 12px' }}>
                            <i className="bi bi-bullseye me-1"></i>{course.level}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h5 className="fw-bold mb-0 lh-base" style={{
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '1.05rem'
                      }}>
                        {course.title}
                      </h5>

                      {/* Teacher */}
                      {course.teacherName && (
                        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '26px', height: '26px', fontSize: '0.7rem', flexShrink: 0 }}>
                            {course.teacherName.charAt(0)}
                          </div>
                          <span className="fw-medium">{course.teacherName}</span>
                        </div>
                      )}

                      {/* Progress */}
                      <div>
                        <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.82rem' }}>
                          <span className="text-muted fw-medium">Progress</span>
                          <span className="fw-bold" style={{ color: progress === 100 ? '#16a34a' : '#2563eb' }}>{progress}%</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: '7px', background: '#f1f5f9' }}>
                          <div
                            className="progress-bar rounded-pill"
                            role="progressbar"
                            style={{
                              width: `${progress}%`,
                              background: progress === 100 ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#2563eb,#60a5fa)',
                              transition: 'width 0.6s ease'
                            }}
                            aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"
                            data-testid={`progress-bar-${course.id}`}
                          />
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        className={`btn w-100 rounded-pill fw-semibold py-2 mt-1 ${progress === 100 ? 'btn-outline-success' : 'btn-primary'}`}
                        onClick={() => handleContinueLearning(course.id)}
                        data-testid={`btn-continue-${course.id}`}
                        style={{ fontSize: '0.9rem', letterSpacing: '0.2px' }}
                      >
                        {progress === 100 ? (
                          <><i className="bi bi-trophy me-2"></i>Review Course</>
                        ) : progress > 0 ? (
                          <><i className="bi bi-play-fill me-2"></i>Continue Learning</>
                        ) : (
                          <><i className="bi bi-rocket-takeoff me-2"></i>Start Learning</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
