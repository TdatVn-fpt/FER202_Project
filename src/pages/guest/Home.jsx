import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { getCurrentUser, getDashboardPathByRole } from '../../services/authService';
import './Home.css';

// Số liệu trung tính, phản ánh đúng quy mô đồ án (không phóng đại)
const stats = [
  { value: '4', label: 'kỹ năng được luyện tập đầy đủ trong mỗi khóa học' },
  { value: '6+', label: 'khóa học IELTS từ cơ bản đến nâng cao' },
  { value: '200+', label: 'thẻ flashcard từ vựng trọng tâm theo khóa' },
  { value: '100%', label: 'tài nguyên miễn phí để bạn thử sức trước' },
];

const skills = [
  {
    title: 'Listening',
    text: 'Rèn khả năng nghe hiểu tiếng Anh, theo dõi hội thoại và nắm bắt thông tin, quan điểm quan trọng.',
  },
  {
    title: 'Reading',
    text: 'Rèn khả năng hiểu ý chính, chi tiết và hàm ý qua nhiều dạng văn bản khác nhau.',
  },
  {
    title: 'Writing',
    text: 'Rèn khả năng sắp xếp ý tưởng, trả lời đúng yêu cầu và dùng từ vựng, ngữ pháp chính xác.',
  },
  {
    title: 'Speaking',
    text: 'Rèn khả năng giao tiếp rõ ràng, trôi chảy trong các tình huống hội thoại thực tế.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const coursesPath = user?.role === 'student' ? '/learning/courses' : '/online-courses';

  const preparationOptions = [
    {
      eyebrow: 'Khóa học • Có giảng viên',
      title: 'Khóa học IELTS chuyên sâu',
      lead: 'Học theo lộ trình',
      intro: 'Lộ trình bài bản cho từng mục tiêu band điểm:',
      bullets: [
        'Bám sát 4 kỹ năng Listening, Reading, Writing, Speaking',
        'Giáo trình chi tiết theo từng tuần',
        'Thanh toán nhanh bằng VietQR, truy cập trọn đời',
        'Kèm flashcard từ vựng trọng tâm cho mỗi khóa',
      ],
      bestFor: 'Phù hợp khi bạn muốn học có hệ thống và mục tiêu rõ ràng.',
      to: coursesPath,
      cta: 'Xem khóa học',
    },
    {
      eyebrow: 'Miễn phí',
      title: 'Tài nguyên luyện thi miễn phí',
      lead: 'Miễn phí',
      intro: 'Bắt đầu làm quen với IELTS mà không tốn chi phí:',
      bullets: [
        'Bài luyện tập theo từng kỹ năng',
        'Tài liệu và mẹo làm bài từ chuyên gia',
        'Trải nghiệm trước khi đăng ký khóa trả phí',
      ],
      bestFor: 'Phù hợp khi bạn mới bắt đầu và muốn thử sức.',
      to: '/courses',
      cta: 'Khám phá tài nguyên',
    },
    {
      eyebrow: 'Học từ vựng',
      title: 'Flashcard từ vựng IELTS',
      lead: 'Đi kèm mỗi khóa học',
      intro: 'Ghi nhớ từ vựng nhanh và lâu hơn:',
      bullets: [
        'Bộ thẻ từ vựng gắn riêng cho từng khóa học',
        'Học theo phương pháp lật thẻ chủ động',
        'Đánh dấu thẻ đã thuộc để theo dõi tiến độ',
      ],
      bestFor: 'Phù hợp khi bạn muốn mở rộng vốn từ mỗi ngày.',
      to: coursesPath,
      cta: 'Bắt đầu học từ',
    },
  ];

  useEffect(() => {
    // Redirect non-student users (like teacher, admin) to their dashboard automatically 
    // so they don't get stuck on the guest homepage.
    if (user && user.role !== 'student') {
      navigate(getDashboardPathByRole(user.role), { replace: true });
    }
  }, [navigate, user]);

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="home-hero text-white">
        <Container className="py-5">
          <Row className="align-items-center g-5 py-lg-4">
            <Col lg={6}>
              <Badge bg="light" text="dark" className="mb-3 px-3 py-2 rounded-pill text-uppercase">
                Luyện thi IELTS trực tuyến
              </Badge>
              <h1 className="display-5 fw-bold lh-sm mb-3">
                Chinh phục IELTS với lộ trình học thông minh
              </h1>
              <p className="fs-5 text-white-50 mb-4">
                Đạt band điểm mục tiêu cùng khóa học bài bản, tài nguyên miễn phí
                và flashcard từ vựng đi kèm.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} to={coursesPath} variant="light" size="lg" className="fw-semibold text-primary">
                  Khám phá khóa học
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg" className="fw-semibold">
                  Đăng ký miễn phí
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <img
                className="img-fluid rounded-4 shadow-lg"
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85"
                alt="Học viên đang luyện thi IELTS trực tuyến với tai nghe"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== HÌNH THỨC HỌC ===== */}
      <section className="py-5">
        <Container className="py-lg-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Hình thức luyện thi cho mọi mục tiêu</h2>
            <p className="fs-5 text-secondary mb-0 mx-auto" style={{ maxWidth: 720 }}>
              Chọn cách học phù hợp với thời gian và band điểm bạn nhắm tới, từ khóa học
              có giảng viên đến tài nguyên miễn phí và flashcard từ vựng.
            </p>
          </div>

          <Row className="g-4">
            {preparationOptions.map((option) => (
              <Col md={6} lg={4} key={option.title}>
                <Card className="h-100 shadow-sm border-0 home-option-card">
                  <Card.Body className="d-flex flex-column p-4">
                    <span className="text-primary fw-semibold text-uppercase small mb-2">
                      {option.eyebrow}
                    </span>
                    <Card.Title as="h3" className="h4 fw-bold mb-2">
                      {option.title}
                    </Card.Title>
                    <p className="fw-semibold text-dark mb-2">{option.lead}</p>
                    <p className="text-secondary mb-3">{option.intro}</p>
                    <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                      {option.bullets.map((bullet) => (
                        <li key={bullet} className="d-flex gap-2">
                          <span className="text-primary fw-bold">✓</span>
                          <span className="text-secondary">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-secondary fst-italic small mb-4">{option.bestFor}</p>
                    <Button
                      as={Link}
                      to={option.to}
                      variant="primary"
                      className="mt-auto align-self-start fw-semibold"
                    >
                      {option.cta}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ===== THỐNG KÊ ===== */}
      <section className="py-5 bg-light">
        <Container className="py-lg-3 text-center">
          <h2 className="fw-bold mb-5 mx-auto" style={{ maxWidth: 760 }}>
            IELTS là chứng chỉ tiếng Anh hàng đầu cho học tập, làm việc và định cư
          </h2>
          <Row className="g-4">
            {stats.map((item) => (
              <Col xs={6} lg={3} key={item.label}>
                <div className="display-5 fw-bold text-primary lh-1">{item.value}</div>
                <p className="text-secondary mt-3 mb-0 mx-auto" style={{ maxWidth: 220 }}>
                  {item.label}
                </p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ===== 4 KỸ NĂNG ===== */}
      <section className="py-5">
        <Container className="py-lg-3">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Tối đa điểm số ở cả bốn kỹ năng</h2>
            <p className="fs-5 text-secondary mb-0 mx-auto" style={{ maxWidth: 820 }}>
              Bài thi IELTS đánh giá khả năng nghe, đọc, viết và nói của bạn. Hãy luyện tập
              có trọng tâm cùng sự hỗ trợ từ chuyên gia để thể hiện tốt nhất ở từng kỹ năng.
            </p>
          </div>

          <Row className="g-4">
            {skills.map((skill) => (
              <Col md={6} key={skill.title}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <Card.Title as="h3" className="h4 fw-bold text-primary mb-2">
                      {skill.title}
                    </Card.Title>
                    <p className="text-secondary mb-0">{skill.text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <p className="text-secondary text-center mt-5 mx-auto" style={{ maxWidth: 900 }}>
            Lộ trình học sẽ tập trung vào những kỹ năng bạn cần cải thiện nhất, dựa trên
            trình độ và mục tiêu của bạn. Với hướng dẫn từ chuyên gia và luyện tập có trọng
            tâm, bạn sẽ tự tin nâng cao kết quả IELTS.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <Button as={Link} to={coursesPath} variant="primary" size="lg" className="fw-semibold">
              Xem tất cả khóa học
            </Button>
            <Button as={Link} to="/register" variant="outline-primary" size="lg" className="fw-semibold">
              Đăng ký miễn phí
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
