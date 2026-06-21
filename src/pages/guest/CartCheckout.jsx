import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import './CartCheckout.css';
import { getCurrentUser } from '../../services/authService';
import { getCartItems, removeFromCart, subscribeCartChanges, clearCart } from '../../services/cartService';
import { getCourseById } from '../../services/courseLearning.service';
import { validateCoupon, calculateDiscount, getCouponMessage } from '../../services/couponService';
import { buildVietQrUrl, buildTransferContent, createPendingPayment, PAYMENT_STATUS, getLatestPayment, formatVnd } from '../../services/paymentService';

export default function CartCheckout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [cartCourseIds, setCartCourseIds] = useState(getCartItems());
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const shoppingPath = user?.role === 'student' ? '/learning/courses' : '/online-courses';

  const cartTotal = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.price || 0), 0);
  }, [courses]);

  const discountAmount = useMemo(() => {
    return calculateDiscount(cartTotal, appliedCoupon);
  }, [cartTotal, appliedCoupon]);

  const payableAmount = useMemo(() => {
    return Math.max(0, cartTotal - discountAmount);
  }, [cartTotal, discountAmount]);

  useEffect(() => {
    let ignore = false;
    const loadCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const results = await Promise.all(cartCourseIds.map((id) => getCourseById(id)));
        if (!ignore) setCourses(results.filter(Boolean));
      } catch (err) {
        if (!ignore) setError(err.message || 'Không thể tải khóa học trong giỏ hàng');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadCourses();
    const unsubscribe = subscribeCartChanges(() => setCartCourseIds(getCartItems()));
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [cartCourseIds]);

  useEffect(() => {
    if (!user) return;
    const fetchPayment = async () => {
      try {
        const latest = await getLatestPayment(user.id, cartCourseIds[0]);
        setPayment(latest);
      } catch {
        setPayment(null);
      }
    };
    if (cartCourseIds.length === 1) {
      fetchPayment();
    }
  }, [user, cartCourseIds]);

  const handleRemove = (courseId) => {
    removeFromCart(courseId);
    setCartCourseIds(getCartItems());
  };

  const handleApplyCoupon = () => {
    const coupon = validateCoupon(couponCode);
    if (!coupon) {
      setCouponError('Mã coupon không hợp lệ. Vui lòng thử lại.');
      setAppliedCoupon(null);
      return;
    }
    setCouponError('');
    setAppliedCoupon(coupon);
  };

  const handleCheckoutNow = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (courses.length === 0) {
      setError('Giỏ hàng đang trống.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const transferContent = buildTransferContent(user.id, cartCourseIds.join(','));
      const created = await createPendingPayment({
        userId: user.id,
        courseId: cartCourseIds.length === 1 ? cartCourseIds[0] : 'bundle',
        amount: payableAmount,
        transferContent,
      });
      setPayment(created);
      if (cartCourseIds.length === 1) {
        clearCart();
      }
    } catch (err) {
      setError(err.message || 'Gửi yêu cầu thanh toán thất bại.');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="checkout-page bg-light">
        <Container className="py-5">
          <Card className="border-0 shadow-sm mx-auto text-center" style={{ maxWidth: 520 }}>
            <Card.Body className="p-5">
              <div className="ck-guard-icon mb-3">🔒</div>
              <h2 className="h4 fw-bold mb-2">Bạn cần đăng nhập</h2>
              <p className="text-muted mb-4">Đăng nhập để mua khóa học và sử dụng giỏ hàng.</p>
              <Button variant="primary" onClick={() => navigate('/login')} className="fw-semibold px-4">
                Đăng nhập ngay
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">Đang tải giỏ hàng...</p>
      </Container>
    );
  }

  const qrUrl = buildVietQrUrl(payableAmount, buildTransferContent(user.id, cartCourseIds.join(',')));

  return (
    <div className="checkout-page bg-light">
      <Container className="py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <span className="text-uppercase text-primary fw-semibold small">Giỏ hàng</span>
            <h1 className="h2 fw-bold mb-0">Thanh toán đơn hàng</h1>
          </div>
          <div className="text-end">
            <Button variant="outline-secondary" onClick={() => navigate(shoppingPath)}>
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {couponError && <Alert variant="warning">{couponError}</Alert>}

        <Row className="g-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h2 className="h5 fw-bold mb-4">Khóa học trong giỏ</h2>
                {courses.length === 0 ? (
                  <div className="text-center py-5 text-muted">Giỏ hàng trống. <br />
                    <Button variant="link" onClick={() => navigate(shoppingPath)}>Tiếp tục duyệt khóa học</Button>
                  </div>
                ) : (
                  courses.map((course) => (
                    <Card key={course.id} className="mb-3 shadow-sm border-0">
                      <Card.Body className="p-3 d-flex align-items-center gap-3">
                        <img src={course.thumbnail || 'https://via.placeholder.com/160x100'} alt={course.title} width={160} height={100} style={{ objectFit: 'cover', borderRadius: 8 }} />
                        <div className="flex-grow-1">
                          <h3 className="h6 fw-semibold mb-1">{course.title}</h3>
                          <p className="text-muted small mb-2">{course.skill || 'General'} • {course.level}</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="fw-semibold text-dark">{course.price ? formatVnd(course.price) : 'Miễn phí'}</div>
                            <div>
                              <Button size="sm" variant="outline-danger" className="me-2" onClick={() => handleRemove(course.id)}>
                                Xóa
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => navigate(user?.role === 'student' ? `/learning/courses/${course.id}` : `/courses/${course.id}`)}
                              >
                                Xem chi tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mt-4">
              <Card.Body>
                <h2 className="h5 fw-bold mb-3">Áp dụng mã giảm giá</h2>
                <div className="d-flex gap-2 flex-wrap">
                  <Form.Control
                    placeholder="Nhập mã coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="primary" onClick={handleApplyCoupon}>Áp dụng</Button>
                </div>
                {appliedCoupon && (
                  <Alert variant="success" className="mt-3 mb-0">
                    {getCouponMessage(appliedCoupon)} → Giảm {formatVnd(discountAmount)}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="border-0 shadow-sm h-100" style={{ position: 'sticky', top: 100 }}>
              <Card.Body>
                <h2 className="h5 fw-bold mb-4">Tổng đơn hàng</h2>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Tạm tính</span>
                  <strong>{formatVnd(cartTotal)}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Giảm giá</span>
                  <strong className="text-success">-{formatVnd(discountAmount)}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4 border-top pt-3">
                  <span className="fw-semibold">Phải trả</span>
                  <strong className="fs-5 text-primary">{formatVnd(payableAmount)}</strong>
                </div>
                <Button
                  variant="primary"
                  className="w-100 mb-3 py-2"
                  onClick={handleCheckoutNow}
                  disabled={processing || cartTotal === 0}
                >
                  {processing ? 'Đang tạo đơn...' : 'Thanh toán ngay'}
                </Button>
                <Button variant="outline-secondary" className="w-100 mb-3" onClick={() => navigate(shoppingPath)}>
                  Quay lại danh sách khóa học
                </Button>

                {payment && payment.status === PAYMENT_STATUS.PENDING && (
                  <Alert variant="warning" className="mt-2">
                    Đơn đã được tạo. Đang chờ admin xác nhận.
                  </Alert>
                )}

                {payment && payment.status !== PAYMENT_STATUS.PAID && (
                  <div className="mt-3 text-center">
                    <p className="text-muted mb-2">Quét mã QR để chuyển khoản</p>
                    <img src={qrUrl} alt="Mã QR VietQR" className="img-fluid rounded-3 border" />
                    <p className="text-muted small mt-3">Số tiền đã bao gồm giảm giá.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
