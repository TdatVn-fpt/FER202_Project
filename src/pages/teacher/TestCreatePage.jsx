import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherTestService } from '../../services/teacherTestService';
import { auditLogService } from '../../services/auditLogService';

const testSchema = z.object({
  courseId: z.string().min(1, 'Vui lòng chọn khóa học'),
  title: z.string().min(5, 'Tiêu đề đề thi phải có ít nhất 5 ký tự'),
  skill: z.string().min(1, 'Vui lòng chọn kỹ năng'),
  durationMinutes: z.coerce.number().int('Thời gian làm bài phải là số nguyên').min(1, 'Thời gian làm bài phải ít nhất 1 phút'),
  totalQuestions: z.coerce.number().int('Số câu hỏi phải là số nguyên').min(1, 'Số câu hỏi phải ít nhất là 1 câu'),
  bandScale: z.string().min(1, 'Vui lòng chọn thang điểm')
});

// EARS[Ubiquitous]: The TestCreatePage component shall validate input fields and perform CRUD actions for tests
export default function TestCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [targetCourseStatus, setTargetCourseStatus] = useState('');

  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      courseId: '',
      title: '',
      skill: '',
      durationMinutes: 40,
      totalQuestions: 40,
      bandScale: 'IELTS 0-9'
    }
  });

  const selectedCourseId = watch('courseId');

  // Load courses and test details (if editing)
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const coursesData = await teacherCourseService.getCourses(teacherId);
        setCourses(coursesData);

        if (id) {
          // Edit mode
          const testData = await teacherTestService.getTestById(id);
          
          // EARS[Ubiquitous]: Giao diện quản lý PHẢI chỉ hiển thị và cho phép chỉnh sửa nội dung do chính Teacher đó tạo ra
          if (testData.teacherId !== teacherId) {
            setIsUnauthorized(true);
            setLoading(false);
            return;
          }

          reset({
            courseId: testData.courseId,
            title: testData.title,
            skill: testData.skill,
            durationMinutes: testData.durationMinutes,
            totalQuestions: testData.totalQuestions || 40,
            bandScale: testData.bandScale || 'IELTS 0-9'
          });

          const parentCourse = coursesData.find(c => c.id === testData.courseId);
          if (parentCourse) {
            setTargetCourseStatus(parentCourse.status);
          }
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu đề thi.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, teacherId, reset]);

  // Track parent course status dynamically when course select changes
  useEffect(() => {
    if (selectedCourseId && courses.length > 0) {
      const match = courses.find(c => c.id === selectedCourseId);
      if (match) {
        setTargetCourseStatus(match.status);
      }
    } else {
      setTargetCourseStatus('');
    }
  }, [selectedCourseId, courses]);

  const onSubmit = async (data) => {
    // EARS[Unwanted]: Chặn chỉnh sửa nếu khóa học đang pending
    if (targetCourseStatus === 'pending') {
      toast.error('Khóa học đang chờ duyệt. Không thể thêm/sửa đề thi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        teacherId
      };

      const matchedCourse = courses.find(c => c.id === data.courseId);

      if (id) {
        // Edit mode
        await teacherTestService.updateTest(id, payload);

        // EARS[Event-driven]: KHI Teacher chỉnh sửa đề thi của khóa học đã duyệt (approved), hệ thống tự động đổi status khóa học thành "pending"
        if (matchedCourse && matchedCourse.status === 'approved') {
          await teacherCourseService.updateCourse(matchedCourse.id, { status: 'pending' });
          await auditLogService.logAction(
            'REVERT_COURSE_STATUS',
            { courseId: matchedCourse.id, reason: `Test ${id} edited in approved course` },
            teacherId
          );
        }

        // Log audit action
        await auditLogService.logAction(
          'UPDATE_TEST',
          { testId: id, title: data.title, courseId: data.courseId },
          teacherId
        );

        if (matchedCourse && matchedCourse.status === 'approved') {
          toast.success('Cập nhật thành công. Khóa học được chuyển sang chờ duyệt lại!');
        } else {
          toast.success('Cập nhật đề thi thành công!');
        }
      } else {
        // Create mode
        const newTest = await teacherTestService.createTest(payload);

        // EARS[Event-driven]: KHI Teacher thêm đề thi vào khóa học đã duyệt (approved), hệ thống tự động đổi status khóa học thành "pending"
        if (matchedCourse && matchedCourse.status === 'approved') {
          await teacherCourseService.updateCourse(matchedCourse.id, { status: 'pending' });
          await auditLogService.logAction(
            'REVERT_COURSE_STATUS',
            { courseId: matchedCourse.id, reason: 'New test added to approved course' },
            teacherId
          );
        }

        // Log audit action
        await auditLogService.logAction(
          'CREATE_TEST',
          { testId: newTest.id, title: data.title, courseId: data.courseId },
          teacherId
        );

        if (matchedCourse && matchedCourse.status === 'approved') {
          toast.success('Thêm thành công. Khóa học được chuyển sang chờ duyệt lại!');
        } else {
          toast.success('Thêm đề thi mới thành công!');
        }
      }

      navigate('/teacher/tests');
    } catch (error) {
      toast.error('Lưu đề thi thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" className="mb-2" />
        <p className="text-secondary fw-semibold">Đang tải dữ liệu đề thi...</p>
      </Container>
    );
  }

  // EARS[Unwanted]: NẾU Giáo viên cố tình truy cập chỉnh sửa ID đề thi của người khác, chuyển hướng hoặc hiển thị Alert
  if (isUnauthorized) {
    return (
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <Alert variant="danger" className="text-center p-4 shadow-sm border-0 rounded-3">
          <Alert.Heading className="fw-bold"><i className="bi bi-shield-slash fs-2 mb-2 d-block"></i> Quyền truy cập bị từ chối</Alert.Heading>
          <p className="mb-4">Bạn không có quyền chỉnh sửa đề thi này.</p>
          <Button as={Link} to="/teacher/tests" variant="danger" className="rounded-pill px-4">
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  const isPending = targetCourseStatus === 'pending';

  return (
    <Container className="py-5" style={{ maxWidth: '800px' }}>
      {/* Back Button */}
      <Link 
        to="/teacher/tests" 
        className="text-decoration-none text-muted mb-4 d-inline-flex align-items-center gap-2 fw-semibold transition-all hover-translate-x"
        style={{ fontSize: '14px' }}
      >
        <i className="bi bi-arrow-left"></i> Quay lại quản lý đề thi
      </Link>

      {isPending && (
        <Alert variant="warning" className="mb-4 border-0 shadow-sm p-4 rounded-3 d-flex align-items-center gap-3">
          <i className="bi bi-exclamation-triangle fs-3 text-warning"></i>
          <div>
            <h5 className="alert-heading fw-bold mb-1">Khóa học này đang chờ phê duyệt</h5>
            <p className="mb-0 small text-secondary">Khóa học liên kết đang trong trạng thái xem xét duyệt. Không được phép thêm mới hoặc chỉnh sửa đề thi.</p>
          </div>
        </Alert>
      )}

      {targetCourseStatus === 'approved' && (
        <Alert variant="info" className="mb-4 border-0 shadow-sm p-4 rounded-3 d-flex align-items-center gap-3">
          <i className="bi bi-info-circle fs-3 text-info"></i>
          <div>
            <h5 className="alert-heading fw-bold mb-1">Khóa học liên kết đã được xuất bản</h5>
            <p className="mb-0 small text-secondary">Mọi chỉnh sửa hoặc bổ sung đề thi mới sẽ tự động đưa khóa học liên kết trở lại trạng thái <strong>Chờ duyệt (Pending)</strong>.</p>
          </div>
        </Alert>
      )}

      <Card className="border-0 shadow-sm p-4 p-md-5 rounded-3 bg-white mt-2">
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">{id ? 'Chỉnh sửa đề thi' : 'Thêm đề thi mới'}</h2>
          <p className="text-secondary mb-0">Cung cấp cấu hình thời gian làm bài, kỹ năng, và số lượng câu hỏi.</p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Row className="g-3">
            {/* Course Selector */}
            <Col xs={12}>
              <Form.Group controlId="courseId">
                <Form.Label className="fw-semibold text-secondary">Lựa chọn khóa học <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  isInvalid={!!errors.courseId}
                  {...register('courseId')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting || isPending || !!id} // Disable selection in edit mode to prevent changing parent course
                >
                  <option value="">-- Chọn khóa học giảng dạy --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title} ({course.status})</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.courseId?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Title */}
            <Col xs={12}>
              <Form.Group controlId="title">
                <Form.Label className="fw-semibold text-secondary">Tiêu đề đề thi <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ví dụ: IELTS Reading Foundation Practice Test 1" 
                  isInvalid={!!errors.title}
                  {...register('title')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting || isPending}
                />
                <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Skill Selector */}
            <Col md={6}>
              <Form.Group controlId="skill">
                <Form.Label className="fw-semibold text-secondary">Kỹ năng <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  isInvalid={!!errors.skill}
                  {...register('skill')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting || isPending}
                >
                  <option value="">-- Chọn kỹ năng --</option>
                  <option value="Listening">Listening</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Speaking">Speaking</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.skill?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Band Scale */}
            <Col md={6}>
              <Form.Group controlId="bandScale">
                <Form.Label className="fw-semibold text-secondary">Thang điểm <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  isInvalid={!!errors.bandScale}
                  {...register('bandScale')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting || isPending}
                >
                  <option value="IELTS 0-9">IELTS Band 0-9 (Mặc định)</option>
                  <option value="TOEIC 0-990">TOEIC 0-990</option>
                  <option value="Score 0-100">Điểm số 0-100</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.bandScale?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Duration & Total Questions */}
            <Col md={6}>
              <Form.Group controlId="durationMinutes">
                <Form.Label className="fw-semibold text-secondary">Thời gian làm bài (Phút) <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  isInvalid={!!errors.durationMinutes}
                  {...register('durationMinutes')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting || isPending}
                />
                <Form.Control.Feedback type="invalid">{errors.durationMinutes?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="totalQuestions">
                <Form.Label className="fw-semibold text-secondary">Số lượng câu hỏi dự kiến <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  isInvalid={!!errors.totalQuestions}
                  {...register('totalQuestions')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting || isPending}
                />
                <Form.Control.Feedback type="invalid">{errors.totalQuestions?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top border-light">
            <Button 
              as={Link} 
              to="/teacher/tests" 
              variant="outline-secondary" 
              className="px-4 py-2 rounded-pill fw-semibold shadow-none border-gray text-secondary"
              disabled={submitting}
            >
              Hủy bỏ
            </Button>
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
                <>Lưu đề thi</>
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
