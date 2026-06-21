import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherLessonService } from '../../services/teacherLessonService';
import { teacherTestService } from '../../services/teacherTestService';
import { teacherStudentService } from '../../services/teacherStudentService';
import { teacherApprovalService } from '../../services/teacherApprovalService';

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    coursesCount: 0,
    lessonsCount: 0,
    testsCount: 0,
    studentsCount: 0
  });
  const [recentApprovals, setRecentApprovals] = useState([]);

  const currentUser = getCurrentUser();
  // EARS[Ubiquitous]: THE system SHALL restrict dashboard view to only teacher's own content metrics.
  const teacherId = currentUser?.id || 'u-teacher-001';

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const fetchDashboardData = async () => {
    // EARS[State]: WHILE API is fetching dashboard metrics, THE system SHALL show loading spinner.
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch courses, lessons, tests, enrollments, and approval requests
      const [courses, lessons, tests, enrollments, approvals] = await Promise.all([
        teacherCourseService.getCourses(teacherId),
        teacherLessonService.getLessons(teacherId),
        teacherTestService.getTests(teacherId),
        teacherStudentService.getEnrollments(),
        teacherApprovalService.getApprovalRequests(teacherId)
      ]);

      // 2. Tính số lượng học sinh tham gia khóa học của giáo viên này
      const teacherCourseIds = courses.map(course => String(course.id));
      const activeEnrollments = enrollments.filter(enrollment => 
        teacherCourseIds.includes(String(enrollment.courseId))
      );
      
      // Đếm số lượng học viên duy nhất
      const uniqueUserIds = new Set(activeEnrollments.map(enrollment => enrollment.userId));

      setStats({
        coursesCount: courses.length,
        lessonsCount: lessons.length,
        testsCount: tests.length,
        studentsCount: uniqueUserIds.size
      });

      // 3. Lọc lấy tối đa 5 yêu cầu phê duyệt gần nhất, sắp xếp giảm dần theo thời gian tạo
      const sortedApprovals = [...approvals]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setRecentApprovals(sortedApprovals);

    } catch (err) {
      // EARS[Unwanted]: WHERE service requests fail, THE system SHALL handle the error gracefully showing alert warning.
      setError('Không thể tải dữ liệu thống kê Dashboard. Vui lòng kiểm tra lại kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" className="me-2" />
        <span className="text-secondary fw-semibold">Đang tải dữ liệu Dashboard...</span>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Tiêu đề */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Teacher Dashboard</h2>
        <p className="text-secondary mb-0">Chào mừng trở lại, {currentUser?.fullName || 'Giảng viên'}. Dưới đây là thống kê tổng quan về nội dung giảng dạy của bạn.</p>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* 4 Khối thống kê chính */}
      <Row className="g-4 mb-4">
        {/* Khóa học */}
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="d-flex align-items-center p-4">
              <div className="rounded-3 bg-primary bg-opacity-10 p-3 text-primary me-3">
                <i className="bi bi-book fs-3"></i>
              </div>
              <div>
                <span className="text-muted small fw-medium d-block text-uppercase">Khóa học đã tạo</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats.coursesCount}</h3>
              </div>
            </div>
            <div className="bg-primary bg-opacity-10 py-2 px-4 border-top">
              <small className="text-primary fw-medium">Xem danh sách khóa học</small>
            </div>
          </Card>
        </Col>

        {/* Bài học */}
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="d-flex align-items-center p-4">
              <div className="rounded-3 bg-success bg-opacity-10 p-3 text-success me-3">
                <i className="bi bi-journal-text fs-3"></i>
              </div>
              <div>
                <span className="text-muted small fw-medium d-block text-uppercase">Bài học đã viết</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats.lessonsCount}</h3>
              </div>
            </div>
            <div className="bg-success bg-opacity-10 py-2 px-4 border-top">
              <small className="text-success fw-medium">Xem giáo trình chi tiết</small>
            </div>
          </Card>
        </Col>

        {/* Bài test */}
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="d-flex align-items-center p-4">
              <div className="rounded-3 bg-info bg-opacity-10 p-3 text-info me-3">
                <i className="bi bi-file-earmark-check fs-3"></i>
              </div>
              <div>
                <span className="text-muted small fw-medium d-block text-uppercase">Đề luyện tập (Tests)</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats.testsCount}</h3>
              </div>
            </div>
            <div className="bg-info bg-opacity-10 py-2 px-4 border-top">
              <small className="text-info fw-medium">Quản lý ngân hàng đề</small>
            </div>
          </Card>
        </Col>

        {/* Học viên */}
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 bg-white h-100 overflow-hidden">
            <div className="d-flex align-items-center p-4">
              <div className="rounded-3 bg-warning bg-opacity-10 p-3 text-warning me-3">
                <i className="bi bi-people fs-3"></i>
              </div>
              <div>
                <span className="text-muted small fw-medium d-block text-uppercase">Học viên đang học</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats.studentsCount}</h3>
              </div>
            </div>
            <div className="bg-warning bg-opacity-10 py-2 px-4 border-top">
              <small className="text-warning fw-medium">Theo dõi tiến độ học</small>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bảng danh sách phê duyệt gần đây */}
      <Card className="border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark">5 Yêu cầu phê duyệt gần đây</h5>
          <Badge bg="secondary-subtle" className="text-secondary fw-semibold">Gần nhất</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {recentApprovals.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clock-history text-muted fs-2 mb-2"></i>
              <p className="text-secondary mb-0">Chưa có yêu cầu duyệt nội dung nào được gửi đi.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 ps-4 text-uppercase text-secondary fw-bold fs-7">Loại nội dung</th>
                  <th className="py-3 text-uppercase text-secondary fw-bold fs-7">ID Nội dung</th>
                  <th className="py-3 text-uppercase text-secondary fw-bold fs-7">Ngày gửi yêu cầu</th>
                  <th className="py-3 text-uppercase text-secondary fw-bold fs-7">Trạng thái</th>
                  <th className="py-3 pe-4 text-uppercase text-secondary fw-bold fs-7">Ghi chú / Lý do</th>
                </tr>
              </thead>
              <tbody>
                {recentApprovals.map((req) => (
                  <tr key={req.id}>
                    <td className="ps-4">
                      <span className="fw-bold text-dark text-capitalize">{req.contentType === 'course' ? 'Khóa học' : req.contentType}</span>
                    </td>
                    <td>
                      <code className="text-muted">{req.contentId}</code>
                    </td>
                    <td>
                      <span className="text-secondary small fw-medium">
                        {new Date(req.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td>
                      {req.status === 'approved' && <Badge bg="success-subtle" className="text-success rounded-pill px-3 py-1.5 text-uppercase">Approved</Badge>}
                      {req.status === 'pending' && <Badge bg="warning-subtle" className="text-warning rounded-pill px-3 py-1.5 text-uppercase">Pending</Badge>}
                      {req.status === 'rejected' && <Badge bg="danger-subtle" className="text-danger rounded-pill px-3 py-1.5 text-uppercase">Rejected</Badge>}
                    </td>
                    <td className="pe-4 text-secondary small">
                      {req.reason || <span className="text-muted italic">Không có ghi chú</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
