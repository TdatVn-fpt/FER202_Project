import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { freeResources, RESOURCE_SKILLS } from '../../data/freeResources';
import './CourseList.css';

const skillVariant = {
  Reading: 'primary',
  Listening: 'info',
  Writing: 'success',
  Speaking: 'warning',
  Vocabulary: 'secondary',
  Grammar: 'danger',
};

export default function CourseList() {
  const [skill, setSkill] = useState('Tất cả');
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return freeResources.filter((item) => {
      const matchSkill = skill === 'Tất cả' || item.skill === skill;
      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.excerpt.toLowerCase().includes(keyword);
      return matchSkill && matchSearch;
    });
  }, [skill, search]);

  return (
    <div className="resource-page bg-light">
      {/* HERO */}
      <header className="resource-hero text-white">
        <Container className="py-5">
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <Badge bg="light" text="dark" className="mb-3 px-3 py-2 rounded-pill text-uppercase">
                Miễn phí 100%
              </Badge>
              <h1 className="display-5 fw-bold mb-3">Tài nguyên luyện thi IELTS miễn phí</h1>
              <p className="fs-5 mb-0 text-white-50">
                Tổng hợp bài hướng dẫn, mẹo làm bài và từ vựng cho cả 4 kỹ năng. Đọc thoải mái
                không cần đăng nhập, sẵn sàng cho lộ trình IELTS của bạn.
              </p>
            </Col>
          </Row>
        </Container>
      </header>

      <Container className="pb-5">
        {/* TOOLBAR */}
        <Card className="resource-toolbar border-0 shadow-sm">
          <Card.Body className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <div className="d-flex flex-wrap gap-2">
              {RESOURCE_SKILLS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={skill === s ? 'primary' : 'outline-secondary'}
                  className="rounded-pill px-3"
                  onClick={() => setSkill(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <InputGroup className="resource-search">
              <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
              <Form.Control
                className="border-start-0"
                placeholder="Tìm bài viết theo từ khóa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Card.Body>
        </Card>

        {/* GRID */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted py-5 mb-0">Không tìm thấy tài nguyên phù hợp.</p>
        ) : (
          <Row className="g-4 mt-1">
            {filtered.map((item) => (
              <Col key={item.id} md={6} lg={4}>
                <Card className="resource-card h-100 border-0 shadow-sm">
                  <Link to={`/resources/${item.id}`} className="resource-card-media">
                    <Card.Img variant="top" src={item.image} alt={item.title} loading="lazy" />
                    <Badge
                      bg={skillVariant[item.skill] || 'primary'}
                      className="resource-card-skill"
                    >
                      {item.skill}
                    </Badge>
                  </Link>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 small text-muted mb-2">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>⏱ {item.readingTime} phút đọc</span>
                    </div>
                    <Card.Title as="h3" className="fs-5 fw-bold mb-2">
                      <Link to={`/resources/${item.id}`} className="resource-card-title">
                        {item.title}
                      </Link>
                    </Card.Title>
                    <Card.Text className="text-muted small flex-grow-1">{item.excerpt}</Card.Text>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <span className="small text-muted">{item.level}</span>
                      <Button
                        as={Link}
                        to={`/resources/${item.id}`}
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-3"
                      >
                        Đọc bài →
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* CTA */}
        <Card className="resource-cta border-0 text-white text-center mt-5">
          <Card.Body className="py-5">
            <h2 className="fw-bold mb-2">Muốn luyện tập có lộ trình bài bản?</h2>
            <p className="mb-4 text-white-50">
              Khám phá khu luyện 4 kỹ năng tương tác hoặc các khóa học có giảng viên kèm cặp.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button as={Link} to="/skills" variant="light" className="fw-semibold px-4">
                Luyện 4 kỹ năng
              </Button>
              <Button as={Link} to="/online-courses" variant="outline-light" className="fw-semibold px-4">
                Xem khóa học
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
