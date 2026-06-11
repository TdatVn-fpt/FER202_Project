import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Col, Card, Button, Form, Table, Modal, Spinner, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherTestService } from '../../services/teacherTestService';
import { teacherQuestionService } from '../../services/teacherQuestionService';
import { auditLogService } from '../../services/auditLogService';

// EARS[Ubiquitous]: The TestListPage component shall list and filter tests owned by the logged-in teacher
export default function TestListPage() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
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
      // Fetch teacher courses and tests
      const [coursesData, testsData] = await Promise.all([
        teacherCourseService.getCourses(teacherId),
        teacherTestService.getTests(teacherId)
      ]);
      setCourses(coursesData);
      setTests(testsData);

      // Fetch all questions to count questions per test on client-side
      // JSON-Server relationship matching
      const allQuestions = await Promise.all(
        testsData.map(test => teacherQuestionService.getQuestions(test.id))
      );
      setQuestions(allQuestions.flat());
    } catch (err) {
      // EARS[Unwanted]: WHERE server connections fail, THE system SHALL display an error message
      setError('Không thể kết nối đến máy chủ để tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (test) => {
    const matchedCourse = courses.find(c => c.id === test.courseId);
    // EARS[Unwanted]: Chặn xóa nếu khóa học chứa đề thi đang ở trạng thái pending
    if (matchedCourse?.status === 'pending') {
      toast.error('Không thể xóa đề thi thuộc khóa học đang chờ duyệt.');
      return;
    }
    setTestToDelete(test);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!testToDelete) return;
    setDeleting(true);
    try {
      // EARS[Ubiquitous]: Khi xóa bài test, hệ thống PHẢI tự động cascade xóa các câu hỏi thuộc bài test đó
      const relatedQuestions = questions.filter(q => q.testId === testToDelete.id);
      
      // Cascade delete questions
      for (const q of relatedQuestions) {
        await teacherQuestionService.deleteQuestion(q.id);
        await auditLogService.logAction(
          'DELETE_QUESTION',
          { questionId: q.id, testId: testToDelete.id },
          teacherId
        );
      }

      // Delete the test itself
      await teacherTestService.deleteTest(testToDelete.id);
      
      // EARS[Ubiquitous]: Mọi thao tác thay đổi dữ liệu PHẢI gửi kèm request ghi nhận lịch sử hoạt động vào auditLogs
      await auditLogService.logAction(
        'DELETE_TEST',
        { testId: testToDelete.id, title: testToDelete.title, courseId: testToDelete.courseId },
        teacherId
      );

      // Refresh list
      setTests(tests.filter(t => t.id !== testToDelete.id));
      setQuestions(questions.filter(q => q.testId !== testToDelete.id));
      toast.success('Xóa đề thi và các câu hỏi liên quan thành công!');
      setShowDeleteModal(false);
      setTestToDelete(null);
    } catch (err) {
      toast.error('Xóa đề thi thất bại. Vui lòng thử lại sau.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper to map course name
  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Khóa học không xác định';
  };

  // Helper to check if a test is locked due to pending course status
  const isTestLocked = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.status === 'pending';
  };

  // Helper to get number of questions for a test
  const getQuestionsCount = (testId) => {
    return questions.filter(q => q.testId === testId).length;
  };

  // Filtering
  const filteredTests = tests.filter(test => {
    const matchSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCourse = selectedCourseId ? test.courseId === selectedCourseId : true;
    const matchSkill = selectedSkill ? test.skill === selectedSkill : true;
    return matchSearch && matchCourse && matchSkill;
  });

  // Sort tests: group by course title, then sort by test title ascending
  const sortedTests = [...filteredTests].sort((a, b) => {
    const titleA = getCourseTitle(a.courseId);
    const titleB = getCourseTitle(b.courseId);
    if (titleA !== titleB) {
      return titleA.localeCompare(titleB);
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">Quản lý Đề thi & Câu hỏi</h2>
          <p className="text-secondary mb-0">Theo dõi, chỉnh sửa các đề thi thực hành IELTS của học sinh.</p>
        </div>
        <Button 
          as={Link}
          to="/teacher/tests/create"
          variant="primary" 
          className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm rounded-pill fw-semibold"
        >
          <i className="bi bi-plus-lg"></i> Thêm đề thi mới
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <Form className="row g-3">
          <Col md={6}>
            <Form.Group controlId="search">
              <Form.Label className="fw-semibold text-secondary">Tìm kiếm đề thi</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nhập tiêu đề đề thi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray shadow-none"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group controlId="skillFilter">
              <Form.Label className="fw-semibold text-secondary">Lọc theo kỹ năng</Form.Label>
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
        </Form>
      </Card>

      {/* Tests Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="primary" className="me-2" />
          <span className="text-secondary fw-semibold">Đang tải danh sách đề thi...</span>
        </div>
      ) : sortedTests.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5 rounded-3">
          <Card.Body>
            <i className="bi bi-file-earmark-check text-muted fs-1 mb-3"></i>
            <h5 className="fw-semibold text-secondary">Không tìm thấy đề thi nào</h5>
            <p className="text-muted small">Hãy tạo đề thi mới hoặc thay đổi bộ lọc tìm kiếm phía trên.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <Table responsive hover className="align-middle mb-0 text-secondary table-nowrap">
            <thead className="bg-light text-dark fw-bold">
              <tr>
                <th className="px-4 py-3">Tiêu đề đề thi</th>
                <th className="py-3">Khóa học</th>
                <th className="py-3">Kỹ năng</th>
                <th className="py-3">Thời gian</th>
                <th className="py-3">Số câu hỏi</th>
                <th className="py-3">Thang điểm</th>
                <th className="px-4 py-3 text-end" style={{ width: '220px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedTests.map(test => {
                const locked = isTestLocked(test.courseId);
                const actualQuestionsCount = getQuestionsCount(test.id);
                return (
                  <tr key={test.id} className="border-top border-light">
                    <td className="px-4 py-3 fw-bold text-dark">
                      {test.title}
                    </td>
                    <td className="py-3 small">
                      {getCourseTitle(test.courseId)}
                    </td>
                    <td className="py-3">
                      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 small rounded-3">
                        {test.skill}
                      </span>
                    </td>
                    <td className="py-3">
                      {test.durationMinutes} phút
                    </td>
                    <td className="py-3">
                      <span className="fw-semibold text-primary">{actualQuestionsCount}</span> / {test.totalQuestions || 40} câu
                    </td>
                    <td className="py-3 text-truncate small">
                      {test.bandScale || 'IELTS 0-9'}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button 
                          as={Link}
                          to={`/teacher/tests/${test.id}/questions`}
                          variant="outline-primary"
                          className="py-1 px-2.5 rounded-3 d-inline-flex align-items-center gap-1.5 fw-semibold small"
                          title="Quản lý câu hỏi"
                        >
                          <i className="bi bi-list-task"></i> Câu hỏi
                        </Button>

                        {/* EARS[State-driven]: TRONG KHI khóa học đang pending, vô hiệu hóa nút Edit/Delete */}
                        {locked ? (
                          <>
                            <Button 
                              variant="outline-secondary"
                              disabled
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0 shadow-none text-muted"
                              title="Khóa học đang chờ duyệt, không thể sửa đề thi"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                            <Button 
                              variant="outline-danger"
                              disabled
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0 shadow-none text-muted"
                              title="Khóa học đang chờ duyệt, không thể xóa đề thi"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              as={Link}
                              to={`/teacher/tests/${test.id}/edit`}
                              variant="outline-secondary"
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Sửa thông tin"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                            <Button 
                              variant="outline-danger"
                              onClick={() => handleDeleteClick(test)}
                              className="py-1.5 px-2.5 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Xóa đề thi"
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
          <Modal.Title className="fw-bold text-dark">Xác nhận xóa đề thi</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          Bạn có chắc chắn muốn xóa đề thi <strong className="text-danger">"{testToDelete?.title}"</strong> không?
          Hành động này sẽ <strong>xóa toàn bộ câu hỏi liên kết</strong> thuộc đề thi này và không thể hoàn tác.
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
