import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Card, Row, Col, Spinner, Alert, Table, Button, Badge, Form, Pagination } from 'react-bootstrap';
import { getUsers, getApprovalRequests, getAuditLogs } from '../../services/adminService';
import axios from 'axios';
import ApprovalDetailModal from '../../components/feature/admin/ApprovalDetailModal';

const API_URL = 'http://localhost:9999';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingContent: 0,
    totalLogs: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Queue state
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState(null);
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Audit Logs state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(null);
  
  // Filters
  const [filterAction, setFilterAction] = useState('all');
  const [filterTargetType, setFilterTargetType] = useState('all');
  const [filterActorId, setFilterActorId] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // EARS[Event]: WHEN Admin views dashboard (Overview tab), THE system SHALL fetch and display aggregated stats.
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);

      const [usersRes, approvalsRes, logsRes, coursesRes] = await Promise.all([
        getUsers({ _page: 1, _per_page: 1 }), 
        axios.get(`${API_URL}/approvalRequests?status=pending&_page=1&_per_page=1`).catch(() => ({ data: { items: 0 } })),
        axios.get(`${API_URL}/auditLogs?_page=1&_per_page=1`).catch(() => ({ data: { items: 0 } })),
        axios.get(`${API_URL}/courses?_page=1&_per_page=1`).catch(() => ({ data: { items: 0 } }))
      ]);

      const parseCount = (res) => {
        // json-server v1 returns pagination object with .items
        if (res?.data?.items !== undefined) return parseInt(res.data.items, 10);
        // fallback for older json-server using headers
        if (res?.headers?.['x-total-count']) return parseInt(res.headers['x-total-count'], 10);
        // fallback if it returned an array
        return Array.isArray(res?.data?.data) ? res.data.data.length : (Array.isArray(res?.data) ? res.data.length : (Array.isArray(res) ? res.length : 0));
      };

      setStats({
        totalUsers: parseCount(usersRes),
        pendingContent: parseCount(approvalsRes),
        totalLogs: parseCount(logsRes),
        totalCourses: parseCount(coursesRes),
      });
    } catch (error) {
      setStatsError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch pending queue
  const fetchQueue = useCallback(async () => {
    try {
      setLoadingQueue(true);
      setQueueError(null);
      // EARS[State-driven]: WHILE content status is pending, THE system SHALL display it in the approvals queue
      const response = await getApprovalRequests({ status: 'pending' });
      const data = response?.data || response;
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setQueueError('Failed to load pending requests. Please try again later.');
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  // EARS[Event]: WHEN Admin views Audit Logs tab, THE system SHALL fetch all audit logs from JSON-Server.
  // EARS[Unwanted]: WHERE fetching audit logs fails, THE system SHALL show an error message and allow retry.
  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      setLogsError(null);
      const response = await getAuditLogs();
      const data = response?.data || response;
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      setLogsError('Failed to load audit logs. Please try again later.');
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'approvals') {
      fetchQueue();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, fetchStats, fetchQueue, fetchLogs]);

  const handleFilterActionChange = (val) => {
    setFilterAction(val);
    setCurrentPage(1);
  };

  const handleFilterTargetChange = (val) => {
    setFilterTargetType(val);
    setCurrentPage(1);
  };

  const handleFilterActorChange = (val) => {
    setFilterActorId(val);
    setCurrentPage(1);
  };

  // EARS[Event]: WHEN Admin filters audit logs, THE system SHALL display only those matching action, targetType, and actorId.
  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesTarget = filterTargetType === 'all' || log.targetType === filterTargetType;
    const matchesActor = !filterActorId || log.actorId?.toLowerCase().includes(filterActorId.toLowerCase().trim());
    return matchesAction && matchesTarget && matchesActor;
  });

  // Sort logs by createdAt descending (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // EARS[Event]: WHEN Admin paginates audit logs, THE system SHALL slice the log entries and display 10 items per page.
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLogs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CHANGE_USER_ROLE':
        return <Badge bg="info" className="text-dark rounded-pill px-3">Role Change</Badge>;
      case 'CHANGE_USER_STATUS':
        return <Badge bg="warning" className="text-dark rounded-pill px-3">Status Change</Badge>;
      case 'DELETE_USER':
        return <Badge bg="danger" className="rounded-pill px-3">User Deleted</Badge>;
      case 'APPROVE_CONTENT':
        return <Badge bg="success" className="rounded-pill px-3">Approve</Badge>;
      case 'REJECT_CONTENT':
        return <Badge bg="secondary" className="rounded-pill px-3">Reject</Badge>;
      default:
        return <Badge bg="dark" className="rounded-pill px-3">{action}</Badge>;
    }
  };

  const getTargetBadge = (targetType) => {
    const style = targetType === 'course' ? { backgroundColor: '#0052ff', color: '#ffffff' } : {};
    const bgVal = targetType === 'course' ? undefined : (targetType === 'user' ? 'secondary' : (targetType === 'lesson' ? 'info' : 'warning'));
    return (
      <Badge 
        bg={bgVal} 
        style={style} 
        className={`rounded-pill px-3 text-capitalize ${targetType === 'user' || targetType === 'lesson' ? 'text-dark' : ''}`}
      >
        {targetType}
      </Badge>
    );
  };

  const renderLogDetails = (log) => {
    const { action, oldValue, newValue, targetId } = log;
    switch (action) {
      case 'CHANGE_USER_ROLE':
        return `Changed role of user ${targetId} from "${oldValue?.role || 'N/A'}" to "${newValue?.role || 'N/A'}"`;
      case 'CHANGE_USER_STATUS':
        return `Changed status of user ${targetId} from "${oldValue?.status || 'N/A'}" to "${newValue?.status || 'N/A'}"`;
      case 'DELETE_USER':
        return `Deleted user ${targetId}`;
      case 'APPROVE_CONTENT':
        return `Approved content with ID ${targetId}`;
      case 'REJECT_CONTENT':
        return `Rejected content with ID ${targetId}`;
      default:
        return `Performed ${action} on ${targetId}`;
    }
  };

  // EARS[Event]: WHEN Admin clicks Review, THE system SHALL open the approval detail modal
  const handleReviewClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleActionSuccess = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    fetchQueue(); // refresh list
    fetchStats(); // update stats implicitly in background
  };

  return (
    <div className="admin-dashboard-container container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Admin Dashboard</h2>
      </div>

      <Tabs
        id="admin-dashboard-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="overview" title="System Overview">
          {statsError && <Alert variant="danger">{statsError}</Alert>}
          
          {loadingStats ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Row className="g-4">
              <Col md={3} sm={6}>
                <Card className="border-0 shadow-sm h-100 text-center py-4" style={{ borderRadius: '24px' }}>
                  <Card.Body>
                    <h1 className="display-4 fw-bold text-primary mb-2">{stats.totalUsers}</h1>
                    <Card.Text className="text-muted text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                      Total Users
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="border-0 shadow-sm h-100 text-center py-4" style={{ borderRadius: '24px' }}>
                  <Card.Body>
                    <h1 className="display-4 fw-bold text-success mb-2">{stats.totalCourses}</h1>
                    <Card.Text className="text-muted text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                      Courses
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3} sm={6}>
                <Card className="border-0 shadow-sm h-100 text-center py-4" style={{ borderRadius: '24px' }}>
                  <Card.Body>
                    <h1 className="display-4 fw-bold text-warning mb-2">{stats.pendingContent}</h1>
                    <Card.Text className="text-muted text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                      Pending Content
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3} sm={6}>
                <Card className="border-0 shadow-sm h-100 text-center py-4" style={{ borderRadius: '24px' }}>
                  <Card.Body>
                    <h1 className="display-4 fw-bold text-info mb-2">{stats.totalLogs}</h1>
                    <Card.Text className="text-muted text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                      Audit Logs
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>
        
        <Tab eventKey="approvals" title="Approvals Queue">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '24px' }}>
            <Card.Body className="p-0 table-responsive">
              {queueError && <Alert variant="danger" className="m-3">{queueError}</Alert>}
              
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Type</th>
                    <th>Target ID</th>
                    <th>Teacher ID</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingQueue ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                      </td>
                    </tr>
                  ) : pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No pending content to review.
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map(req => (
                      <tr key={req.id}>
                        <td className="ps-4 text-capitalize fw-medium">{req.targetType}</td>
                        <td className="text-muted">{req.targetId}</td>
                        <td className="text-muted">{req.teacherId}</td>
                        <td className="text-muted">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <Badge bg="warning" text="dark" pill>Pending</Badge>
                        </td>
                        <td className="text-end pe-4">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-pill px-3"
                            onClick={() => handleReviewClick(req)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="logs" title="Audit Logs">
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '24px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Filter Logs</h5>
              {/* Filters Section */}
              <Row className="g-3 mb-4">
                <Col md={4} sm={6}>
                  <Form.Group controlId="filterActionSelect">
                    <Form.Label className="small fw-semibold text-muted text-uppercase">Action Type</Form.Label>
                    <Form.Select 
                      value={filterAction} 
                      onChange={(e) => handleFilterActionChange(e.target.value)}
                      className="rounded-pill border-1"
                      style={{ height: '44px' }}
                    >
                      <option value="all">All Actions</option>
                      <option value="CHANGE_USER_ROLE">Role Change</option>
                      <option value="CHANGE_USER_STATUS">Status Change</option>
                      <option value="DELETE_USER">User Deleted</option>
                      <option value="APPROVE_CONTENT">Approve Content</option>
                      <option value="REJECT_CONTENT">Reject Content</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4} sm={6}>
                  <Form.Group controlId="filterTargetTypeSelect">
                    <Form.Label className="small fw-semibold text-muted text-uppercase">Target Type</Form.Label>
                    <Form.Select 
                      value={filterTargetType} 
                      onChange={(e) => handleFilterTargetChange(e.target.value)}
                      className="rounded-pill border-1"
                      style={{ height: '44px' }}
                    >
                      <option value="all">All Targets</option>
                      <option value="user">User</option>
                      <option value="course">Course</option>
                      <option value="lesson">Lesson</option>
                      <option value="test">Test</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4} sm={12}>
                  <Form.Group controlId="filterActorIdSearch">
                    <Form.Label className="small fw-semibold text-muted text-uppercase">Actor ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Search by Actor ID..." 
                      value={filterActorId}
                      onChange={(e) => handleFilterActorChange(e.target.value)}
                      className="rounded-pill px-3 border-1"
                      style={{ height: '44px', backgroundColor: '#f7f7f7' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Table Section */}
              {logsError && <Alert variant="danger">{logsError}</Alert>}

              {loadingLogs ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading logs...</span>
                  </Spinner>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No audit logs found matching the filters.
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Timestamp</th>
                          <th>Actor ID</th>
                          <th>Action</th>
                          <th>Target</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((log) => (
                          <tr key={log.id}>
                            <td className="ps-4 text-muted small">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                            </td>
                            <td className="fw-semibold text-muted small">{log.actorId}</td>
                            <td>{getActionBadge(log.action)}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {getTargetBadge(log.targetType)}
                                <span className="text-muted small">({log.targetId})</span>
                              </div>
                            </td>
                            <td className="text-muted small">{renderLogDetails(log)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination className="mb-0">
                        <Pagination.Prev 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        {[...Array(totalPages)].map((_, index) => (
                          <Pagination.Item
                            key={index + 1}
                            active={index + 1 === currentPage}
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <ApprovalDetailModal 
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActionSuccess={handleActionSuccess}
      />
    </div>
  );
};

export default AdminDashboard;
