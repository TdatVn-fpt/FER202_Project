import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { testService } from '../../services/testService';
import './SkillPractice.css';

const SKILLS = [
  {
    key: 'reading',
    name: 'Reading',
    icon: 'bi-book',
    variant: 'primary',
    time: '60 minutes',
    parts: '3 passages - 40 questions',
    desc: 'Academic reading passages with matching, completion, multiple choice, and True/False/Not Given.',
    tips: ['Skim the whole passage first.', 'Scan names, dates, and numbers.', 'Watch absolute words such as all, never, always.'],
  },
  {
    key: 'listening',
    name: 'Listening',
    icon: 'bi-headphones',
    variant: 'info',
    time: '30-40 minutes',
    parts: '4 sections - 40 questions',
    desc: 'Playable IELTS audio with form completion, map labelling, short answer, and multiple choice.',
    tips: ['Preview the question type.', 'Listen for synonyms.', 'Use the final corrected answer if speakers self-correct.'],
  },
  {
    key: 'writing',
    name: 'Writing',
    icon: 'bi-pencil-square',
    variant: 'success',
    time: '60 minutes',
    parts: 'Task 1 + Task 2',
    desc: 'Academic Task 1 visual report plus Task 2 essay with IELTS band criteria.',
    tips: ['Spend more time on Task 2.', 'Plan before writing.', 'Check grammar and cohesion in the final minutes.'],
  },
  {
    key: 'speaking',
    name: 'Speaking',
    icon: 'bi-mic',
    variant: 'warning',
    time: '11-14 minutes',
    parts: '3 interview parts',
    desc: 'Part 1 interview, Part 2 cue card, and Part 3 extended discussion prompts.',
    tips: ['Answer then extend with a reason.', 'Use natural linking phrases.', 'For Part 2, cover every cue-card bullet.'],
  },
];

const MINI_PASSAGE = {
  title: 'The Benefits of Reading Habits',
  paragraphs: [
    'Reading regularly has been shown to improve vocabulary and concentration. People who read for at least 30 minutes a day tend to have a wider range of words at their disposal.',
    'A study at the University of Sussex found that just six minutes of reading can lower stress levels by up to 68 percent, making it more effective than listening to music.',
    'Experts recommend a balanced reading diet that mixes challenging texts with lighter material.',
  ],
};

const MINI_QUESTIONS = [
  { id: 'q1', statement: "Reading for 30 minutes a day can widen a person's vocabulary.", answer: 'TRUE' },
  { id: 'q2', statement: 'Reading is more effective at reducing stress than listening to music.', answer: 'TRUE' },
  { id: 'q3', statement: 'The University of Sussex study lasted six months.', answer: 'NOT GIVEN' },
  { id: 'q4', statement: 'Experts suggest reading only light and entertaining content.', answer: 'FALSE' },
];

export default function SkillPractice() {
  const [activeSkill, setActiveSkill] = useState('reading');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [approvedTests, setApprovedTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    testService.getFreeTests()
      .then((data) => setApprovedTests(data))
      .catch(() => setApprovedTests([]))
      .finally(() => setLoadingTests(false));
  }, []);

  const selected = SKILLS.find((skill) => skill.key === activeSkill) || SKILLS[0];
  const filteredTests = approvedTests.filter((test) => String(test.skill || '').toLowerCase() === activeSkill);
  const score = useMemo(
    () => MINI_QUESTIONS.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );
  const allAnswered = MINI_QUESTIONS.every((question) => answers[question.id]);

  return (
    <div className="skills-page">
      <header className="skills-hero">
        <Container className="py-5">
          <Row className="align-items-end g-4">
            <Col lg={8}>
              <Badge bg="light" text="dark" className="mb-3 px-3 py-2 rounded-pill text-uppercase">
                Approved IELTS practice
              </Badge>
              <h1 className="skills-title fw-bold mb-3">IELTS Skill Studio</h1>
              <p className="skills-subtitle mb-0">
                Hoc vien chi thay cac de da duoc admin chap nhan. Moi de ben duoi duoc tao tu tutor workflow va dang published.
              </p>
            </Col>
            <Col lg={4}>
              <div className="skills-hero-panel">
                <div className="small text-uppercase text-secondary fw-bold">Live approved tests</div>
                <div className="display-6 fw-bold">{approvedTests.length}</div>
                <div className="text-secondary small">Linked from Teacher Test Builder</div>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      <Container className="py-5">
        <Row className="g-4 mb-4">
          {SKILLS.map((skill) => (
            <Col key={skill.key} sm={6} lg={3}>
              <Card
                role="button"
                className={`skill-card h-100 ${activeSkill === skill.key ? 'skill-card-active' : ''}`}
                onClick={() => {
                  setActiveSkill(skill.key);
                  setSubmitted(false);
                  setAnswers({});
                }}
              >
                <Card.Body>
                  <div className={`skill-icon bg-${skill.variant}-subtle text-${skill.variant} mb-4`}>
                    <i className={`bi ${skill.icon}`} />
                  </div>
                  <div className="small text-uppercase text-secondary fw-bold mb-1">{skill.time}</div>
                  <h3 className="fs-5 fw-bold mb-2">{skill.name}</h3>
                  <p className="text-secondary small mb-3">{skill.desc}</p>
                  <div className="small fw-semibold">{skill.parts}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="skill-focus-card border-0 mb-5">
          <Card.Body className="p-4">
            <Row className="g-4 align-items-center">
              <Col lg={5}>
                <div className="d-flex align-items-center gap-3">
                  <span className={`skill-inline-icon bg-${selected.variant}-subtle text-${selected.variant}`}>
                    <i className={`bi ${selected.icon}`} />
                  </span>
                  <div>
                    <div className="small text-uppercase text-secondary fw-bold">Current skill</div>
                    <h2 className="h4 fw-bold mb-0">{selected.name}</h2>
                  </div>
                </div>
              </Col>
              <Col lg={7}>
                <Row className="g-3">
                  {selected.tips.map((tip, index) => (
                    <Col md={4} key={tip}>
                      <div className="skill-tip h-100">
                        <span className={`skill-tip-num bg-${selected.variant}`}>{index + 1}</span>
                        <p className="mb-0 small">{tip}</p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
            <div>
              <Badge bg="success" className="mb-2 px-3 py-2 rounded-pill">Admin approved</Badge>
              <h2 className="h3 fw-bold mb-1">De tutor tao da duoc duyet: {selected.name}</h2>
              <p className="text-secondary mb-0">Teacher tao de, admin approve, hoc vien nhin thay tai day.</p>
            </div>
            <Button as={Link} to="/free-tests" variant="outline-dark" className="rounded-pill px-4">
              View all tests
            </Button>
          </div>

          <Row className="g-4">
            {loadingTests ? (
              <Col xs={12} className="text-center py-5">
                <Spinner animation="border" variant={selected.variant} />
              </Col>
            ) : filteredTests.length === 0 ? (
              <Col xs={12}>
                <Alert variant="info" className="text-center border-0 shadow-sm">
                  Chua co de published cho ky nang nay. Hay gui de tu Teacher Test Builder va admin approve.
                </Alert>
              </Col>
            ) : (
              filteredTests.map((test, index) => (
                <Col md={6} xl={4} key={test.id}>
                  <Card className="approved-test-card h-100" style={{ '--test-index': index }}>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <Badge bg={selected.variant}>{test.skill}</Badge>
                        <Badge bg="success">Published</Badge>
                      </div>
                      <Card.Title as="h3" className="fs-5 fw-bold">{test.title}</Card.Title>
                      <p className="text-secondary small flex-grow-1">{test.description || 'IELTS practice test created by tutor and approved by admin.'}</p>
                      <div className="approved-meta mb-3">
                        <span><i className="bi bi-clock me-1" />{test.durationMinutes} min</span>
                        <span><i className="bi bi-list-check me-1" />{test.totalQuestions} questions</span>
                      </div>
                      <Button as={Link} to={`/free-tests/${test.id}`} variant={selected.variant} className="w-100 fw-semibold">
                        Lam bai ngay
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </section>

        {activeSkill === 'reading' && (
          <section className="mini-quiz-section">
            <div className="text-center mb-4">
              <Badge bg="primary" className="mb-2 px-3 py-2">Quick check</Badge>
              <h2 className="h3 fw-bold mb-1">Reading mini quiz: True / False / Not Given</h2>
            </div>
            <Row className="g-4">
              <Col lg={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h3 className="h5 fw-bold mb-3">{MINI_PASSAGE.title}</h3>
                    {MINI_PASSAGE.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-secondary">{paragraph}</p>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    {MINI_QUESTIONS.map((question, index) => (
                      <div key={question.id} className="quiz-item mb-4">
                        <p className="fw-semibold mb-2">
                          <span className="text-primary me-1">{index + 1}.</span>{question.statement}
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => {
                            const selectedAnswer = answers[question.id] === option;
                            const correct = submitted && option === question.answer;
                            const wrong = submitted && selectedAnswer && option !== question.answer;
                            return (
                              <Button
                                key={option}
                                size="sm"
                                variant={correct ? 'success' : wrong ? 'danger' : selectedAnswer ? 'primary' : 'outline-secondary'}
                                className="rounded-pill px-3"
                                onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                              >
                                {option}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!submitted ? (
                      <Button className="w-100 fw-semibold" disabled={!allAnswered} onClick={() => setSubmitted(true)}>
                        {allAnswered ? 'Submit mini quiz' : 'Answer all questions'}
                      </Button>
                    ) : (
                      <Alert variant={score >= 3 ? 'success' : 'warning'} className="mb-0">
                        Result: <strong>{score}/{MINI_QUESTIONS.length}</strong>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </section>
        )}
      </Container>
    </div>
  );
}
