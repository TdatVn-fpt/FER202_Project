import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button, Dropdown, Spinner, Alert } from 'react-bootstrap';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { getUsers, updateUserRole, updateUserStatus, deleteUser } from '../../services/adminService';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: '', status: '', q: '' });
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0); 
  
  // For Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    actionData: null,
    actionType: '', // 'role', 'status', 'delete'
  });

  const authUserStr = localStorage.getItem('ielts_auth_user');
  const currentAdmin = authUserStr ? JSON.parse(authUserStr) : {};

  // Fetch users logic
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // EARS[Event]: WHEN Admin fetches the user list, THE system SHALL support filtering
      const response = await getUsers({ ...filters, _page: page, _limit: 10 });
      const data = response?.data || response;
      setUsers(Array.isArray(data) ? data : []);
      setTotalUsers(response?.headers?.['x-total-count'] || data?.length || 0);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // reset to first page
  };

  const openConfirmModal = (actionType, user, newValue) => {
    // EARS[Unwanted]: WHERE Admin attempts to change their own role or status, THE system SHALL block the action
    if (user.id === currentAdmin.id) {
      setError("You cannot modify your own account.");
      return;
    }

    let title = '';
    let message = '';
    let variant = 'danger';

    if (actionType === 'role') {
      title = 'Change User Role';
      message = `Are you sure you want to change role of ${user.name || user.fullName} to ${newValue}?`;
      variant = 'warning';
    } else if (actionType === 'status') {
      title = 'Change User Status';
      message = `Are you sure you want to change status of ${user.name || user.fullName} to ${newValue}?`;
      variant = newValue === 'banned' ? 'danger' : 'warning';
    } else if (actionType === 'delete') {
      title = 'Delete User';
      message = `Are you sure you want to permanently delete ${user.name || user.fullName}? This action cannot be undone.`;
      variant = 'danger';
    }

    setConfirmModal({
      isOpen: true,
      title,
      message,
      variant,
      actionData: { userId: user.id, newValue },
      actionType,
    });
  };

  const handleConfirmAction = async () => {
    const { actionType, actionData } = confirmModal;
    const { userId, newValue } = actionData;
    
    try {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setLoading(true);

      if (actionType === 'role') {
        // EARS[Event]: WHEN Admin changes a user's role, THE system SHALL update users.role
        await updateUserRole(userId, newValue);
      } else if (actionType === 'status') {
        // EARS[Event]: WHEN Admin changes a user's status, THE system SHALL update users.status
        let lockedUntil = null;
        if (newValue === 'locked') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1); // Mock 1 day lock
          lockedUntil = tomorrow.toISOString();
        }
        await updateUserStatus(userId, newValue, lockedUntil);
      } else if (actionType === 'delete') {
        // EARS[Event]: WHEN Admin deletes a user, THE system SHALL remove them
        await deleteUser(userId);
      }
      
      // Refresh list
      fetchUsers();
    } catch (err) {
      setError(`Action failed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="user-management-container container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">User Management</h2>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <div className="filter-card card mb-4 border-0 shadow-sm rounded-xl">
        <div className="card-body">
          <Form className="row g-3">
            <div className="col-md-4">
              <Form.Control 
                type="text" 
                placeholder="Search by name or email..." 
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                className="rounded-pill"
              />
            </div>
            <div className="col-md-3">
              <Form.Select name="role" value={filters.role} onChange={handleFilterChange} className="rounded-pill">
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-pill">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="locked">Locked</option>
                <option value="banned">Banned</option>
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Button variant="primary" className="w-100 rounded-pill" onClick={fetchUsers}>
                Filter
              </Button>
            </div>
          </Form>
        </div>
      </div>

      <div className="table-card card border-0 shadow-sm rounded-xl">
        <div className="card-body p-0 table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const isSelf = user.id === currentAdmin.id;
                  return (
                    <tr key={user.id}>
                      <td className="ps-4 fw-medium">{user.name || user.fullName}</td>
                      <td className="text-muted">{user.email}</td>
                      <td className="text-capitalize">{user.role}</td>
                      <td><StatusBadge status={user.status} /></td>
                      <td className="text-muted">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="text-end pe-4">
                        <Dropdown align="end">
                          <Dropdown.Toggle 
                            variant="light" 
                            size="sm" 
                            className="rounded-pill border-0 action-toggle"
                            disabled={isSelf}
                            title={isSelf ? "Cannot modify your own account" : "Actions"}
                          >
                            Manage
                          </Dropdown.Toggle>
                          
                          <Dropdown.Menu className="shadow-sm border-0">
                            <Dropdown.Header>Change Role</Dropdown.Header>
                            {user.role !== 'admin' && <Dropdown.Item onClick={() => openConfirmModal('role', user, 'admin')}>Make Admin</Dropdown.Item>}
                            {user.role !== 'teacher' && <Dropdown.Item onClick={() => openConfirmModal('role', user, 'teacher')}>Make Teacher</Dropdown.Item>}
                            {user.role !== 'student' && <Dropdown.Item onClick={() => openConfirmModal('role', user, 'student')}>Make Student</Dropdown.Item>}
                            
                            <Dropdown.Divider />
                            <Dropdown.Header>Change Status</Dropdown.Header>
                            {user.status !== 'active' && <Dropdown.Item className="text-success" onClick={() => openConfirmModal('status', user, 'active')}>Set Active</Dropdown.Item>}
                            {user.status !== 'locked' && <Dropdown.Item className="text-warning" onClick={() => openConfirmModal('status', user, 'locked')}>Lock Account</Dropdown.Item>}
                            {user.status !== 'banned' && <Dropdown.Item className="text-danger" onClick={() => openConfirmModal('status', user, 'banned')}>Ban Account</Dropdown.Item>}
                            
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger fw-bold" onClick={() => openConfirmModal('delete', user, null)}>
                              Delete User
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })
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

export default UserManagement;
