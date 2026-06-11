import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Col, Card, Button, Form, Table, Modal, Spinner, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherLessonService } from '../../services/teacherLessonService';
import { auditLogService } from '../../services/auditLogService';

export default function LessonListPage() {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, lessonsData] = await Promise.all([
        teacherCourseService.getCourses(teacherId),
        teacherLessonService.getLessons(teacherId)
      ]);
      setCourses(coursesData);
      setLessons(lessonsData);
    } catch (err) {
      // EARS[Unwanted]: WHERE server connections fail, THE system SHALL display an error message
      setError('Không thể kết nối đến máy chủ để tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (lesson) => {
    const matchedCourse = courses.find(c => c.id === lesson.courseId);
    // EARS[Unwanted]: Chặn xóa nếu khóa học chứa bài học có trạng thái pending
    if (matchedCourse?.status === 'pending') {
      toast.error('Không thể xóa bài học thuộc khóa học đang chờ duyệt.');
      return;
    }
    setLessonToDelete(lesson);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!lessonToDelete) return;
    setDeleting(true);
    try {
      await teacherLessonService.deleteLesson(lessonToDelete.id);
      
      // EARS[Ubiquitous]: Mọi thao tác thay đổi dữ liệu PHẢI gửi kèm request ghi nhận lịch sử hoạt động vào auditLogs
      await auditLogService.logAction(
        'DELETE_LESSON',
        { lessonId: lessonToDelete.id, title: lessonToDelete.title, courseId: lessonToDelete.courseId },
        teacherId
      );

      setLessons(lessons.filter(l => l.id !== lessonToDelete.id));
      toast.success('Xóa bài học thành công!');
      setShowDeleteModal(false);
      setLessonToDelete(null);
    } catch (err) {
      toast.error('Xóa bài học thất bại. Vui lòng thử lại sau.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper to map course name
  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Khóa học không xác định';
  };

  // Helper to check if a lesson is locked due to pending course status
  const isLessonLocked = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.status === 'pending';
  };

  // Filtering
  const filteredLessons = lessons.filter(lesson => {
    const matchSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCourse = selectedCourseId ? lesson.courseId === selectedCourseId : true;
    return matchSearch && matchCourse;
  });

  // Sort lessons: group by course title, then sort by order ascending
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    const titleA = getCourseTitle(a.courseId);
    const titleB = getCourseTitle(b.courseId);
    if (titleA !== titleB) {
      return titleA.localeCompare(titleB);
    }
    return Number(a.order) - Number(b.order);
  });

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">Quản lý Giáo trình & Bài học</h2>
          <p className="text-secondary mb-0">Theo dõi, chỉnh sửa thứ tự bài giảng và thời lượng bài học.</p>
        </div>
        <Button 
          as={Link}
          to="/teacher/lessons/create"
          variant="primary" 
          className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm rounded-pill fw-semibold"
        >
          <i className="bi bi-plus-lg"></i> Thêm bài học mới
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <Form className="row g-3">
          <Col md={8}>
            <Form.Group controlId="search">
              <Form.Label className="fw-semibold text-secondary">Tìm kiếm bài học</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nhập tiêu đề bài học..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray shadow-none"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="courseFilter">
              <Form.Label className="fw-semibold text-secondary">Lọc theo khóa học</Form.Label>
              <Form.Select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="border-gray shadow-none"
              >
                <option value="">Tất cả khóa học</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title} ({course.status})</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Form>
      </Card>

      {/* Lessons Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="primary" className="me-2" />
          <span className="text-secondary fw-semibold">Đang tải danh sách bài học...</span>
        </div>
      ) : sortedLessons.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5 rounded-3">
          <Card.Body>
            <i className="bi bi-collection-play text-muted fs-1 mb-3"></i>
            <h5 className="fw-semibold text-secondary">Không tìm thấy bài học nào</h5>
            <p className="text-muted small">Hãy tạo bài học mới hoặc thay đổi bộ lọc tìm kiếm phía trên.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <Table responsive hover className="align-middle mb-0 text-secondary table-nowrap">
            <thead className="bg-light text-dark fw-bold">
              <tr>
                <th className="px-4 py-3" style={{ width: '80px' }}>Thứ tự</th>
                <th className="py-3">Tiêu đề bài học</th>
                <th className="py-3">Khóa học</th>
                <th className="py-3" style={{ width: '120px' }}>Thời lượng</th>
                <th className="py-3">Nội dung / File âm thanh</th>
                <th className="px-4 py-3 text-end" style={{ width: '120px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedLessons.map(lesson => {
                const locked = isLessonLocked(lesson.courseId);
                return (
                  <tr key={lesson.id} className="border-top border-light">
                    <td className="px-4 py-3 text-center fw-semibold text-primary">
                      {lesson.order}
                    </td>
                    <td className="py-3 fw-bold text-dark">
                      {lesson.title}
                    </td>
                    <td className="py-3 small">
                      {getCourseTitle(lesson.courseId)}
                    </td>
                    <td className="py-3">
                      {lesson.durationMinutes} phút
                    </td>
                    <td className="py-3 small text-truncate" style={{ maxWidth: '250px' }}>
                      {lesson.audioUrl ? (
                        <span className="d-flex align-items-center gap-1 text-success">
                          <i className="bi bi-volume-up-fill"></i> {lesson.audioUrl}
                        </span>
                      ) : (
                        <span className="text-muted">{lesson.contentUrl || 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        {/* EARS[State-driven]: TRONG KHI khóa học đang pending, vô hiệu hóa nút Edit/Delete */}
                        {locked ? (
                          <>
                            <Button 
                              variant="outline-secondary"
                              disabled
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0 shadow-none text-muted"
                              title="Khóa học đang chờ duyệt, không thể sửa bài học"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                            <Button 
                              variant="outline-danger"
                              disabled
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0 shadow-none text-muted"
                              title="Khóa học đang chờ duyệt, không thể xóa bài học"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              as={Link}
                              to={`/teacher/lessons/${lesson.id}/edit`}
                              variant="outline-secondary"
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Sửa thông tin"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                            <Button 
                              variant="outline-danger"
                              onClick={() => handleDeleteClick(lesson)}
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Xóa bài học"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-dark">Xác nhận xóa bài học</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          Bạn có chắc chắn muốn xóa bài học <strong className="text-danger">"{lessonToDelete?.title}"</strong> không? 
          Hành động này không thể hoàn tác.
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
