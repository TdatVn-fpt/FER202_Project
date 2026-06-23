import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getEnrollment, createEnrollment } from '../../services/courseLearning.service';
import { getCurrentUser } from '../../services/authService';
import { getPaidPayment, getLatestPayment, PAYMENT_STATUS } from '../../services/paymentService';
import { addToCart, isInCart, subscribeCartChanges } from '../../services/cartService';
import { isInWishlist, addToWishlist, removeFromWishlist, subscribeWishlistChanges } from '../../services/wishlistService';
import './CourseDetailPage.css';

const WHAT_YOU_LEARN = [
  'Master all 4 IELTS skills: Reading, Listening, Writing, Speaking',
  'Proven band-score strategies used by 7.0+ scorers',
  'Full-length mock tests with detailed feedback',
  'Expert tips for time management under exam pressure',
  'Vocabulary and grammar essential for IELTS success',
  'Access to lesson recordings and study notes forever',
];

const INCLUDES = [
  { icon: 'bi-play-btn-fill', label: 'On-demand video lessons' },
  { icon: 'bi-file-earmark-text-fill', label: 'Downloadable resources' },
  { icon: 'bi-phone-fill', label: 'Mobile & desktop access' },
  { icon: 'bi-infinity', label: 'Lifetime access' },
  { icon: 'bi-patch-check-fill', label: 'Certificate of completion' },
];

const skillColorMap = {
  Reading:   { bg: '#e0f2fe', text: '#0369a1' },
  Listening: { bg: '#f3e8ff', text: '#7e22ce' },
  Writing:   { bg: '#ffedd5', text: '#c2410c' },
  Speaking:  { bg: '#ecfdf5', text: '#047857' },
};

const CourseDetailPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const storedUser = getCurrentUser();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Re-fetch user id from server to avoid stale localStorage
        let currentUserId = storedUser?.id || 'u-001';
        if (storedUser?.email) {
          try {
            const res = await fetch(`http://localhost:9999/users?email=${encodeURIComponent(storedUser.email)}`);
            const data = await res.json();
            if (data?.length > 0) currentUserId = data[0].id;
          } catch (_) {}
        }

        const courseData = await getCourseById(courseId);
        setCourse(courseData);
        if (courseData) {
          const enrollmentData = await getEnrollment(currentUserId, courseId);
          setEnrollment(enrollmentData);
          if (!courseData.price || courseData.price === 0) {
            setHasPaid(true);
            setPaymentPending(false);
          } else {
            const [paidPayment, latestPayment] = await Promise.all([
              getPaidPayment(currentUserId, courseId).catch(() => null),
              getLatestPayment(currentUserId, courseId).catch(() => null),
            ]);
            setHasPaid(Boolean(paidPayment));
            setPaymentPending(latestPayment?.status === PAYMENT_STATUS.PENDING);
          }
            // sync cart/wishlist initial state
            setInCart(isInCart(courseId));
            setWishlistAdded(isInWishlist(courseId));
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching course details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const handleCart = () => setInCart(isInCart(courseId));
    const handleWishlist = () => setWishlistAdded(isInWishlist(courseId));
    const unsubCart = subscribeCartChanges(handleCart);
    const unsubWishlist = subscribeWishlistChanges(handleWishlist);
    return () => {
      unsubCart();
      unsubWishlist();
    };
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course || course.price > 0) {
      navigate(`/checkout/${courseId}`);
      return;
    }

    setIsEnrolling(true);
    try {
      let currentUserId = storedUser?.id || 'u-001';
      if (storedUser?.email) {
        try {
          const res = await fetch(`http://localhost:9999/users?email=${encodeURIComponent(storedUser.email)}`);
          const data = await res.json();
          if (data?.length > 0) currentUserId = data[0].id;
        } catch (_) {}
      }
      const newEnrollment = await createEnrollment(currentUserId, courseId);
      setEnrollment(newEnrollment);
    } catch (err) {
      setError(err.message || 'Failed to enroll in the course.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinue = () => navigate(`/learning/courses/${courseId}/lessons`);

  const isFree = course?.price === 0 || !course?.price;
  const courseAccess = isFree || hasPaid;

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
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
        </div>
      </div>
    );
  }

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

  const skillStyle = skillColorMap[course.skill] || { bg: '#f1f5f9', text: '#475569' };
  const displayPrice = isFree ? 'Free' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price);

  return (
    <>
      {/* ── Hero Banner (dark gradient) ── */}
      <div className="course-detail-hero">
        <div className="container">
          <div className="row align-items-end">
            <div className="col-lg-8 pb-5">
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb mb-0" style={{ fontSize: '0.82rem', opacity: 0.7 }}>
                  <li className="breadcrumb-item"><span style={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/learning/courses')}>Course Catalog</span></li>
                  <li className="breadcrumb-item text-white active" aria-current="page">{course.skill || 'General'}</li>
                </ol>
              </nav>

              {/* Badges */}
              <div className="d-flex gap-2 flex-wrap mb-4">
                <span className="hero-badge" style={{ background: skillStyle.bg, color: skillStyle.text }}>
                  <i className="bi bi-book-fill"></i>{course.skill || 'General'}
                </span>
                <span className="hero-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}>
                  <i className="bi bi-bullseye"></i>{course.level || 'All Levels'}
                </span>
                {isFree && (
                  <span className="hero-badge" style={{ background: '#16a34a', color: '#fff' }}>
                    <i className="bi bi-gift-fill"></i>Free
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="hero-title mb-4">{course.title}</h1>

              {/* Stats */}
              <div className="hero-stats">
                {course.rating && (
                  <div className="hero-stat">
                    <i className="bi bi-star-fill text-warning"></i>
                    <span><strong>{course.rating}</strong> rating</span>
                  </div>
                )}
                <div className="hero-stat">
                  <i className="bi bi-people-fill" style={{ color: '#60a5fa' }}></i>
                  <span><strong>{course.enrolledCount || 0}</strong> students</span>
                </div>
                <div className="hero-stat">
                  <i className="bi bi-person-badge-fill" style={{ color: '#a78bfa' }}></i>
                  <span>Instructor: <strong>{course.teacherName || 'IELTS Expert'}</strong></span>
                </div>
              </div>
            </div>

            {/* Hero thumbnail (right) */}
            <div className="col-lg-4 d-none d-lg-block">
              <div className="thumbnail-wrapper">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/600x380?text=Course'}
                  alt={course.title}
                  style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="course-body" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="row g-5">

            {/* Left Content */}
            <div className="col-lg-8">

              {/* Mobile thumbnail */}
              <div className="d-lg-none mb-4">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/600x380?text=Course'}
                  alt={course.title}
                  className="rounded-4 w-100 shadow"
                  style={{ height: '220px', objectFit: 'cover' }}
                />
              </div>

              {/* What you'll learn */}
              <div className="bg-white p-4 rounded-4 shadow-sm mb-4" style={{ border: '1px solid #e2e8f0' }}>
                <h2 className="section-title">What you'll learn</h2>
                <ul className="learn-list">
                  {WHAT_YOU_LEARN.map((item, i) => (
                    <li key={i} className="learn-item">
                      <i className="bi bi-check2-circle check-icon"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* About this course */}
              <div className="bg-white p-4 rounded-4 shadow-sm mb-4" style={{ border: '1px solid #e2e8f0' }}>
                <h2 className="section-title">About this course</h2>
                <p className="text-secondary lh-lg" style={{ whiteSpace: 'pre-wrap', fontSize: '0.97rem' }}>
                  {course.description || 'No description available for this course.'}
                </p>
              </div>

              {/* This course includes */}
              <div className="bg-white p-4 rounded-4 shadow-sm mb-5" style={{ border: '1px solid #e2e8f0' }}>
                <h2 className="section-title">This course includes</h2>
                <div className="row g-3">
                  {INCLUDES.map(({ icon, label }) => (
                    <div key={label} className="col-sm-6">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: '#eff6ff', flexShrink: 0 }}>
                          <i className={`bi ${icon} text-primary`} style={{ fontSize: '1.1rem' }}></i>
                        </div>
                        <span className="fw-medium text-dark" style={{ fontSize: '0.92rem' }}>{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="col-lg-4">
              <div className="sidebar-card">
                {/* Price + CTA */}
                <div className="p-4">
                  <div className={`price-display mb-3 ${isFree ? 'free' : ''}`}>{displayPrice}</div>

                  {courseAccess ? (
                    <button className="cta-btn cta-btn-success mb-3" onClick={handleContinue} data-testid="btn-continue-learning">
                      <i className="bi bi-play-circle-fill me-2"></i>Continue Learning
                    </button>
                  ) : paymentPending ? (
                    <button className="cta-btn cta-btn-warning mb-3" onClick={() => navigate(`/checkout/${courseId}`)}>
                      <i className="bi bi-hourglass-split me-2"></i>Waiting for Payment Confirmation
                    </button>
                  ) : (
                    <button className="cta-btn cta-btn-primary mb-3" onClick={handleEnroll} disabled={isEnrolling} data-testid="btn-join-course">
                      {isEnrolling ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...</>
                      ) : (
                        <><i className="bi bi-rocket-takeoff-fill me-2"></i>{isFree ? 'Enroll for Free' : 'Buy Course'}</>
                      )}
                    </button>
                  )}

                  {/* Cart & Wishlist actions for paid courses */}
                  {!courseAccess && !isFree && (
                    <>
                      <button
                        className={`btn ${inCart ? 'btn-outline-secondary' : 'btn-primary'} w-100 fw-semibold mb-2`}
                        onClick={() => { if (!inCart) { addToCart(courseId); setInCart(true); navigate('/checkout'); } }}
                        disabled={inCart}
                      >
                        {inCart ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}
                      </button>
                      <button
                        className={`btn ${wishlistAdded ? 'btn-success' : 'btn-outline-secondary'} w-100 mb-3`}
                        onClick={() => {
                          if (wishlistAdded) removeFromWishlist(courseId);
                          else addToWishlist(courseId);
                          setWishlistAdded(!wishlistAdded);
                        }}
                      >
                        {wishlistAdded ? 'Đã lưu yêu thích' : 'Lưu vào yêu thích'}
                      </button>
                    </>
                  )}

                  {courseAccess && (
                    <button
                      className={`btn ${wishlistAdded ? 'btn-success' : 'btn-outline-secondary'} w-100 mb-3`}
                      onClick={() => {
                        if (wishlistAdded) removeFromWishlist(courseId);
                        else addToWishlist(courseId);
                        setWishlistAdded(!wishlistAdded);
                      }}
                    >
                      {wishlistAdded ? 'Đã lưu yêu thích' : 'Lưu vào yêu thích'}
                    </button>
                  )}

                  <p className="text-center text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-shield-check me-1 text-success"></i>
                    30-day money-back guarantee
                  </p>
                </div>

                {/* Meta grid */}
                <div className="sidebar-meta">
                  <div className="sidebar-meta-item">
                    <i className="bi bi-people-fill meta-icon text-primary"></i>
                    <span className="meta-value">{course.enrolledCount || 0}</span>
                    <span className="meta-label">Students</span>
                  </div>
                  <div className="sidebar-meta-item">
                    <i className="bi bi-star-fill meta-icon text-warning"></i>
                    <span className="meta-value">{course.rating || 'N/A'}</span>
                    <span className="meta-label">Rating</span>
                  </div>
                  <div className="sidebar-meta-item">
                    <i className="bi bi-bar-chart-fill meta-icon text-success"></i>
                    <span className="meta-value">{course.level || 'All'}</span>
                    <span className="meta-label">Level</span>
                  </div>
                  <div className="sidebar-meta-item">
                    <i className="bi bi-infinity meta-icon text-purple" style={{ color: '#8b5cf6' }}></i>
                    <span className="meta-value">Lifetime</span>
                    <span className="meta-label">Access</span>
                  </div>
                </div>

                {/* Share */}
                <div className="p-4 pt-3 text-center">
                  <button className="btn btn-outline-secondary btn-sm rounded-pill px-4" style={{ fontSize: '0.82rem' }}>
                    <i className="bi bi-share me-2"></i>Share this course
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;
