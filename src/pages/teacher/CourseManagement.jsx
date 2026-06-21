import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, Alert } from 'react-bootstrap';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // States Modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = getCurrentUser();
  // EARS[Ubiquitous]: THE system SHALL restrict courses list to only the teacher's owned courses.
  const teacherId = currentUser?.id || 'u-teacher-001';

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherCourseService.getCourses(teacherId);
      setCourses(data);
    } catch (err) {
      // EARS[Unwanted]: WHERE server connections fail, THE system SHALL display an error message.
      setError('Không thể kết nối đến máy chủ để lấy danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý bộ lọc và tìm kiếm client-side
  const filteredCourses = courses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSkill = selectedSkill ? course.skill === selectedSkill : true;
    const matchLevel = selectedLevel ? course.level === selectedLevel : true;
    const matchStatus = selectedStatus ? course.status === selectedStatus : true;
    return matchSearch && matchSkill && matchLevel && matchStatus;
  });

  const handleDeleteClick = (course) => {
    // EARS[Unwanted]: WHERE course is approved or pending, THE system SHALL prevent deletion.
    if (course.status === 'approved' || course.status === 'pending') {
      alert('Không thể xóa khóa học đã được duyệt hoặc đang chờ phê duyệt.');
      return;
    }
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      await teacherCourseService.deleteCourse(courseToDelete.id);
      setCourses(courses.filter(c => c.id !== courseToDelete.id));
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err) {
      alert('Xóa khóa học thất bại. Vui lòng thử lại sau.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success-subtle" className="text-success rounded-pill px-3 py-1.5 text-uppercase">Approved</Badge>;
      case 'pending':
        return <Badge bg="warning-subtle" className="text-warning rounded-pill px-3 py-1.5 text-uppercase">Pending</Badge>;
      case 'rejected':
        return <Badge bg="danger-subtle" className="text-danger rounded-pill px-3 py-1.5 text-uppercase">Rejected</Badge>;
      default:
        return <Badge bg="secondary-subtle" className="text-secondary rounded-pill px-3 py-1.5 text-uppercase">Draft</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">Quản lý Khóa học</h2>
          <p className="text-secondary mb-0">Xây dựng, chỉnh sửa và gửi kiểm duyệt các khóa học IELTS của bạn.</p>
        </div>
        <Button 
          as={Link}
          to="/teacher/courses/create"
          variant="primary" 
          className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm rounded-pill fw-semibold"
        >
          <i className="bi bi-plus-lg"></i> Tạo khóa học mới
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <Form className="row g-3">
          <Col lg={4} md={6}>
            <Form.Group controlId="search">
              <Form.Label className="fw-semibold text-secondary">Tìm kiếm theo tên</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nhập tên khóa học..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray shadow-none"
              />
            </Form.Group>
          </Col>
          <Col lg={2} md={6}>
            <Form.Group controlId="skill">
              <Form.Label className="fw-semibold text-secondary">Kỹ năng</Form.Label>
              <Form.Select 
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="border-gray shadow-none"
              >
                <option value="">Tất cả kỹ năng</option>
                <option value="Listening">Listening</option>
                <option value="Reading">Reading</option>
                <option value="Writing">Writing</option>
                <option value="Speaking">Speaking</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col lg={3} md={6}>
            <Form.Group controlId="level">
              <Form.Label className="fw-semibold text-secondary">Trình độ</Form.Label>
              <Form.Select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border-gray shadow-none"
              >
                <option value="">Tất cả trình độ</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col lg={3} md={6}>
            <Form.Group controlId="status">
              <Form.Label className="fw-semibold text-secondary">Trạng thái duyệt</Form.Label>
              <Form.Select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border-gray shadow-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Form>
      </Card>

      {/* Grid Danh sách khóa học */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="primary" className="me-2" />
          <span className="text-secondary fw-semibold">Đang tải danh sách khóa học...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5 rounded-3">
          <Card.Body>
            <i className="bi bi-journal-x text-muted fs-1 mb-3"></i>
            <h5 className="fw-semibold text-secondary">Không tìm thấy khóa học nào</h5>
            <p className="text-muted small">Hãy tạo khóa học mới hoặc thay đổi bộ lọc tìm kiếm phía trên.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredCourses.map(course => (
            <Col key={course.id} xl={4} md={6}>
              <Card className="border-0 shadow-sm h-100 rounded-3 overflow-hidden bg-white d-flex flex-column transition-all hover-shadow">
                
                {/* Thumbnail khóa học */}
                <div className="position-relative bg-light" style={{ height: '180px' }}>
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted bg-secondary bg-opacity-10">
                      <i className="bi bi-image fs-1 text-secondary"></i>
                    </div>
                  )}
                  {/* Skill Badge trên góc */}
                  <div className="position-absolute top-0 start-0 m-3 d-flex gap-1.5 flex-column">
                    <Badge bg="primary" className="px-3 py-1.5 shadow-sm rounded-pill text-uppercase">{course.skill}</Badge>
                    <Badge bg="info" className="text-dark px-3 py-1.5 shadow-sm rounded-pill text-uppercase">{course.level}</Badge>
                  </div>
                </div>

                <Card.Body className="p-4 d-flex flex-column flex-grow-1">
                  
                  {/* Trạng thái duyệt */}
                  <div className="mb-2">{getStatusBadge(course.status)}</div>

                  {/* Tiêu đề & Mô tả */}
                  <h5 className="card-title fw-bold text-dark mb-2 text-truncate-2">{course.title}</h5>
                  <p className="card-text text-secondary text-truncate-3 small mb-4">{course.description}</p>

                  <div className="mt-auto">
                    {/* Thông số khóa học */}
                    <div className="d-flex justify-content-between align-items-center border-top border-light pt-3 mb-4 text-secondary small">
                      <span><i className="bi bi-clock me-1 text-primary"></i>{course.durationWeeks || 0} tuần</span>
                      <span><i className="bi bi-people me-1 text-primary"></i>{course.enrolledCount || 0} học viên</span>
                      <span>
                        <i className="bi bi-cash-stack me-1 text-primary"></i>
                        {course.price === 0 ? <strong className="text-success">Miễn phí</strong> : `${course.price.toLocaleString('vi-VN')} đ`}
                      </span>
                    </div>

                    {/* Nút thao tác */}
                    <div className="d-flex gap-2">
                      <Button 
                        as={Link}
                        to={`/teacher/courses/${course.id}`}
                        variant="outline-primary"
                        className="flex-grow-1 py-2 rounded-pill fw-semibold text-center small"
                      >
                        Giáo trình
                      </Button>
                      
                      {/* EARS[Unwanted]: WHERE course is pending, THE system SHALL disable the edit button to lock changes. */}
                      <Button 
                        as={Link}
                        to={`/teacher/courses/${course.id}/edit`}
                        variant="outline-secondary"
                        disabled={course.status === 'pending'}
                        className="py-2 px-3 rounded-circle d-flex align-items-center justify-content-center"
                        title={course.status === 'pending' ? 'Khóa học đang chờ duyệt, không thể sửa' : 'Sửa thông tin'}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>

                      {/* EARS[Unwanted]: WHERE course is approved or pending, THE system SHALL disable/prevent deletion. */}
                      <Button 
                        variant="outline-danger"
                        disabled={course.status === 'approved' || course.status === 'pending'}
                        onClick={() => handleDeleteClick(course)}
                        className="py-2 px-3 rounded-circle d-flex align-items-center justify-content-center"
                        title={course.status === 'approved' || course.status === 'pending' ? 'Không thể xóa khóa học đã duyệt hoặc chờ duyệt' : 'Xóa khóa học'}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>

                </Card.Body>

              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-dark">Xác nhận xóa khóa học</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          Bạn có chắc chắn muốn xóa khóa học <strong className="text-danger">"{courseToDelete?.title}"</strong> không? 
          Tất cả dữ liệu liên quan sẽ bị xóa và hành động này không thể phục hồi.
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
