import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { getWishlistItems, removeFromWishlist, subscribeWishlistChanges } from '../../services/wishlistService';
import { addToCart } from '../../services/cartService';
import { getCourseById } from '../../services/courseLearning.service';
import { getCurrentUser } from '../../services/authService';
import './CartCheckout.css';

export default function WishlistPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [courseIds, setCourseIds] = useState(getWishlistItems());
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const shoppingPath = user?.role === 'student' ? '/learning/courses' : '/online-courses';
  const totalPrice = useMemo(
    () => courses.reduce((sum, course) => sum + (course.price || 0), 0),
    [courses]
  );

  useEffect(() => {
    let ignore = false;
    const loadCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const results = await Promise.all(courseIds.map((id) => getCourseById(id)));
        if (!ignore) setCourses(results.filter(Boolean));
      } catch (err) {
        if (!ignore) setError(err.message || 'Không thể tải danh sách yêu thích.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadCourses();
    const unsubscribe = subscribeWishlistChanges(() => setCourseIds(getWishlistItems()));
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [courseIds]);

  const handleRemove = (courseId) => {
    removeFromWishlist(courseId);
    setCourseIds(getWishlistItems());
  };

  const handleMoveToCart = (courseId) => {
    addToCart(courseId);
    removeFromWishlist(courseId);
    setCourseIds(getWishlistItems());
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">Đang tải danh sách yêu thích...</p>
      </Container>
    );
  }

  return (
    <div className="checkout-page bg-light">
      <Container className="py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <span className="text-uppercase text-primary fw-semibold small">Yêu thích</span>
            <h1 className="h2 fw-bold mb-2">Danh sách yêu thích</h1>
            <p className="text-muted mb-0">Các khóa học bạn đã lưu để xem lại sau.</p>
          </div>
          <Button variant="outline-secondary" onClick={() => navigate(shoppingPath)}>
            Tiếp tục mua sắm
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {courses.length === 0 ? (
          <Card className="border-0 shadow-sm p-5 text-center">
            <Card.Body>
              <h4 className="fw-semibold">Danh sách yêu thích trống</h4>
              <p className="text-muted">Thêm khóa học vào yêu thích để lưu lại sau.</p>
              <Button as={Link} to={shoppingPath} variant="primary">
                Xem khóa học
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              {courses.map((course) => (
                <Card key={course.id} className="wishlist-course-card border-0 shadow-sm mb-4">
                  <Card.Body className="d-flex flex-column flex-lg-row align-items-center gap-4 p-4">
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/320x180'}
                      alt={course.title}
                      className="rounded"
                      style={{ width: 220, height: 140, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://via.placeholder.com/320x180?text=No+Image';
                      }}
                    />
                    <div className="flex-grow-1">
                      <h5 className="fw-semibold mb-2">{course.title}</h5>
                      <p className="text-muted mb-2">{course.skill || 'General'} • {course.level || 'All Levels'}</p>
                      <p className="text-primary fw-semibold mb-0">{course.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price) : 'Miễn phí'}</p>
                    </div>
                    <div className="d-flex flex-column align-items-stretch gap-2" style={{ minWidth: 160 }}>
                      <Button variant="outline-primary" className="w-100" onClick={() => handleMoveToCart(course.id)}>
                        Thêm vào giỏ
                      </Button>
                      <Button variant="outline-danger" className="w-100" onClick={() => handleRemove(course.id)}>
                        Xóa
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Col>

            <Col lg={4}>
              <Card className="wishlist-summary-card border-0 shadow-sm h-100" style={{ position: 'sticky', top: 100 }}>
                <Card.Body>
                  <h2 className="h5 fw-bold mb-3">Tổng quan yêu thích</h2>
                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>Khóa học đã lưu</span>
                    <strong>{courses.length}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-4 text-muted">
                    <span>Tổng giá trị</span>
                    <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</strong>
                  </div>
                  <Button variant="primary" className="w-100 mb-3" onClick={() => navigate(shoppingPath)}>
                    Tiếp tục duyệt khóa học
                  </Button>
                  <Button variant="outline-secondary" className="w-100" onClick={() => navigate('/checkout')}>
                    Xem giỏ hàng
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
