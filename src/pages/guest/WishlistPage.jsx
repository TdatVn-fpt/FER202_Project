import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlistItems, removeFromWishlist, subscribeWishlistChanges } from '../../services/wishlistService';
import { addToCart } from '../../services/cartService';
import { getCourseById } from '../../services/courseLearning.service';
import { getCurrentUser } from '../../services/authService';
import './WishlistPage.css';

const FALLBACK = 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=600&q=80';

export default function WishlistPage() {
  const navigate     = useNavigate();
  const user         = getCurrentUser();
  const shoppingPath = user?.role === 'student' ? '/learning/courses' : '/online-courses';

  const [courseIds, setCourseIds] = useState(getWishlistItems());
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const totalPrice = useMemo(() =>
    courses.reduce((s, c) => s + (c.price || 0), 0), [courses]);

  const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  // Fix: separate subscription from data loading
  useEffect(() => {
    if (courseIds.length === 0) { setCourses([]); setLoading(false); return; }
    let ignore = false;
    setLoading(true); setError('');
    Promise.all(courseIds.map(getCourseById))
      .then(res => { if (!ignore) setCourses(res.filter(Boolean)); })
      .catch(e  => { if (!ignore) setError(e.message || 'Không thể tải danh sách yêu thích.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [JSON.stringify(courseIds)]);

  useEffect(() => {
    const unsub = subscribeWishlistChanges(() => setCourseIds(getWishlistItems()));
    return () => unsub();
  }, []);

  const handleRemove     = (id) => { removeFromWishlist(id); setCourseIds(getWishlistItems()); };
  const handleMoveToCart = (id) => { addToCart(id); removeFromWishlist(id); setCourseIds(getWishlistItems()); navigate('/checkout'); };

  return (
    <div className="wlp-page">
      {/* ── HERO ── */}
      <div className="wlp-hero">
        <div className="wlp-hero-orb o1"></div>
        <div className="wlp-hero-orb o2"></div>
        <div className="container wlp-hero-inner">
          <div className="wlp-hero-badge"><i className="bi bi-heart-fill"></i> Danh sách yêu thích</div>
          <h1 className="wlp-hero-title">Khóa Học <span>Yêu Thích</span></h1>
          <p className="wlp-hero-sub">Những khóa học bạn đã lưu lại — hãy đăng ký ngay khi sẵn sàng!</p>
          <button className="wlp-btn-ghost" onClick={() => navigate(shoppingPath)}>
            <i className="bi bi-compass-fill"></i> Tiếp tục khám phá
          </button>
        </div>
      </div>

      <div className="container wlp-main">
        {error && <div className="alert alert-danger rounded-4">{error}</div>}

        {loading ? (
          <div className="wlp-loading">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted fw-semibold">Đang tải danh sách yêu thích...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="wlp-empty">
            <div className="wlp-empty-icon"><i className="bi bi-heart"></i></div>
            <h4 className="fw-bold mb-2">Chưa có khóa học yêu thích</h4>
            <p className="text-muted mb-4">Thêm khóa học vào yêu thích để lưu lại và mua sau.</p>
            <Link to={shoppingPath} className="wlp-primary-btn">
              <i className="bi bi-compass-fill"></i> Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* ── COURSE LIST ── */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {courses.map(course => (
                  <div className="wlp-course-card" key={course.id}>
                    <div className="wlp-course-img-wrap">
                      <img
                        src={course.thumbnail || FALLBACK}
                        alt={course.title}
                        className="wlp-course-img"
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
                      />
                      {course.skill && (
                        <span className={`wlp-skill-badge skill-${course.skill.toLowerCase()}`}>{course.skill}</span>
                      )}
                    </div>

                    <div className="wlp-course-info">
                      <div className="wlp-course-meta">
                        {course.level && <span className="wlp-meta-tag">{course.level}</span>}
                        {course.rating > 0 && (
                          <span className="wlp-meta-tag"><i className="bi bi-star-fill text-warning me-1"></i>{course.rating}</span>
                        )}
                      </div>
                      <h5 className="wlp-course-title">{course.title}</h5>
                      <p className="wlp-course-teacher">
                        <i className="bi bi-person-circle me-1"></i>
                        {course.teacherName || course.teacherId || 'IELTS Expert'}
                      </p>
                      <div className="wlp-course-price">
                        {course.price > 0 ? fmt(course.price) : <span className="wlp-free">Miễn phí</span>}
                      </div>
                    </div>

                    <div className="wlp-course-actions">
                      <button className="wlp-btn-cart" onClick={() => handleMoveToCart(course.id)}>
                        <i className="bi bi-cart-plus-fill"></i> Thêm vào giỏ
                      </button>
                      <button className="wlp-btn-remove" onClick={() => handleRemove(course.id)}>
                        <i className="bi bi-trash-fill"></i> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SUMMARY SIDEBAR ── */}
            <div className="col-lg-4">
              <div className="wlp-summary sticky-top" style={{ top: '100px' }}>
                <div className="wlp-summary-header">
                  <i className="bi bi-heart-fill"></i> Tổng quan
                </div>
                <div className="wlp-summary-row">
                  <span>Khóa học đã lưu</span>
                  <strong>{courses.length}</strong>
                </div>
                <div className="wlp-summary-row">
                  <span>Tổng giá trị</span>
                  <strong>{fmt(totalPrice)}</strong>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0 16px' }} />
                <button className="wlp-primary-btn w-100 mb-2" onClick={() => navigate(shoppingPath)}>
                  <i className="bi bi-compass-fill"></i> Tiếp tục duyệt
                </button>
                <button className="wlp-ghost-btn w-100" onClick={() => navigate('/checkout')}>
                  <i className="bi bi-cart2"></i> Xem giỏ hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
