import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Form, Modal, Spinner, Table } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherTestService } from '../../services/teacherTestService';
import { teacherQuestionService } from '../../services/teacherQuestionService';
import { auditLogService } from '../../services/auditLogService';
import { matchesTestId } from '../../utils/testModel';

export default function TestListPage() {
  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [testToAssign, setTestToAssign] = useState(null);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, testsData] = await Promise.all([
        teacherCourseService.getCourses(teacherId),
        teacherTestService.getTests(teacherId),
      ]);
      setCourses(coursesData);
      setTests(testsData);

      const questionGroups = await Promise.all(
        testsData.map((test) => teacherQuestionService.getQuestions(test.id))
      );
      setQuestions(questionGroups.flat());
    } catch (err) {
      setError('Không thể kết nối đến máy chủ để tải danh sách đề thi.');
    } finally {
      setLoading(false);
    }
  };

  const getCourseTitle = useCallback((courseId) => {
    if (!courseId) return 'Chưa gán khóa học';
    const course = courses.find((item) => String(item.id) === String(courseId));
    return course ? course.title : 'Khóa học không xác định';
  }, [courses]);

  const isTestLocked = (courseId) => {
    const course = courses.find((item) => String(item.id) === String(courseId));
    return course?.status === 'pending';
  };

  const getQuestionsCount = (testId) => {
    return questions.filter((question) => matchesTestId(question.testId, testId)).length;
  };

  const filteredTests = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return tests.filter((test) => {
      const matchSearch = !keyword || test.title?.toLowerCase().includes(keyword);
      const matchCourse = selectedCourseId ? String(test.courseId) === String(selectedCourseId) : true;
      const matchSkill = selectedSkill ? test.skill === selectedSkill : true;
      const matchMode = selectedMode ? test.testMode === selectedMode : true;
      return matchSearch && matchCourse && matchSkill && matchMode;
    }).sort((a, b) => {
      const courseCompare = getCourseTitle(a.courseId).localeCompare(getCourseTitle(b.courseId));
      if (courseCompare !== 0) return courseCompare;
      return String(a.title).localeCompare(String(b.title));
    });
  }, [tests, searchQuery, selectedCourseId, selectedSkill, selectedMode, getCourseTitle]);

  const handleDeleteClick = (test) => {
    if (isTestLocked(test.courseId)) {
      toast.error('Không thể xóa đề thi thuộc khóa học đang chờ duyệt.');
      return;
    }
    setTestToDelete(test);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!testToDelete) return;
    setWorking(true);
    try {
      const relatedQuestions = questions.filter((question) => matchesTestId(question.testId, testToDelete.id));
      for (const question of relatedQuestions) {
        await teacherQuestionService.deleteQuestion(question.id);
        await auditLogService.logAction('DELETE_QUESTION', { questionId: question.id, testId: testToDelete.id }, teacherId);
      }
      await teacherTestService.deleteTest(testToDelete.id);
      await auditLogService.logAction(
        'DELETE_TEST',
        { testId: testToDelete.id, title: testToDelete.title, courseId: testToDelete.courseId },
        teacherId
      );
      setTests((prev) => prev.filter((item) => item.id !== testToDelete.id));
      setQuestions((prev) => prev.filter((item) => !matchesTestId(item.testId, testToDelete.id)));
      toast.success('Đã xóa đề thi và câu hỏi liên quan.');
      setShowDeleteModal(false);
      setTestToDelete(null);
    } catch (err) {
      toast.error('Xóa đề thi thất bại.');
    } finally {
      setWorking(false);
    }
  };

  const handleTogglePublish = async (test) => {
    setWorking(true);
    try {
      const nextStatus = test.status === 'published' ? 'draft' : 'published';
      const updated = await teacherTestService.updateTest(test.id, { status: nextStatus, updatedAt: new Date().toISOString() });
      await auditLogService.logAction(
        nextStatus === 'published' ? 'PUBLISH_TEST' : 'UNPUBLISH_TEST',
        { testId: test.id, title: test.title },
        teacherId
      );
      setTests((prev) => prev.map((item) => item.id === test.id ? { ...item, ...updated } : item));
      toast.success(nextStatus === 'published' ? 'Đã publish test.' : 'Đã chuyển test về draft.');
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái test.');
    } finally {
      setWorking(false);
    }
  };

  const openAssignModal = (test) => {
    setTestToAssign(test);
    setAssignCourseId(test.courseId || '');
    setShowAssignModal(true);
  };

  const handleAssignCourse = async () => {
    if (!testToAssign) return;
    setWorking(true);
    try {
      const payload = assignCourseId
        ? { testMode: 'course', courseId: assignCourseId, updatedAt: new Date().toISOString() }
        : { testMode: 'free', courseId: '', updatedAt: new Date().toISOString() };
      const updated = await teacherTestService.updateTest(testToAssign.id, payload);
      await auditLogService.logAction(
        'ASSIGN_TEST_COURSE',
        { testId: testToAssign.id, courseId: assignCourseId || null },
        teacherId
      );
      setTests((prev) => prev.map((item) => item.id === testToAssign.id ? { ...item, ...updated } : item));
      toast.success(assignCourseId ? 'Đã gán test vào khóa học.' : 'Đã chuyển test sang Free.');
      setShowAssignModal(false);
      setTestToAssign(null);
    } catch (err) {
      toast.error('Gán khóa học thất bại.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="container-fluid py-4 test-management-page">
      <style>
        {`
          .test-management-page {
            animation: testPageEnter 220ms ease both;
          }

          .test-filter-card,
          .test-table-card {
            animation: testPanelEnter 260ms ease both;
            transition: transform 180ms ease, box-shadow 180ms ease;
          }

          .test-filter-card:hover,
          .test-table-card:hover {
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1) !important;
          }

          .test-management-row {
            transition: transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
          }

          .test-management-row:hover {
            transform: translateY(-2px);
            background: #f8fafc;
            box-shadow: inset 4px 0 0 #0d6efd;
          }

          .test-table-card .btn,
          .test-filter-card .form-control,
          .test-filter-card .form-select {
            transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
          }

          .test-table-card .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
          }

          .test-filter-card .form-control:focus,
          .test-filter-card .form-select:focus {
            border-color: #86b7fe;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12);
          }

          @keyframes testPageEnter {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes testPanelEnter {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">IELTS Test Builder</h2>
          <p className="text-secondary mb-0">Tạo free test, course test, publish và gán test vào khóa học.</p>
        </div>
        <Button as={Link} to="/teacher/tests/create" variant="primary" className="rounded-pill px-4 fw-semibold">
          Thêm test mới
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="test-filter-card border-0 shadow-sm p-4 mb-4">
        <Form className="row g-3">
          <Col md={4}>
            <Form.Label>Tìm test</Form.Label>
            <Form.Control value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nhập tiêu đề..." />
          </Col>
          <Col md={3}>
            <Form.Label>Khóa học</Form.Label>
            <Form.Select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
              <option value="">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Kỹ năng</Form.Label>
            <Form.Select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
              <option value="Writing">Writing</option>
              <option value="Speaking">Speaking</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Mode</Form.Label>
            <Form.Select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="free">Free</option>
              <option value="course">Course</option>
            </Form.Select>
          </Col>
        </Form>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải danh sách test...</p>
        </div>
      ) : (
        <Card className="test-table-card border-0 shadow-sm overflow-hidden">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Test</th>
                <th>Kỹ năng</th>
                <th>Mode</th>
                <th>Khóa học</th>
                <th>Status</th>
                <th>Lượt</th>
                <th>Câu hỏi</th>
                <th className="text-end px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => {
                const locked = isTestLocked(test.courseId);
                return (
                  <tr key={test.id} className="test-management-row">
                    <td className="px-4">
                      <div className="fw-bold text-dark">{test.title}</div>
                      <div className="small text-muted">{test.durationMinutes} phút · {test.bandScale}</div>
                    </td>
                    <td><Badge bg="secondary">{test.skill}</Badge></td>
                    <td>
                      <Badge bg={test.testMode === 'free' ? 'success' : 'primary'}>
                        {test.testMode === 'free' ? 'Free' : 'Course'}
                      </Badge>
                      {test.isFreePreview && <Badge bg="warning" text="dark" className="ms-1">Preview</Badge>}
                    </td>
                    <td className="small">{getCourseTitle(test.courseId)}</td>
                    <td>
                      <Badge bg={test.status === 'published' ? 'success' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </td>
                    <td>{test.attemptLimit ? `${test.attemptLimit} lần` : 'Không giới hạn'}</td>
                    <td>
                      <span className="fw-semibold text-primary">{getQuestionsCount(test.id)}</span> / {test.totalQuestions}
                    </td>
                    <td className="text-end px-4">
                      <div className="d-flex gap-2 justify-content-end flex-wrap">
                        {test.skill !== 'Writing' && (
                          <Button as={Link} to={`/teacher/tests/${test.id}/questions`} size="sm" variant="outline-primary">
                            Câu hỏi
                          </Button>
                        )}
                        <Button as={Link} to={`/teacher/tests/${test.id}/edit`} size="sm" variant="outline-secondary" disabled={locked}>
                          Sửa
                        </Button>
                        <Button size="sm" variant="outline-info" onClick={() => openAssignModal(test)} disabled={working}>
                          Gán
                        </Button>
                        <Button size="sm" variant={test.status === 'published' ? 'outline-warning' : 'outline-success'} onClick={() => handleTogglePublish(test)} disabled={working}>
                          {test.status === 'published' ? 'Draft' : 'Publish'}
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(test)} disabled={locked || working}>
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">Không tìm thấy test phù hợp.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Xác nhận xóa test</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa <strong>{testToDelete?.title}</strong> và toàn bộ câu hỏi liên quan?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={working}>
            {working ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Gán test vào khóa học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Khóa học</Form.Label>
          <Form.Select value={assignCourseId} onChange={(e) => setAssignCourseId(e.target.value)}>
            <option value="">Không gán - chuyển thành Free test</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title} ({course.status})</option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowAssignModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleAssignCourse} disabled={working}>
            {working ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
