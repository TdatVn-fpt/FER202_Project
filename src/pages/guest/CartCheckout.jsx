import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartCheckout.css';
import { getCurrentUser } from '../../services/authService';
import { getCartItems, removeFromCart, subscribeCartChanges, clearCart } from '../../services/cartService';
import { getCourseById } from '../../services/courseLearning.service';
import { validateCoupon, calculateDiscount, getCouponMessage } from '../../services/couponService';
import { buildVietQrUrl, buildTransferContent, createPendingPayment, PAYMENT_STATUS, getLatestPayment, formatVnd } from '../../services/paymentService';

const FALLBACK = 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=600&q=80';

export default function CartCheckout() {
  const navigate     = useNavigate();
  const user         = getCurrentUser();
  const shoppingPath = user?.role === 'student' ? '/learning/courses' : '/online-courses';

  const [cartCourseIds, setCartCourseIds] = useState(getCartItems());
  const [courses,       setCourses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [couponCode,    setCouponCode]    = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError,   setCouponError]   = useState('');
  const [payment,       setPayment]       = useState(null);
  const [processing,    setProcessing]    = useState(false);
  const [error,         setError]         = useState('');

  const cartTotal      = useMemo(() => courses.reduce((s, c) => s + (c.price || 0), 0), [courses]);
  const discountAmount = useMemo(() => calculateDiscount(cartTotal, appliedCoupon), [cartTotal, appliedCoupon]);
  const payableAmount  = useMemo(() => Math.max(0, cartTotal - discountAmount), [cartTotal, discountAmount]);

  // Load courses (fixed: no infinite loop)
  useEffect(() => {
    if (cartCourseIds.length === 0) { setCourses([]); setLoading(false); return; }
    let ignore = false;
    setLoading(true); setError('');
    Promise.all(cartCourseIds.map(getCourseById))
      .then(res => { if (!ignore) setCourses(res.filter(Boolean)); })
      .catch(e  => { if (!ignore) setError(e.message || 'Không thể tải khóa học trong giỏ hàng'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [JSON.stringify(cartCourseIds)]);

  useEffect(() => {
    const unsub = subscribeCartChanges(() => setCartCourseIds(getCartItems()));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || cartCourseIds.length !== 1) return;
    getLatestPayment(user.id, cartCourseIds[0]).then(setPayment).catch(() => setPayment(null));
  }, [user, cartCourseIds]);

  const handleRemove = (id) => { removeFromCart(id); setCartCourseIds(getCartItems()); };
  const handleApplyCoupon = () => {
    const c = validateCoupon(couponCode);
    if (!c) { setCouponError('Mã coupon không hợp lệ.'); setAppliedCoupon(null); return; }
    setCouponError(''); setAppliedCoupon(c);
  };
  const handleCheckoutNow = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return; }
    if (!courses.length) { setError('Giỏ hàng đang trống.'); return; }
    setProcessing(true); setError('');
    try {
      const content = buildTransferContent(user.id, cartCourseIds.join(','));
      const created = await createPendingPayment({ userId: user.id, courseId: cartCourseIds.length === 1 ? cartCourseIds[0] : 'bundle', amount: payableAmount, transferContent: content });
      setPayment(created);
      if (cartCourseIds.length === 1) clearCart();
    } catch (e) { setError(e.message || 'Gửi yêu cầu thanh toán thất bại.'); }
    finally { setProcessing(false); }
  };

  if (!user) {
    return (
      <div className="ckp-page">
        <div className="ckp-hero">
          <div className="container ckp-hero-inner">
            <div className="ckp-hero-badge"><i className="bi bi-shield-lock-fill"></i> Bảo mật</div>
            <h1 className="ckp-hero-title">Bạn chưa <span>đăng nhập</span></h1>
            <p className="ckp-hero-sub">Đăng nhập để mua khóa học và sử dụng giỏ hàng.</p>
          </div>
        </div>
        <div className="container ckp-main">
          <div className="ckp-empty">
            <div className="ckp-empty-icon"><i className="bi bi-lock-fill"></i></div>
            <h4 className="fw-bold mb-2">Cần đăng nhập</h4>
            <p className="text-muted mb-4">Vui lòng đăng nhập để tiếp tục thanh toán.</p>
            <button className="ckp-checkout-btn" style={{ maxWidth: 240 }} onClick={() => navigate('/login')}>Đăng nhập ngay</button>
          </div>
        </div>
      </div>
    );
  }

  const qrUrl = payableAmount > 0
    ? buildVietQrUrl(payableAmount, buildTransferContent(user.id, cartCourseIds.join(',')))
    : null;

  return (
    <div className="ckp-page">
      {/* ── HERO ── */}
      <div className="ckp-hero">
        <div className="ckp-hero-orb o1"></div>
        <div className="ckp-hero-orb o2"></div>
        <div className="container ckp-hero-inner">
          <div className="ckp-hero-badge"><i className="bi bi-cart-check-fill"></i> Giỏ hàng</div>
          <h1 className="ckp-hero-title">Thanh Toán <span>Đơn Hàng</span></h1>
          <p className="ckp-hero-sub">Kiểm tra lại giỏ hàng và tiến hành thanh toán để bắt đầu học ngay.</p>
          <button className="ckp-continue-btn" onClick={() => navigate(shoppingPath)}>
            <i className="bi bi-arrow-left-circle"></i> Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <div className="container ckp-main">
        {error && <div className="alert alert-danger rounded-4 mb-4">{error}</div>}

        {loading ? (
          <div className="ckp-loading">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted fw-semibold">Đang tải giỏ hàng...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="ckp-empty">
            <div className="ckp-empty-icon"><i className="bi bi-cart-x"></i></div>
            <h4 className="fw-bold mb-2">Giỏ hàng trống</h4>
            <p className="text-muted mb-4">Thêm khóa học vào giỏ để tiến hành thanh toán.</p>
            <button className="ckp-checkout-btn" style={{ maxWidth: 240 }} onClick={() => navigate(shoppingPath)}>
              <i className="bi bi-compass-fill me-2"></i>Khám phá khóa học
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {/* LEFT */}
            <div className="col-lg-7">
              {/* Course list */}
              <div className="ckp-panel mb-4">
                <div className="ckp-panel-title">
                  <div className="ckp-panel-icon" style={{ background: 'linear-gradient(135deg,#2563eb,#60a5fa)' }}>
                    <i className="bi bi-journal-bookmark-fill"></i>
                  </div>
                  Khóa học trong giỏ ({courses.length})
                </div>
                {courses.map(course => (
                  <div className="ckp-course-item" key={course.id}>
                    <img
                      src={course.thumbnail || FALLBACK}
                      alt={course.title}
                      className="ckp-course-img"
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
                    />
                    <div className="ckp-course-info">
                      <h6 className="ckp-course-name">{course.title}</h6>
                      <p className="ckp-course-meta">{course.skill || 'General'} • {course.level || 'All Levels'}</p>
                      <div className="ckp-course-price">
                        {course.price > 0
                          ? formatVnd(course.price)
                          : <span className="ckp-course-free">Miễn phí</span>
                        }
                      </div>
                    </div>
                    <button className="ckp-remove-btn" onClick={() => handleRemove(course.id)} title="Xóa">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="ckp-panel">
                <div className="ckp-panel-title">
                  <div className="ckp-panel-icon" style={{ background: 'linear-gradient(135deg,#d97706,#fbbf24)' }}>
                    <i className="bi bi-tag-fill"></i>
                  </div>
                  Mã giảm giá
                </div>
                {couponError && <div className="alert alert-warning rounded-3 py-2 mb-3 small">{couponError}</div>}
                <div className="ckp-coupon-group">
                  <input
                    type="text"
                    className="ckp-coupon-input"
                    placeholder="Nhập mã coupon..."
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                  />
                  <button className="ckp-coupon-btn" onClick={handleApplyCoupon}>Áp dụng</button>
                </div>
                {appliedCoupon && (
                  <div className="alert alert-success rounded-3 py-2 mt-3 small mb-0">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {getCouponMessage(appliedCoupon)} → Giảm {formatVnd(discountAmount)}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — ORDER SUMMARY */}
            <div className="col-lg-5">
              <div className="ckp-panel ckp-summary">
                <div className="ckp-panel-title">
                  <div className="ckp-panel-icon" style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                    <i className="bi bi-receipt-cutoff"></i>
                  </div>
                  Tổng đơn hàng
                </div>
                <div className="ckp-summary-row">
                  <span>Tạm tính</span>
                  <strong>{formatVnd(cartTotal)}</strong>
                </div>
                {discountAmount > 0 && (
                  <div className="ckp-summary-row">
                    <span>Giảm giá</span>
                    <strong style={{ color: '#16a34a' }}>-{formatVnd(discountAmount)}</strong>
                  </div>
                )}
                <div className="ckp-summary-total">
                  <span className="ckp-total-label">Phải trả</span>
                  {payableAmount === 0
                    ? <span className="ckp-total-free">Miễn phí</span>
                    : <span className="ckp-total-value">{formatVnd(payableAmount)}</span>
                  }
                </div>

                <button
                  className="ckp-checkout-btn"
                  onClick={handleCheckoutNow}
                  disabled={processing}
                >
                  {processing
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang tạo đơn...</>
                    : <><i className="bi bi-lock-fill me-2"></i>Thanh toán ngay</>
                  }
                </button>
                <button className="ckp-back-btn" onClick={() => navigate(shoppingPath)}>
                  <i className="bi bi-arrow-left me-2"></i>Quay lại danh sách
                </button>

                {payment?.status === PAYMENT_STATUS?.PENDING && (
                  <div className="alert alert-warning rounded-3 mt-3 small mb-0">
                    <i className="bi bi-hourglass-split me-2"></i>Đơn đã tạo — đang chờ admin xác nhận.
                  </div>
                )}

                {payment && payment.status !== PAYMENT_STATUS?.PAID && qrUrl && (
                  <div className="mt-3 text-center">
                    <p className="text-muted small mb-2 fw-semibold">Quét mã QR để chuyển khoản</p>
                    <img src={qrUrl} alt="QR VietQR" className="img-fluid rounded-3 border" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
