import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { getCourseById, getEnrollment, createEnrollment } from '../../services/courseLearning.service';
import { getFlashcardCount } from '../../services/flashcardService';
import { getPaidPayment, getLatestPayment, formatVnd, PAYMENT_STATUS } from '../../services/paymentService';
import { getCurrentUser } from '../../services/authService';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [course, setCourse] = useState(null);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let ignore = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [courseData, fcCount] = await Promise.all([
          getCourseById(courseId),
          getFlashcardCount(courseId),
        ]);
        if (ignore) return;
        setCourse(courseData);
        setFlashcardCount(fcCount);

        if (user) {
          const [enr, paid, latest] = await Promise.all([
            getEnrollment(user.id, courseId).catch(() => null),
            getPaidPayment(user.id, courseId).catch(() => null),
            getLatestPayment(user.id, courseId).catch(() => null),
          ]);
          if (!ignore) {
            setEnrolled(Boolean(enr));
            setHasPaid(Boolean(paid));
            setPending(latest?.status === PAYMENT_STATUS.PENDING);
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Không tải được thông tin khóa học.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const isFree = !course?.price || course.price === 0;
  const canAccess = isFree || enrolled || hasPaid;

  const handleEnrollFree = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${courseId}` } } });
      return;
    }
    setEnrolling(true);
    setError('');
    try {
      const existing = await getEnrollment(user.id, courseId).catch(() => null);
      if (!existing) await createEnrollment(user.id, courseId);
      setEnrolled(true);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuy = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/checkout/${courseId}` } } });
      return;
    }
    navigate(`/checkout/${courseId}`);
  };

  const handleOpenFlashcards = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/learning/flashcards/${courseId}` } } });
      return;
    }
    navigate(`/learning/flashcards/${courseId}`);
  };

  if (loading) {
    return (
      <div className="cd-page bg-light">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3 mb-0">Đang tải thông tin khóa học...</p>
        </Container>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="cd-page bg-light">
        <Container className="py-5">
          <Alert variant="danger" className="text-center">{error}</Alert>
          <div className="text-center">
            <Button as={Link} to="/online-courses" variant="outline-secondary">
              ← Về danh sách khóa học
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="cd-page bg-light">
      {/* HERO */}
      <div className="cd-hero">
        <div className="cd-hero-overlay" />
        {course.thumbnail && (
          <img className="cd-hero-bg" src={course.thumbnail} alt="" aria-hidden="true" />
        )}
        <Container className="cd-hero-content">
          <Link to="/online-courses" className="cd-breadcrumb">← Tất cả khóa học</Link>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <Badge bg="light" text="dark" className="px-3 py-2">{course.skill}</Badge>
            <Badge bg={isFree ? 'success' : 'warning'} text={isFree ? undefined : 'dark'} className="px-3 py-2">
              {isFree ? 'Miễn phí' : 'Trả phí'}
            </Badge>
          </div>
          <h1 className="fw-bold display-6">{course.title}</h1>
          <p className="lead text-white-50 mb-3">{course.description}</p>
          <div className="d-flex gap-4 flex-wrap small">
            <span>⭐ {course.rating} đánh giá</span>
            <span>👥 {course.enrolledCount} học viên</span>
            <span>🗓️ {course.durationWeeks} tuần</span>
            <span>📊 {course.level}</span>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-4">
          {/* MAIN */}
          <Col lg={8}>
            {/* GIÁO TRÌNH */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h2 className="h4 fw-bold mb-3">Nội dung khóa học</h2>
                <ListGroup variant="flush">
                  {(course.syllabus || []).map((item, i) => (
                    <ListGroup.Item key={i} className="d-flex align-items-center gap-3 px-0">
                      <span className="cd-syllabus-num">{i + 1}</span>
                      <span>{item}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* FLASHCARD */}
            <Card className="border-0 shadow-sm cd-flashcard-promo">
              <Card.Body className="p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div>
                  <h2 className="h5 fw-bold mb-2">🎴 Flashcard từ vựng</h2>
                  <p className="mb-1 text-muted">
                    Khóa học này đi kèm <strong>{flashcardCount} thẻ từ vựng</strong> trọng tâm.
                    Học theo phương pháp lật thẻ chủ động để ghi nhớ nhanh và lâu hơn.
                  </p>
                  {!user && (
                    <p className="text-warning-emphasis small mb-0">🔒 Đăng nhập để bắt đầu học flashcard.</p>
                  )}
                </div>
                <Button
                  variant="dark"
                  className="flex-shrink-0 fw-semibold"
                  onClick={handleOpenFlashcards}
                  disabled={flashcardCount === 0}
                >
                  {flashcardCount === 0 ? 'Chưa có thẻ' : 'Học Flashcard ngay'}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* SIDEBAR */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm cd-sticky">
              <Card.Body className="p-4">
                <div className="h2 fw-bold mb-3">
                  {isFree ? <span className="text-success">Miễn phí</span> : formatVnd(course.price)}
                </div>

                {canAccess ? (
                  <>
                    <Alert variant="success" className="py-2 text-center fw-semibold mb-3">
                      ✓ Bạn đã có quyền truy cập
                    </Alert>
                    <Button variant="primary" className="w-100 fw-semibold mb-2" onClick={() => navigate('/learning/courses')}>
                      Vào học ngay
                    </Button>
                  </>
                ) : pending ? (
                  <>
                    <Alert variant="warning" className="py-2 text-center mb-3">
                      ⏳ Đơn của bạn đang <strong>chờ quản trị viên xác nhận</strong>.
                    </Alert>
                    <Button variant="outline-primary" className="w-100 fw-semibold mb-2" onClick={handleBuy}>
                      Xem trạng thái đơn
                    </Button>
                  </>
                ) : isFree ? (
                  <Button
                    variant="primary"
                    className="w-100 fw-semibold mb-2"
                    onClick={handleEnrollFree}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Đang đăng ký...' : 'Đăng ký miễn phí'}
                  </Button>
                ) : (
                  <Button variant="primary" className="w-100 fw-semibold mb-2" onClick={handleBuy}>
                    Mua khóa học
                  </Button>
                )}

                <Button
                  variant="outline-dark"
                  className="w-100 mb-3"
                  onClick={handleOpenFlashcards}
                  disabled={flashcardCount === 0}
                >
                  🎴 Học Flashcard ({flashcardCount})
                </Button>

                {error && <Alert variant="danger" className="small py-2">{error}</Alert>}

                <ListGroup variant="flush" className="cd-perks">
                  <ListGroup.Item className="px-0 border-0 py-1">✓ Truy cập trọn đời</ListGroup.Item>
                  <ListGroup.Item className="px-0 border-0 py-1">✓ {flashcardCount} thẻ từ vựng</ListGroup.Item>
                  <ListGroup.Item className="px-0 border-0 py-1">✓ Giáo viên: {course.teacherName}</ListGroup.Item>
                  <ListGroup.Item className="px-0 border-0 py-1">✓ Chứng nhận hoàn thành</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
