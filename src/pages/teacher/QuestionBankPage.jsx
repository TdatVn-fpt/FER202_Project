import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherTestService } from '../../services/teacherTestService';
import { teacherQuestionService } from '../../services/teacherQuestionService';
import { auditLogService } from '../../services/auditLogService';

const questionSchema = z.object({
  type: z.string().min(1, 'Vui lòng chọn loại câu hỏi'),
  questionText: z.string().min(5, 'Nội dung câu hỏi phải có ít nhất 5 ký tự'),
  option0: z.string().optional(),
  option1: z.string().optional(),
  option2: z.string().optional(),
  option3: z.string().optional(),
  answer: z.string().min(1, 'Vui lòng nhập đáp án đúng'),
  explanation: z.string().optional(),
  score: z.coerce.number().min(1, 'Điểm số phải ít nhất là 1')
}).superRefine((data, ctx) => {
  if (data.type === 'multiple-choice') {
    if (!data.option0?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['option0'], message: 'Phương án A không được để trống' });
    }
    if (!data.option1?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['option1'], message: 'Phương án B không được để trống' });
    }
    if (!data.option2?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['option2'], message: 'Phương án C không được để trống' });
    }
    if (!data.option3?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['option3'], message: 'Phương án D không được để trống' });
    }
    
    const opts = [data.option0?.trim(), data.option1?.trim(), data.option2?.trim(), data.option3?.trim()].filter(Boolean);
    if (opts.length === 4 && !opts.includes(data.answer?.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['answer'], message: 'Đáp án đúng phải trùng với một trong các phương án trên' });
    }
  }
  if (data.type === 'true-false-not-given') {
    const allowed = ['True', 'False', 'Not Given'];
    if (!allowed.includes(data.answer)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['answer'], message: 'Đáp án phải là True, False hoặc Not Given' });
    }
  }
});

// EARS[Ubiquitous]: The QuestionBankPage component shall allow teachers to manage questions within their own practice tests
export default function QuestionBankPage() {
  const { id: testId } = useParams();
  const [test, setTest] = useState(null);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: 'multiple-choice',
      questionText: '',
      option0: '',
      option1: '',
      option2: '',
      option3: '',
      answer: '',
      explanation: '',
      score: 1
    }
  });

  const questionType = watch('type');
  const watchOption0 = watch('option0');
  const watchOption1 = watch('option1');
  const watchOption2 = watch('option2');
  const watchOption3 = watch('option3');

  // Load test, parent course, and existing questions
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const testData = await teacherTestService.getTestById(testId);
        
        // EARS[Ubiquitous]: Giao diện quản lý PHẢI chỉ hiển thị và cho phép chỉnh sửa nội dung do chính Teacher đó tạo ra
        if (testData.teacherId !== teacherId) {
          setIsUnauthorized(true);
          setLoading(false);
          return;
        }

        setTest(testData);

        // Load course details
        const coursesData = await teacherCourseService.getCourses(teacherId);
        const parentCourse = coursesData.find(c => c.id === testData.courseId);
        setCourse(parentCourse);

        // Load questions
        const questionsData = await teacherQuestionService.getQuestions(testId);
        setQuestions(questionsData);
      } catch (err) {
        toast.error('Không thể tải dữ liệu ngân hàng câu hỏi.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [testId, teacherId]);

  // Adjust answer fields automatically when question type changes
  useEffect(() => {
    if (questionType === 'true-false-not-given') {
      setValue('option0', 'True');
      setValue('option1', 'False');
      setValue('option2', 'Not Given');
      setValue('option3', '');
      setValue('answer', 'True');
    } else if (questionType === 'fill-in-the-blank') {
      setValue('option0', '');
      setValue('option1', '');
      setValue('option2', '');
      setValue('option3', '');
      setValue('answer', '');
    } else {
      setValue('option0', '');
      setValue('option1', '');
      setValue('option2', '');
      setValue('option3', '');
      setValue('answer', '');
    }
  }, [questionType, setValue]);

  const handleEditClick = (q) => {
    setEditingQuestionId(q.id);
    reset({
      type: q.type,
      questionText: q.questionText,
      option0: q.options?.[0] || '',
      option1: q.options?.[1] || '',
      option2: q.options?.[2] || '',
      option3: q.options?.[3] || '',
      answer: q.answer,
      explanation: q.explanation || '',
      score: q.score || 1
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    reset({
      type: 'multiple-choice',
      questionText: '',
      option0: '',
      option1: '',
      option2: '',
      option3: '',
      answer: '',
      explanation: '',
      score: 1
    });
  };

  const handleDeleteClick = (q) => {
    // EARS[Unwanted]: Chặn xóa nếu khóa học chứa bài test đang ở trạng thái pending
    if (course?.status === 'pending') {
      toast.error('Không thể xóa câu hỏi khi khóa học đang chờ duyệt.');
      return;
    }
    setQuestionToDelete(q);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    setDeleting(true);
    try {
      await teacherQuestionService.deleteQuestion(questionToDelete.id);

      // EARS[Event-driven]: KHI Teacher chỉnh sửa câu hỏi của khóa học đã duyệt (approved), hệ thống tự động đổi status khóa học thành "pending"
      if (course && course.status === 'approved') {
        await teacherCourseService.updateCourse(course.id, { status: 'pending' });
        await auditLogService.logAction(
          'REVERT_COURSE_STATUS',
          { courseId: course.id, reason: `Question ${questionToDelete.id} deleted in approved course` },
          teacherId
        );
        // Local update course status
        setCourse({ ...course, status: 'pending' });
      }

      // Log audit action
      await auditLogService.logAction(
        'DELETE_QUESTION',
        { questionId: questionToDelete.id, testId },
        teacherId
      );

      setQuestions(questions.filter(q => q.id !== questionToDelete.id));
      toast.success('Xóa câu hỏi thành công!');
      setShowDeleteModal(false);
      setQuestionToDelete(null);
    } catch (err) {
      toast.error('Xóa câu hỏi thất bại. Vui lòng thử lại sau.');
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (data) => {
    // EARS[Unwanted]: Chặn chỉnh sửa nếu khóa học đang pending
    if (course?.status === 'pending') {
      toast.error('Khóa học đang chờ duyệt. Không thể chỉnh sửa câu hỏi.');
      return;
    }

    setSubmitting(true);
    try {
      // Build options array based on question type
      let optionsList = [];
      if (data.type === 'multiple-choice') {
        optionsList = [data.option0.trim(), data.option1.trim(), data.option2.trim(), data.option3.trim()];
      } else if (data.type === 'true-false-not-given') {
        optionsList = ['True', 'False', 'Not Given'];
      }

      const payload = {
        testId,
        type: data.type,
        questionText: data.questionText.trim(),
        options: optionsList,
        answer: data.answer.trim(),
        explanation: data.explanation?.trim() || '',
        score: Number(data.score) || 1
      };

      if (editingQuestionId) {
        // Edit mode
        await teacherQuestionService.updateQuestion(editingQuestionId, payload);

        // EARS[Event-driven]: KHI Teacher chỉnh sửa câu hỏi của khóa học đã duyệt (approved), hệ thống tự động đổi status khóa học thành "pending"
        if (course && course.status === 'approved') {
          await teacherCourseService.updateCourse(course.id, { status: 'pending' });
          await auditLogService.logAction(
            'REVERT_COURSE_STATUS',
            { courseId: course.id, reason: `Question ${editingQuestionId} updated in approved course` },
            teacherId
          );
          setCourse({ ...course, status: 'pending' });
        }

        // Log audit action
        await auditLogService.logAction(
          'UPDATE_QUESTION',
          { questionId: editingQuestionId, testId },
          teacherId
        );

        toast.success('Cập nhật câu hỏi thành công!');
        setQuestions(questions.map(q => q.id === editingQuestionId ? { ...payload, id: editingQuestionId } : q));
        setEditingQuestionId(null);
      } else {
        // Create mode
        const newQ = await teacherQuestionService.createQuestion(payload);

        // EARS[Event-driven]: KHI Teacher thêm câu hỏi vào khóa học đã duyệt (approved), hệ thống tự động đổi status khóa học thành "pending"
        if (course && course.status === 'approved') {
          await teacherCourseService.updateCourse(course.id, { status: 'pending' });
          await auditLogService.logAction(
            'REVERT_COURSE_STATUS',
            { courseId: course.id, reason: 'New question added to approved course' },
            teacherId
          );
          setCourse({ ...course, status: 'pending' });
        }

        // Log audit action
        await auditLogService.logAction(
          'CREATE_QUESTION',
          { questionId: newQ.id, testId },
          teacherId
        );

        toast.success('Thêm câu hỏi thành công!');
        setQuestions([...questions, newQ]);
      }

      // Clear form except the type selector
      reset({
        type: data.type,
        questionText: '',
        option0: data.type === 'true-false-not-given' ? 'True' : '',
        option1: data.type === 'true-false-not-given' ? 'False' : '',
        option2: data.type === 'true-false-not-given' ? 'Not Given' : '',
        option3: '',
        answer: data.type === 'true-false-not-given' ? 'True' : '',
        explanation: '',
        score: 1
      });
    } catch (err) {
      toast.error('Lưu câu hỏi thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" className="mb-2" />
        <p className="text-secondary fw-semibold">Đang tải dữ liệu ngân hàng câu hỏi...</p>
      </Container>
    );
  }

  // EARS[Unwanted]: NẾU Giáo viên cố tình truy cập chỉnh sửa câu hỏi của đề thi người khác, chuyển hướng hoặc hiển thị Alert
  if (isUnauthorized) {
    return (
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <Alert variant="danger" className="text-center p-4 shadow-sm border-0 rounded-3">
          <Alert.Heading className="fw-bold"><i className="bi bi-shield-slash fs-2 mb-2 d-block"></i> Quyền truy cập bị từ chối</Alert.Heading>
          <p className="mb-4">Bạn không có quyền chỉnh sửa ngân hàng câu hỏi của đề thi này.</p>
          <Button as={Link} to="/teacher/tests" variant="danger" className="rounded-pill px-4">
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  const isPending = course?.status === 'pending';

  return (
    <Container fluid className="py-4">
      {/* Back Button */}
      <Link 
        to="/teacher/tests" 
        className="text-decoration-none text-muted mb-4 d-inline-flex align-items-center gap-2 fw-semibold transition-all hover-translate-x"
        style={{ fontSize: '14px' }}
      >
        <i className="bi bi-arrow-left"></i> Quay lại danh sách đề thi
      </Link>

      {/* Info Header */}
      <Card className="border-0 shadow-sm p-4 mb-4 bg-white rounded-3 mt-2">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-primary text-uppercase px-2.5 py-1.5 rounded-3 mb-2">{test?.skill}</span>
            <h2 className="fw-bold text-dark mb-1">{test?.title}</h2>
            <p className="text-secondary mb-0 small">
              Khóa học: <strong className="text-dark">{course?.title}</strong> | Thời gian: {test?.durationMinutes} phút | Dự kiến: {test?.totalQuestions} câu hỏi.
            </p>
          </div>
          <div className="text-md-end">
            <span className={`badge px-3 py-2 fs-6 rounded-pill ${
              course?.status === 'approved' ? 'bg-success text-success-50 bg-opacity-10 border border-success border-opacity-25' :
              course?.status === 'pending' ? 'bg-warning text-warning-50 bg-opacity-10 border border-warning border-opacity-25' :
              'bg-secondary text-secondary-50 bg-opacity-10 border border-secondary border-opacity-25'
            }`}>
              Khóa học: {course?.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {isPending && (
        <Alert variant="warning" className="mb-4 border-0 shadow-sm p-4 rounded-3 d-flex align-items-center gap-3">
          <i className="bi bi-exclamation-triangle fs-3 text-warning"></i>
          <div>
            <h5 className="alert-heading fw-bold mb-1">Khóa học này đang chờ phê duyệt</h5>
            <p className="mb-0 small text-secondary">Khóa học liên kết đang trong trạng thái xem xét duyệt. Không được phép thêm mới, sửa đổi hoặc xóa câu hỏi.</p>
          </div>
        </Alert>
      )}

      {course?.status === 'approved' && (
        <Alert variant="info" className="mb-4 border-0 shadow-sm p-4 rounded-3 d-flex align-items-center gap-3">
          <i className="bi bi-info-circle fs-3 text-info"></i>
          <div>
            <h5 className="alert-heading fw-bold mb-1">Khóa học liên kết đã được xuất bản</h5>
            <p className="mb-0 small text-secondary">Mọi chỉnh sửa hoặc bổ sung câu hỏi mới sẽ tự động đưa khóa học liên kết trở lại trạng thái <strong>Chờ duyệt (Pending)</strong>.</p>
          </div>
        </Alert>
      )}

      <Row className="g-4">
        {/* Left column: List of questions */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white p-4" style={{ minHeight: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-dark mb-0">Ngân hàng câu hỏi ({questions.length})</h4>
              <span className="small text-muted">Thang điểm: {test?.bandScale}</span>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-5 my-auto">
                <i className="bi bi-patch-question text-muted fs-1 mb-3"></i>
                <h5 className="fw-semibold text-secondary">Chưa có câu hỏi nào</h5>
                <p className="text-muted small">Nhập thông tin bên phải để tạo câu hỏi đầu tiên cho đề thi.</p>
              </div>
            ) : (
              <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                {questions.map((q, idx) => (
                  <Card key={q.id} className="border border-light-subtle rounded-3 mb-3 p-3 shadow-xs">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <span className="badge bg-secondary-subtle text-secondary px-2 py-1 small rounded-3 text-capitalize">
                        Câu {idx + 1}: {q.type}
                      </span>
                      <div className="d-flex gap-1">
                        <Button 
                          variant="light" 
                          size="sm" 
                          onClick={() => handleEditClick(q)}
                          disabled={isPending}
                          className="py-1 px-2 text-secondary rounded-2"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                        <Button 
                          variant="light" 
                          size="sm" 
                          onClick={() => handleDeleteClick(q)}
                          disabled={isPending}
                          className="py-1 px-2 text-danger rounded-2"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                    <div className="fw-bold text-dark mb-2">{q.questionText}</div>
                    
                    {q.type === 'multiple-choice' && (
                      <div className="row g-2 mb-2">
                        {q.options.map((opt, oIdx) => {
                          const letters = ['A', 'B', 'C', 'D'];
                          const isCorrect = opt === q.answer;
                          return (
                            <Col md={6} key={oIdx} className="small">
                              <span className={`px-2 py-0.5 rounded fw-semibold border me-2 ${isCorrect ? 'bg-success text-white border-success' : 'bg-light text-secondary border-gray'}`}>
                                {letters[oIdx]}
                              </span>
                              <span className={isCorrect ? 'text-success fw-bold' : 'text-secondary'}>{opt}</span>
                            </Col>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'true-false-not-given' && (
                      <div className="d-flex gap-3 mb-2 small text-secondary">
                        {['True', 'False', 'Not Given'].map((val) => {
                          const isCorrect = val === q.answer;
                          return (
                            <span key={val} className={isCorrect ? 'text-success fw-bold' : 'text-muted'}>
                              <i className={`bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> {val}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'fill-in-the-blank' && (
                      <div className="mb-2 small">
                        Đáp án đúng: <span className="text-success fw-bold border-bottom border-success border-2 pb-0.5 px-2">{q.answer}</span>
                      </div>
                    )}

                    {q.explanation && (
                      <div className="mt-2 pt-2 border-top border-light-subtle small text-muted bg-light p-2 rounded-2">
                        <strong className="text-secondary"><i className="bi bi-lightbulb-fill text-warning me-1"></i>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Right column: Create/Edit Form */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm p-4 rounded-3 bg-white">
            <h4 className="fw-bold text-dark mb-3">
              {editingQuestionId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h4>

            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Row className="g-3">
                {/* Type Selector */}
                <Col xs={12}>
                  <Form.Group controlId="type">
                    <Form.Label className="fw-semibold text-secondary">Loại câu hỏi <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                      isInvalid={!!errors.type}
                      {...register('type')}
                      disabled={submitting || isPending || !!editingQuestionId} // Block type changing in edit mode
                      className="py-2.5 px-3 border-gray"
                    >
                      <option value="multiple-choice">Trắc nghiệm (Multiple Choice)</option>
                      <option value="true-false-not-given">True / False / Not Given</option>
                      <option value="fill-in-the-blank">Điền vào chỗ trống (Fill in the blank)</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.type?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Score */}
                <Col xs={12}>
                  <Form.Group controlId="score">
                    <Form.Label className="fw-semibold text-secondary">Điểm số câu hỏi <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="number"
                      isInvalid={!!errors.score}
                      {...register('score')}
                      disabled={submitting || isPending}
                      className="py-2.5 px-3 border-gray"
                    />
                    <Form.Control.Feedback type="invalid">{errors.score?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Question Text */}
                <Col xs={12}>
                  <Form.Group controlId="questionText">
                    <Form.Label className="fw-semibold text-secondary">Nội dung câu hỏi <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      as="textarea"
                      rows={3}
                      placeholder="Nhập nội dung câu hỏi IELTS..." 
                      isInvalid={!!errors.questionText}
                      {...register('questionText')}
                      disabled={submitting || isPending}
                      className="py-2.5 px-3 border-gray"
                    />
                    <Form.Control.Feedback type="invalid">{errors.questionText?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Options Input (MCQ only) */}
                {questionType === 'multiple-choice' && (
                  <Col xs={12}>
                    <Form.Label className="fw-semibold text-secondary mb-2">Các phương án trả lời <span className="text-danger">*</span></Form.Label>
                    <div className="d-flex flex-column gap-2">
                      <Form.Group controlId="option0">
                        <Form.Control 
                          type="text" 
                          placeholder="Phương án A" 
                          isInvalid={!!errors.option0}
                          {...register('option0')}
                          disabled={submitting || isPending}
                          className="py-2 px-3 border-gray"
                        />
                        <Form.Control.Feedback type="invalid">{errors.option0?.message}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group controlId="option1">
                        <Form.Control 
                          type="text" 
                          placeholder="Phương án B" 
                          isInvalid={!!errors.option1}
                          {...register('option1')}
                          disabled={submitting || isPending}
                          className="py-2 px-3 border-gray"
                        />
                        <Form.Control.Feedback type="invalid">{errors.option1?.message}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group controlId="option2">
                        <Form.Control 
                          type="text" 
                          placeholder="Phương án C" 
                          isInvalid={!!errors.option2}
                          {...register('option2')}
                          disabled={submitting || isPending}
                          className="py-2 px-3 border-gray"
                        />
                        <Form.Control.Feedback type="invalid">{errors.option2?.message}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group controlId="option3">
                        <Form.Control 
                          type="text" 
                          placeholder="Phương án D" 
                          isInvalid={!!errors.option3}
                          {...register('option3')}
                          disabled={submitting || isPending}
                          className="py-2 px-3 border-gray"
                        />
                        <Form.Control.Feedback type="invalid">{errors.option3?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </Col>
                )}

                {/* Options Label Display (TFN only) */}
                {questionType === 'true-false-not-given' && (
                  <Col xs={12}>
                    <Form.Label className="fw-semibold text-secondary">Các phương án cố định</Form.Label>
                    <div className="d-flex gap-2">
                      <span className="badge bg-light text-dark border p-2.5 rounded-3">A. True</span>
                      <span className="badge bg-light text-dark border p-2.5 rounded-3">B. False</span>
                      <span className="badge bg-light text-dark border p-2.5 rounded-3">C. Not Given</span>
                    </div>
                  </Col>
                )}

                {/* Correct Answer Input */}
                <Col xs={12}>
                  <Form.Group controlId="answer">
                    <Form.Label className="fw-semibold text-secondary">Đáp án đúng <span className="text-danger">*</span></Form.Label>
                    
                    {questionType === 'multiple-choice' ? (
                      <Form.Select 
                        isInvalid={!!errors.answer}
                        {...register('answer')}
                        disabled={submitting || isPending}
                        className="py-2.5 px-3 border-gray"
                      >
                        <option value="">-- Chọn đáp án đúng --</option>
                        {watchOption0 && <option value={watchOption0}>{watchOption0}</option>}
                        {watchOption1 && <option value={watchOption1}>{watchOption1}</option>}
                        {watchOption2 && <option value={watchOption2}>{watchOption2}</option>}
                        {watchOption3 && <option value={watchOption3}>{watchOption3}</option>}
                      </Form.Select>
                    ) : questionType === 'true-false-not-given' ? (
                      <Form.Select 
                        isInvalid={!!errors.answer}
                        {...register('answer')}
                        disabled={submitting || isPending}
                        className="py-2.5 px-3 border-gray"
                      >
                        <option value="True">True</option>
                        <option value="False">False</option>
                        <option value="Not Given">Not Given</option>
                      </Form.Select>
                    ) : (
                      <Form.Control 
                        type="text" 
                        placeholder="Nhập đáp án đúng bằng văn bản..." 
                        isInvalid={!!errors.answer}
                        {...register('answer')}
                        disabled={submitting || isPending}
                        className="py-2.5 px-3 border-gray"
                      />
                    )}
                    <Form.Control.Feedback type="invalid">{errors.answer?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Explanation */}
                <Col xs={12}>
                  <Form.Group controlId="explanation">
                    <Form.Label className="fw-semibold text-secondary">Giải thích chi tiết (Để hiển thị khi học sinh làm xong)</Form.Label>
                    <Form.Control 
                      as="textarea"
                      rows={2}
                      placeholder="Nhập giải thích cho đáp án đúng..." 
                      isInvalid={!!errors.explanation}
                      {...register('explanation')}
                      disabled={submitting || isPending}
                      className="py-2.5 px-3 border-gray"
                    />
                    <Form.Control.Feedback type="invalid">{errors.explanation?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              {/* Form Actions */}
              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
                {editingQuestionId && (
                  <Button 
                    type="button"
                    variant="outline-secondary" 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-pill fw-semibold shadow-none border-gray text-secondary"
                  >
                    Hủy sửa
                  </Button>
                )}
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-4 py-2 rounded-pill fw-semibold d-flex align-items-center gap-2"
                  disabled={submitting || isPending}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" animation="border" /> Đang lưu...
                    </>
                  ) : (
                    <>{editingQuestionId ? 'Cập nhật' : 'Lưu câu hỏi'}</>
                  )}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-dark">Xác nhận xóa câu hỏi</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi không? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="fw-semibold px-3 rounded-pill">
            Hủy bỏ
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete} 
            disabled={deleting}
            className="fw-semibold px-4 rounded-pill shadow-sm"
          >
            {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
