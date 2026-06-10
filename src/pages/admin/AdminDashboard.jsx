import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Card, Row, Col, Spinner, Alert, Table, Button, Badge } from 'react-bootstrap';
import { getUsers, getApprovalRequests, getAuditLogs } from '../../services/adminService';
import api from '../../services/api'; 
import ApprovalDetailModal from '../../components/feature/admin/ApprovalDetailModal';

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

  // EARS[Event]: WHEN Admin views dashboard (Overview tab), THE system SHALL fetch and display aggregated stats.
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);

      const [usersRes, approvalsRes, logsRes, coursesRes] = await Promise.all([
        getUsers({ _limit: 1 }), 
        getApprovalRequests('pending'), 
        getAuditLogs({ _limit: 1 }),
        api.get('/courses?_limit=1').catch(() => ({ data: [], headers: {} }))
      ]);

      const parseCount = (res) => {
        if (res?.headers?.['x-total-count']) {
          return parseInt(res.headers['x-total-count'], 10);
        }
        return Array.isArray(res?.data) ? res.data.length : (Array.isArray(res) ? res.length : 0);
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
      const response = await getApprovalRequests('pending');
      const data = response?.data || response;
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setQueueError('Failed to load pending requests. Please try again later.');
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'approvals') {
      fetchQueue();
    }
  }, [activeTab, fetchStats, fetchQueue]);

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
          {/* T014 Placeholder */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '24px' }}>
            <Card.Body className="py-5 text-center text-muted">
              <h4>System Audit Logs</h4>
              <p>Will be implemented in Task T014.</p>
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
