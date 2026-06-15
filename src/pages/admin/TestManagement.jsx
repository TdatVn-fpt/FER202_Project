/**
 * TestManagement.jsx — Admin: Quản lý toàn bộ Tests/Questions
 * Route: /admin/tests
 *
 * Traceability Matrix:
 * - ADM-CONTENT: Admin quản lý toàn bộ tests
 * - PLAN §2.2: Component dùng Bootstrap 5, PascalCase
 * - SPEC §6: Tests collection với skill, status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button, Badge, Spinner, Alert, Dropdown } from 'react-bootstrap';
import ConfirmModal from '../../components/common/ConfirmModal';
import { getTests, updateTest, deleteTest } from '../../services/adminService';

// EARS[Ubiquitous]: THE system SHALL display test management page at /admin/tests
const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ skill: '', status: '', q: '' });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    actionData: null,
    actionType: '',
  });

  // EARS[Event]: WHEN Admin loads TestManagement, THE system SHALL fetch all tests
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.skill) params.skill = filters.skill;
      if (filters.status) params.status = filters.status;
      if (filters.q) params.q = filters.q;
      const data = await getTests(params);
      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể tải danh sách bài kiểm tra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openConfirmModal = (actionType, test, newValue = null) => {
    let title = '';
    let message = '';
    let variant = 'danger';

    if (actionType === 'status') {
      title = 'Thay đổi trạng thái bài kiểm tra';
      message = `Bạn có chắc muốn chuyển "${test.title}" sang trạng thái "${newValue}"?`;
      variant = 'warning';
    } else if (actionType === 'delete') {
      title = 'Xóa bài kiểm tra';
      message = `Bạn có chắc muốn xóa vĩnh viễn bài kiểm tra "${test.title}"? Hành động này không thể hoàn tác.`;
      variant = 'danger';
    }

    setConfirmModal({ isOpen: true, title, message, variant, actionData: { testId: test.id, newValue }, actionType });
  };

  const handleConfirmAction = async () => {
    const { actionType, actionData } = confirmModal;
    const { testId, newValue } = actionData;

    try {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setLoading(true);

      if (actionType === 'status') {
        // EARS[Event]: WHEN Admin changes test status, THE system SHALL patch tests.status
        await updateTest(testId, { status: newValue });
      } else if (actionType === 'delete') {
        // EARS[Event]: WHEN Admin deletes a test, THE system SHALL remove it permanently
        await deleteTest(testId);
      }

      fetchTests();
    } catch (err) {
      setError(`Hành động thất bại: ${err.message}`);
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'Reading': return 'primary';
      case 'Listening': return 'info';
      case 'Writing': return 'warning';
      case 'Speaking': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Test Management</h2>
          <p className="text-muted mb-0">Quản lý toàn bộ bài kiểm tra và câu hỏi trong hệ thống</p>
        </div>
        <Badge bg="warning" text="dark" className="fs-6 px-3 py-2">{tests.length} Bài kiểm tra</Badge>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <Form className="row g-3 align-items-end">
            <div className="col-md-4">
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên bài kiểm tra..."
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                className="rounded-pill"
                id="test-search-input"
              />
            </div>
            <div className="col-md-3">
              <Form.Select name="skill" value={filters.skill} onChange={handleFilterChange} className="rounded-pill" id="test-skill-filter">
                <option value="">Tất cả kỹ năng</option>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="Writing">Writing</option>
                <option value="Speaking">Speaking</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-pill" id="test-status-filter">
                <option value="">Tất cả trạng thái</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Button variant="primary" className="w-100 rounded-pill" onClick={fetchTests} id="test-filter-btn">
                Lọc
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0 table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Tên bài kiểm tra</th>
                <th>Kỹ năng</th>
                <th>Thời gian</th>
                <th>Số câu hỏi</th>
                <th>Thang điểm</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-file-earmark-x fs-1 d-block mb-2 opacity-50"></i>
                    Không có bài kiểm tra nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                tests.map(test => (
                  <tr key={test.id}>
                    <td className="ps-4">
                      <div className="fw-medium">{test.title}</div>
                      <small className="text-muted">{test.id}</small>
                    </td>
                    <td>
                      <Badge bg={getSkillColor(test.skill)} className="rounded-pill">{test.skill}</Badge>
                    </td>
                    <td className="text-muted">{test.durationMinutes} phút</td>
                    <td className="text-center">{test.totalQuestions}</td>
                    <td className="text-muted">{test.bandScale}</td>
                    <td>
                      <Badge bg={getStatusVariant(test.status)} className="rounded-pill text-capitalize">
                        {test.status}
                      </Badge>
                    </td>
                    <td className="text-muted">
                      {test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="text-end pe-4">
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="light" size="sm" className="rounded-pill border-0" id={`test-action-${test.id}`}>
                          Quản lý
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-sm border-0">
                          <Dropdown.Header>Thay đổi trạng thái</Dropdown.Header>
                          {/* EARS[Event]: WHEN Admin publishes test, THE system SHALL update tests.status */}
                          {test.status !== 'published' && (
                            <Dropdown.Item className="text-success" onClick={() => openConfirmModal('status', test, 'published')}>
                              ✓ Publish
                            </Dropdown.Item>
                          )}
                          {test.status !== 'draft' && (
                            <Dropdown.Item className="text-secondary" onClick={() => openConfirmModal('status', test, 'draft')}>
                              📝 Set Draft
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item className="text-danger fw-bold" onClick={() => openConfirmModal('delete', test)}>
                            🗑 Xóa bài kiểm tra
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default TestManagement;
