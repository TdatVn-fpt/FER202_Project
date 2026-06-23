import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherTestService } from '../../services/teacherTestService';
import { teacherQuestionService } from '../../services/teacherQuestionService';
import { auditLogService } from '../../services/auditLogService';
import {
  buildDefaultTestConfig,
  normalizeTest,
  SKILL_DEFAULTS,
} from '../../utils/testModel';
import StepIndicator from './test-builder/StepIndicator';
import SkillTemplateSelector from './test-builder/SkillTemplateSelector';
import LiveChecklist from './test-builder/LiveChecklist';
import ReadingBuilder from './test-builder/ReadingBuilder';
import ListeningBuilder from './test-builder/ListeningBuilder';
import WritingBuilder from './test-builder/WritingBuilder';
import SpeakingBuilder from './test-builder/SpeakingBuilder';

const createInitialDraft = (teacherId) => ({
  title: '',
  description: '',
  skill: 'Reading',
  testMode: 'free',
  courseId: '',
  isFreePreview: false,
  status: 'draft',
  practiceMode: 'exam',
  attemptLimit: 3,
  requireLoginAfterLimit: true,
  durationMinutes: SKILL_DEFAULTS.Reading.durationMinutes,
  totalQuestions: SKILL_DEFAULTS.Reading.totalQuestions,
  bandScale: 'IELTS 0-9',
  teacherId,
  testConfig: buildDefaultTestConfig('Reading'),
});

export default function TestCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [draft, setDraft] = useState(() => createInitialDraft(teacherId));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const normalizedDraft = useMemo(() => normalizeTest(draft), [draft]);
  const selectedCourse = courses.find((course) => String(course.id) === String(draft.courseId));
  const isCoursePending = draft.testMode === 'course' && selectedCourse?.status === 'pending';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const coursesData = await teacherCourseService.getCourses(teacherId);
        setCourses(coursesData);

        if (id) {
          const [testData, questionData] = await Promise.all([
            teacherTestService.getTestById(id),
            teacherQuestionService.getQuestions(id),
          ]);

          if (testData.teacherId && testData.teacherId !== teacherId) {
            setIsUnauthorized(true);
            setLoading(false);
            return;
          }

          setDraft({
            ...normalizeTest(testData),
            teacherId: testData.teacherId || teacherId,
          });
          setQuestions(questionData);
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu đề thi.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, teacherId]);

  const updateDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSkillChange = (skill) => {
    const defaults = SKILL_DEFAULTS[skill] || SKILL_DEFAULTS.Reading;
    updateDraft({
      skill,
      durationMinutes: defaults.durationMinutes,
      totalQuestions: defaults.totalQuestions,
      testConfig: buildDefaultTestConfig(skill),
    });
  };

  const validateDraft = () => {
    if (!draft.title.trim() || draft.title.trim().length < 5) {
      toast.error('Tiêu đề đề thi cần ít nhất 5 ký tự.');
      setStep(1);
      return false;
    }
    if (draft.testMode === 'course' && !draft.courseId) {
      toast.error('Vui lòng chọn khóa học hoặc chuyển test sang Free.');
      setStep(1);
      return false;
    }
    if (isCoursePending) {
      toast.error('Khóa học đang chờ duyệt. Không thể thêm/sửa đề thi.');
      return false;
    }
    if (draft.status === 'published') {
      const config = draft.testConfig || {};
      if (draft.skill === 'Reading' && !(config.passages || []).some((passage) => passage.content?.trim())) {
        toast.error('Reading test cần ít nhất một passage có nội dung trước khi publish.');
        setStep(2);
        return false;
      }
      if (draft.skill === 'Listening' && !(config.audioUrl || (config.sections || []).some((section) => section.audioUrl))) {
        toast.error('Listening test cần audio URL trước khi publish.');
        setStep(2);
        return false;
      }
      if (draft.skill === 'Writing' && (!config.task1?.prompt?.trim() || !config.task2?.prompt?.trim())) {
        toast.error('Writing test cần đủ prompt Task 1 và Task 2.');
        setStep(2);
        return false;
      }
      if (draft.skill === 'Speaking') {
        const part2 = (config.parts || []).find((part) => Number(part.partNumber) === 2);
        if (!part2?.cueCard?.trim()) {
          toast.error('Speaking test cần cue card cho Part 2.');
          setStep(2);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateDraft()) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        ...normalizedDraft,
        courseId: normalizedDraft.testMode === 'course' ? normalizedDraft.courseId : '',
        attemptLimit: normalizedDraft.testMode === 'free' || normalizedDraft.isFreePreview
          ? Number(normalizedDraft.attemptLimit || 3)
          : Number(normalizedDraft.attemptLimit || 0),
        teacherId,
        updatedAt: now,
        createdAt: normalizedDraft.createdAt || now,
      };

      let savedTest;
      if (id) {
        savedTest = await teacherTestService.updateTest(id, payload);
        await auditLogService.logAction(
          'UPDATE_TEST',
          { testId: id, title: payload.title, courseId: payload.courseId },
          teacherId
        );
      } else {
        savedTest = await teacherTestService.createTest(payload);
        await auditLogService.logAction(
          'CREATE_TEST',
          { testId: savedTest.id, title: payload.title, courseId: payload.courseId },
          teacherId
        );
      }

      if (selectedCourse?.status === 'approved' && payload.testMode === 'course') {
        await teacherCourseService.updateCourse(selectedCourse.id, { status: 'pending' });
        await auditLogService.logAction(
          'REVERT_COURSE_STATUS',
          { courseId: selectedCourse.id, reason: `Test ${savedTest.id} changed` },
          teacherId
        );
      }

      toast.success(id ? 'Đã cập nhật đề thi.' : 'Đã tạo đề thi.');
      if (!id && savedTest.skill !== 'Writing') {
        navigate(`/teacher/tests/${savedTest.id}/questions`);
      } else {
        navigate('/teacher/tests');
      }
    } catch (error) {
      toast.error('Lưu đề thi thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBuilder = () => {
    const props = {
      value: draft.testConfig || buildDefaultTestConfig(draft.skill),
      onChange: (testConfig) => updateDraft({ testConfig }),
    };
    if (draft.skill === 'Listening') return <ListeningBuilder {...props} />;
    if (draft.skill === 'Writing') return <WritingBuilder {...props} />;
    if (draft.skill === 'Speaking') return <SpeakingBuilder {...props} />;
    return <ReadingBuilder {...props} />;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" className="mb-2" />
        <p className="text-secondary fw-semibold">Đang tải dữ liệu đề thi...</p>
      </Container>
    );
  }

  if (isUnauthorized) {
    return (
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <Alert variant="danger" className="text-center p-4 shadow-sm border-0 rounded-3">
          <Alert.Heading className="fw-bold">Quyền truy cập bị từ chối</Alert.Heading>
          <p className="mb-4">Bạn không có quyền chỉnh sửa đề thi này.</p>
          <Button as={Link} to="/teacher/tests" variant="danger" className="rounded-pill px-4">
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <Link to="/teacher/tests" className="text-decoration-none text-muted small fw-semibold">
            Quay lại quản lý đề thi
          </Link>
          <h2 className="fw-bold text-dark mt-2 mb-1">{id ? 'Chỉnh sửa IELTS test' : 'Tạo IELTS test'}</h2>
          <p className="text-secondary mb-0">Tạo đề theo đúng template IELTS, publish free test hoặc gán vào khóa học.</p>
        </div>
        <div className="d-flex gap-2">
          {id && (
            <Button as={Link} to={`/teacher/tests/${id}/questions`} variant="outline-primary">
              Quản lý câu hỏi
            </Button>
          )}
          <Button variant="primary" onClick={handleSave} disabled={submitting || isCoursePending}>
            {submitting ? 'Đang lưu...' : 'Lưu test'}
          </Button>
        </div>
      </div>

      {isCoursePending && (
        <Alert variant="warning" className="border-0 shadow-sm">
          Khóa học đã chọn đang chờ duyệt. Bạn không thể sửa hoặc thêm test vào khóa học này.
        </Alert>
      )}

      <StepIndicator currentStep={step} onStepClick={setStep} />

      <Row className="g-4">
        <Col xl={9}>
          {step === 1 && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Thông tin cơ bản</h5>
                <Row className="g-3">
                  <Col xs={12}>
                    <Form.Label>Chọn template kỹ năng</Form.Label>
                    <SkillTemplateSelector value={draft.skill} onChange={handleSkillChange} />
                  </Col>
                  <Col md={8}>
                    <Form.Label>Tiêu đề test</Form.Label>
                    <Form.Control
                      value={draft.title}
                      onChange={(e) => updateDraft({ title: e.target.value })}
                      placeholder="IELTS Reading Practice Test 1"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={draft.status} onChange={(e) => updateDraft({ status: e.target.value })}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </Form.Select>
                  </Col>
                  <Col xs={12}>
                    <Form.Label>Mô tả ngắn</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={draft.description}
                      onChange={(e) => updateDraft({ description: e.target.value })}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Mode hiển thị</Form.Label>
                    <Form.Select
                      value={draft.testMode}
                      onChange={(e) => {
                        const testMode = e.target.value;
                        updateDraft({
                          testMode,
                          courseId: testMode === 'free' ? '' : draft.courseId,
                          attemptLimit: testMode === 'free' ? 3 : 0,
                        });
                      }}
                    >
                      <option value="free">Free test</option>
                      <option value="course">Course test</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Label>Practice mode</Form.Label>
                    <Form.Select value={draft.practiceMode} onChange={(e) => updateDraft({ practiceMode: e.target.value })}>
                      <option value="exam">Exam</option>
                      <option value="practice">Practice</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Label>Attempt limit</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      value={draft.attemptLimit}
                      onChange={(e) => updateDraft({ attemptLimit: Number(e.target.value) })}
                    />
                  </Col>
                  {draft.testMode === 'course' && (
                    <Col md={8}>
                      <Form.Label>Gán vào khóa học</Form.Label>
                      <Form.Select value={draft.courseId || ''} onChange={(e) => updateDraft({ courseId: e.target.value })}>
                        <option value="">Chưa gán khóa học</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title} ({course.status})
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  )}
                  <Col md={4}>
                    <Form.Label>Duration minutes</Form.Label>
                    <Form.Control
                      type="number"
                      value={draft.durationMinutes}
                      onChange={(e) => updateDraft({ durationMinutes: Number(e.target.value) })}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Total questions</Form.Label>
                    <Form.Control
                      type="number"
                      value={draft.totalQuestions}
                      onChange={(e) => updateDraft({ totalQuestions: Number(e.target.value) })}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Band scale</Form.Label>
                    <Form.Select value={draft.bandScale} onChange={(e) => updateDraft({ bandScale: e.target.value })}>
                      <option value="IELTS 0-9">IELTS 0-9</option>
                      <option value="Score 0-100">Score 0-100</option>
                    </Form.Select>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end mt-4">
                  <Button onClick={() => setStep(2)}>Tiếp tục</Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">Content Builder: {draft.skill}</h5>
                    <p className="text-muted small mb-0">Nhập nội dung nền cho đề trước khi gắn câu hỏi.</p>
                  </div>
                  <Button variant="outline-secondary" onClick={() => setStep(1)}>Quay lại</Button>
                </div>
                {renderBuilder()}
                <div className="d-flex justify-content-end mt-4">
                  <Button onClick={() => setStep(3)}>Tiếp tục</Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-2">Câu hỏi / Tasks / Parts</h5>
                {draft.skill === 'Writing' ? (
                  <Alert variant="info" className="border-0">
                    Writing dùng Task 1 và Task 2 trong Content Builder. Không cần tạo question record riêng.
                  </Alert>
                ) : id ? (
                  <Alert variant="light" className="border">
                    Test này hiện có <strong>{questions.length}</strong> câu hỏi. Bấm “Quản lý câu hỏi” để thêm hoặc chỉnh câu hỏi theo {draft.skill}.
                  </Alert>
                ) : (
                  <Alert variant="warning" className="border-0">
                    Hãy lưu test trước, sau đó hệ thống sẽ đưa bạn sang màn thêm câu hỏi.
                  </Alert>
                )}
                <div className="d-flex justify-content-between mt-4">
                  <Button variant="outline-secondary" onClick={() => setStep(2)}>Quay lại</Button>
                  <Button variant="primary" onClick={handleSave} disabled={submitting || isCoursePending}>
                    {submitting ? 'Đang lưu...' : id ? 'Lưu thay đổi' : 'Lưu và tiếp tục'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col xl={3}>
          <LiveChecklist test={normalizedDraft} questionCount={questions.length} onGoToStep={setStep} />
        </Col>
      </Row>
    </Container>
  );
}
