import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container, Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { auditLogService } from '../../services/auditLogService';

const courseSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  skill: z.enum(['Listening', 'Reading', 'Writing', 'Speaking'], {
    errorMap: () => ({ message: 'Vui lòng chọn kỹ năng' }),
  }),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    errorMap: () => ({ message: 'Vui lòng chọn trình độ' }),
  }),
  price: z.coerce.number().min(0, 'Giá không được nhỏ hơn 0'),
  durationWeeks: z.coerce.number().int('Thời lượng phải là số nguyên').min(1, 'Thời lượng phải ít nhất 1 tuần'),
  thumbnail: z.string().optional().refine(val => !val || val.startsWith('http'), {
    message: 'Ảnh thumbnail phải là link URL hợp lệ (bắt đầu bằng http)'
  })
});

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      skill: 'Reading',
      level: 'Beginner',
      price: 0,
      durationWeeks: 4,
      thumbnail: ''
    }
  });

  const priceValue = watch('price');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // EARS[Event-driven]: KHI Teacher tạo một khóa học mới, hệ thống PHẢI thiết lập status = "draft"
      const payload = {
        ...data,
        teacherId,
        status: 'draft',
        enrolledCount: 0,
        isPremium: data.price > 0,
        createdAt: new Date().toISOString()
      };

      const newCourse = await teacherCourseService.createCourse(payload);
      
      // EARS[Ubiquitous]: Mọi thao tác thay đổi dữ liệu PHẢI gửi kèm request ghi nhận lịch sử hoạt động vào auditLogs
      await auditLogService.logAction(
        'CREATE_COURSE',
        { courseId: newCourse.id, title: newCourse.title },
        teacherId
      );

      toast.success('Tạo khóa học nháp thành công!');
      navigate('/teacher/courses');
    } catch (error) {
      toast.error('Tạo khóa học thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '800px' }}>
      {/* Back Button */}
      <Link 
        to="/teacher/courses" 
        className="text-decoration-none text-muted mb-4 d-inline-flex align-items-center gap-2 fw-semibold transition-all hover-translate-x"
        style={{ fontSize: '14px' }}
      >
        <i className="bi bi-arrow-left"></i> Quay lại quản lý khóa học
      </Link>

      <Card className="border-0 shadow-sm p-4 p-md-5 rounded-3 bg-white mt-2">
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">Tạo khóa học mới</h2>
          <p className="text-secondary mb-0">Thiết lập thông tin cơ bản cho lộ trình học IELTS mới.</p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Row className="g-3">
            {/* Title */}
            <Col xs={12}>
              <Form.Group controlId="title">
                <Form.Label className="fw-semibold text-secondary">Tiêu đề khóa học <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ví dụ: IELTS Reading Complete Guide..." 
                  isInvalid={!!errors.title}
                  {...register('title')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Description */}
            <Col xs={12}>
              <Form.Group controlId="description">
                <Form.Label className="fw-semibold text-secondary">Mô tả khóa học <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4}
                  placeholder="Mô tả tóm tắt nội dung, kiến thức và đầu ra của khóa học..." 
                  isInvalid={!!errors.description}
                  {...register('description')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Skill & Level */}
            <Col md={6}>
              <Form.Group controlId="skill">
                <Form.Label className="fw-semibold text-secondary">Kỹ năng chuyên môn <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  isInvalid={!!errors.skill}
                  {...register('skill')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting}
                >
                  <option value="Listening">Listening</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Speaking">Speaking</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.skill?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="level">
                <Form.Label className="fw-semibold text-secondary">Trình độ khóa học <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  isInvalid={!!errors.level}
                  {...register('level')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting}
                >
                  <option value="Beginner">Beginner (3.0 - 4.5)</option>
                  <option value="Intermediate">Intermediate (5.0 - 6.5)</option>
                  <option value="Advanced">Advanced (7.0+)</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.level?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Duration & Price */}
            <Col md={6}>
              <Form.Group controlId="durationWeeks">
                <Form.Label className="fw-semibold text-secondary">Thời lượng (Tuần) <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  isInvalid={!!errors.durationWeeks}
                  {...register('durationWeeks')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.durationWeeks?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="price">
                <Form.Label className="fw-semibold text-secondary">Giá học phí (VND) <span className="text-danger">*</span></Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="number" 
                    placeholder="0"
                    isInvalid={!!errors.price}
                    {...register('price')}
                    className="py-2.5 px-3 border-gray"
                    disabled={submitting}
                  />
                  {Number(priceValue) > 0 && (
                    <span 
                      className="position-absolute badge rounded-pill bg-primary text-white" 
                      style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px' }}
                    >
                      Premium
                    </span>
                  )}
                  {Number(priceValue) === 0 && (
                    <span 
                      className="position-absolute badge rounded-pill bg-success text-white" 
                      style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px' }}
                    >
                      Miễn phí
                    </span>
                  )}
                  <Form.Control.Feedback type="invalid">{errors.price?.message}</Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>

            {/* Thumbnail URL */}
            <Col xs={12}>
              <Form.Group controlId="thumbnail">
                <Form.Label className="fw-semibold text-secondary">Đường dẫn ảnh Thumbnail (Tùy chọn)</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="https://example.com/image.jpg" 
                  isInvalid={!!errors.thumbnail}
                  {...register('thumbnail')}
                  className="py-2.5 px-3 border-gray"
                  disabled={submitting}
                />
                <Form.Control.Feedback type="invalid">{errors.thumbnail?.message}</Form.Control.Feedback>
                <Form.Text className="text-muted small">Cung cấp đường dẫn URL ảnh để minh họa cho khóa học trên Dashboard.</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top border-light">
            <Button 
              as={Link} 
              to="/teacher/courses" 
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
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" animation="border" /> Đang tạo...
                </>
              ) : (
                <>Lưu bản nháp</>
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
