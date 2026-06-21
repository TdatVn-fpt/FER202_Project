import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Alert } from 'react-bootstrap';
import './SkillPractice.css';

// ============================================================
// LUYỆN 4 KỸ NĂNG (GUEST) — trang tương tác không cần đăng nhập
// Gồm: tổng quan 4 kỹ năng + bài Reading mini-quiz tự chấm điểm.
// ============================================================

const SKILLS = [
  {
    key: 'listening',
    name: 'Listening',
    icon: '🎧',
    variant: 'info',
    time: '~30 phút',
    parts: '4 phần • 40 câu',
    desc: 'Nghe hội thoại và độc thoại từ đời sống tới học thuật, điền thông tin và chọn đáp án.',
    tips: [
      'Đọc trước câu hỏi để dự đoán dạng thông tin cần nghe.',
      'Luôn nghĩ tới từ đồng nghĩa, audio hiếm khi đọc đúng từ trong câu hỏi.',
      'Đáp án được sửa lời thì lấy thông tin nói sau cùng.',
    ],
    resourceId: 'listening-keywords',
  },
  {
    key: 'reading',
    name: 'Reading',
    icon: '📖',
    variant: 'primary',
    time: '60 phút',
    parts: '3 đoạn • 40 câu',
    desc: 'Đọc hiểu văn bản học thuật, xử lý các dạng True/False/Not Given, Matching Headings...',
    tips: [
      'Skim lấy ý chính trước, scan tìm chi tiết sau.',
      'Gạch chân từ khóa và để ý các từ chỉ định lượng (all, some, never).',
      'Phân bổ thời gian đều cho 3 đoạn, đừng sa lầy một câu.',
    ],
    resourceId: 'reading-skimming-scanning',
  },
  {
    key: 'writing',
    name: 'Writing',
    icon: '✍️',
    variant: 'success',
    time: '60 phút',
    parts: '2 bài (Task 1 & 2)',
    desc: 'Mô tả biểu đồ/quy trình (Task 1) và viết bài luận quan điểm 250 từ (Task 2).',
    tips: [
      'Dành 40 phút cho Task 2 vì chiếm trọng số điểm cao hơn.',
      'Viết dàn bài 4 đoạn rõ ràng theo công thức PEEL.',
      'Chừa 5 phút cuối để soát lỗi ngữ pháp và chính tả.',
    ],
    resourceId: 'writing-task2-structure',
  },
  {
    key: 'speaking',
    name: 'Speaking',
    icon: '🗣️',
    variant: 'warning',
    time: '11-14 phút',
    parts: '3 phần phỏng vấn',
    desc: 'Phỏng vấn trực tiếp với giám khảo: giới thiệu bản thân, nói theo chủ đề và thảo luận.',
    tips: [
      'Part 1 trả lời 2-3 câu theo Answer + Reason + Example.',
      'Dùng cụm câu giờ tự nhiên thay vì im lặng.',
      'Giám khảo chấm độ trôi chảy, không chấm bạn nói thật hay bịa.',
    ],
    resourceId: 'speaking-part1-fluency',
  },
];

// Bài đọc mẫu + câu hỏi cho mini-quiz Reading
const READING_PASSAGE = {
  title: 'The Benefits of Reading Habits',
  paragraphs: [
    'Reading regularly has been shown to improve vocabulary and concentration. People who read for at least 30 minutes a day tend to have a wider range of words at their disposal, which helps them express ideas more clearly in both speaking and writing.',
    'Beyond language skills, reading also reduces stress. A study at the University of Sussex found that just six minutes of reading can lower stress levels by up to 68 percent, making it more effective than listening to music or going for a walk.',
    'However, the benefits depend on the type of material. Reading challenging texts builds critical thinking, while reading only light content mainly provides entertainment. Experts therefore recommend a balanced reading diet that mixes both.',
  ],
};

const QUESTIONS = [
  {
    id: 'q1',
    statement: 'Reading for 30 minutes a day can widen a person\'s vocabulary.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    answer: 'TRUE',
    explain: 'Đoạn 1 nói người đọc ít nhất 30 phút mỗi ngày có vốn từ rộng hơn.',
  },
  {
    id: 'q2',
    statement: 'Reading is more effective at reducing stress than listening to music.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    answer: 'TRUE',
    explain: 'Đoạn 2 nói đọc sách hiệu quả hơn nghe nhạc hay đi dạo trong việc giảm stress.',
  },
  {
    id: 'q3',
    statement: 'The University of Sussex study lasted six months.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    answer: 'NOT GIVEN',
    explain: 'Bài chỉ nhắc "6 phút đọc" giúp giảm stress, không nói nghiên cứu kéo dài bao lâu.',
  },
  {
    id: 'q4',
    statement: 'Experts suggest reading only light and entertaining content.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    answer: 'FALSE',
    explain: 'Đoạn 3 khuyên đọc cân bằng cả nội dung khó lẫn nhẹ nhàng, không chỉ nội dung giải trí.',
  },
];

export default function SkillPractice() {
  const [activeSkill, setActiveSkill] = useState('reading');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const score = useMemo(
    () => QUESTIONS.filter((q) => answers[q.id] === q.answer).length,
    [answers]
  );

  const selected = SKILLS.find((s) => s.key === activeSkill) || SKILLS[1];

  const handleSelect = (qId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = () => setSubmitted(true);
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  return (
    <div className="skills-page bg-light">
      {/* HERO */}
      <header className="skills-hero text-white">
        <Container className="py-5">
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <Badge bg="light" text="dark" className="mb-3 px-3 py-2 rounded-pill text-uppercase">
                Luyện tập tương tác
              </Badge>
              <h1 className="display-5 fw-bold mb-3">Luyện 4 kỹ năng IELTS</h1>
              <p className="fs-5 mb-0 text-white-50">
                Hiểu cấu trúc bài thi, nắm chiến lược cốt lõi và thử ngay một bài Reading
                tự chấm điểm, hoàn toàn miễn phí và không cần đăng nhập.
              </p>
            </Col>
          </Row>
        </Container>
      </header>

      <Container className="py-5">
        {/* TỔNG QUAN 4 KỸ NĂNG */}
        <h2 className="h3 fw-bold text-center mb-4">Tổng quan bài thi</h2>
        <Row className="g-4">
          {SKILLS.map((s) => (
            <Col key={s.key} sm={6} lg={3}>
              <Card
                className={`skill-card h-100 border-0 shadow-sm ${activeSkill === s.key ? 'skill-card-active' : ''}`}
                role="button"
                onClick={() => setActiveSkill(s.key)}
              >
                <Card.Body className="text-center d-flex flex-column">
                  <div className={`skill-icon bg-${s.variant}-subtle text-${s.variant} mx-auto mb-3`}>
                    <span>{s.icon}</span>
                  </div>
                  <Card.Title as="h3" className="fs-5 fw-bold mb-1">{s.name}</Card.Title>
                  <div className="small text-muted mb-2">{s.time} • {s.parts}</div>
                  <Card.Text className="small text-body-secondary flex-grow-1">{s.desc}</Card.Text>
                  <span className={`small fw-semibold text-${s.variant}`}>
                    {activeSkill === s.key ? 'Đang xem mẹo ↓' : 'Xem mẹo làm bài'}
                  </span>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* MẸO CHO KỸ NĂNG ĐANG CHỌN */}
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="fs-3">{selected.icon}</span>
              <div>
                <h3 className="h5 fw-bold mb-0">Chiến lược cho {selected.name}</h3>
                <span className="small text-muted">{selected.time} • {selected.parts}</span>
              </div>
            </div>
            <Row className="g-3">
              {selected.tips.map((tip, i) => (
                <Col md={4} key={i}>
                  <div className="skill-tip h-100">
                    <span className={`skill-tip-num bg-${selected.variant}`}>{i + 1}</span>
                    <p className="mb-0 small">{tip}</p>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="mt-3">
              <Button
                as={Link}
                to={`/resources/${selected.resourceId}`}
                variant={`outline-${selected.variant}`}
                size="sm"
                className="rounded-pill px-3"
              >
                Đọc hướng dẫn chi tiết {selected.name} →
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* MINI-QUIZ READING */}
        <div className="mt-5">
          <div className="text-center mb-4">
            <Badge bg="primary" className="mb-2 px-3 py-2">Thử sức ngay</Badge>
            <h2 className="h3 fw-bold mb-1">Bài luyện Reading: True / False / Not Given</h2>
            <p className="text-muted mb-0">Đọc đoạn văn rồi chọn đáp án cho 4 nhận định. Hệ thống sẽ tự chấm điểm.</p>
          </div>

          <Row className="g-4">
            {/* PASSAGE */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h3 className="h5 fw-bold mb-3">{READING_PASSAGE.title}</h3>
                  {READING_PASSAGE.paragraphs.map((p, i) => (
                    <p key={i} className="text-body-secondary">{p}</p>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            {/* QUESTIONS */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  {QUESTIONS.map((q, idx) => {
                    const userAns = answers[q.id];
                    const isCorrect = userAns === q.answer;
                    return (
                      <div key={q.id} className="quiz-item mb-4">
                        <p className="fw-semibold mb-2">
                          <span className="text-primary me-1">{idx + 1}.</span>{q.statement}
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {q.options.map((opt) => {
                            let variant = 'outline-secondary';
                            if (submitted) {
                              if (opt === q.answer) variant = 'success';
                              else if (opt === userAns) variant = 'danger';
                            } else if (userAns === opt) {
                              variant = 'primary';
                            }
                            return (
                              <Button
                                key={opt}
                                size="sm"
                                variant={variant}
                                className="rounded-pill px-3"
                                onClick={() => handleSelect(q.id, opt)}
                              >
                                {opt}
                              </Button>
                            );
                          })}
                        </div>
                        {submitted && (
                          <p className={`small mt-2 mb-0 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                            {isCorrect ? '✓ Chính xác. ' : '✗ Chưa đúng. '}{q.explain}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {!submitted ? (
                    <Button
                      variant="primary"
                      className="w-100 fw-semibold"
                      disabled={!allAnswered}
                      onClick={handleSubmit}
                    >
                      {allAnswered ? 'Nộp bài & xem kết quả' : 'Hãy trả lời tất cả câu hỏi'}
                    </Button>
                  ) : (
                    <div>
                      <Alert variant={score >= 3 ? 'success' : 'warning'} className="mb-3">
                        <strong>Kết quả: {score}/{QUESTIONS.length} câu đúng.</strong>{' '}
                        {score >= 3 ? 'Làm tốt lắm! Bạn đã nắm được dạng bài này.' : 'Đừng nản, hãy đọc lại hướng dẫn và thử lại nhé.'}
                      </Alert>
                      <ProgressBar
                        now={(score / QUESTIONS.length) * 100}
                        variant={score >= 3 ? 'success' : 'warning'}
                        className="mb-3"
                      />
                      <Button variant="outline-primary" className="w-100" onClick={handleReset}>
                        Làm lại
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA */}
        <Card className="skills-cta border-0 text-white text-center mt-5">
          <Card.Body className="py-5">
            <h2 className="fw-bold mb-2">Sẵn sàng luyện tập nghiêm túc?</h2>
            <p className="mb-4 text-white-50">
              Đăng ký để mở khóa flashcard từ vựng, bài test chấm điểm tự động và lộ trình theo dõi tiến độ.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button as={Link} to="/register" variant="light" className="fw-semibold px-4">
                Tạo tài khoản miễn phí
              </Button>
              <Button as={Link} to="/online-courses" variant="outline-light" className="fw-semibold px-4">
                Xem khóa học có giảng viên
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
