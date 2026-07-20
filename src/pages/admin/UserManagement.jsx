import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Container, Dropdown, Form, Modal, Pagination, Spinner, Table } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { createUser, deleteUser, getUsers, updateUser, updateUserStatus } from '../../services/adminService';

const PAGE_SIZE = 10;
const emptyForm = { fullName: '', email: '', role: 'student', status: 'active', password: '', dateOfBirth: '', avatar: '' };

function validate(form, editing) {
  const errors = {};
  if (form.fullName.trim().length < 2 || form.fullName.trim().length > 100) errors.fullName = 'Họ tên phải có từ 2 đến 100 ký tự.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Email không hợp lệ.';
  if (!['student', 'teacher', 'admin'].includes(form.role) || (!editing && form.role === 'admin')) errors.role = 'Chỉ được tạo Student hoặc Teacher.';
  if (!['active', 'locked', 'banned'].includes(form.status)) errors.status = 'Trạng thái không hợp lệ.';
  if (!editing && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) errors.password = 'Mật khẩu cần ít nhất 8 ký tự, có chữ hoa, chữ thường và số.';
  if (form.dateOfBirth) {
    const date = new Date(`${form.dateOfBirth}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== form.dateOfBirth || date > new Date()) errors.dateOfBirth = 'Ngày sinh không hợp lệ hoặc nằm trong tương lai.';
  }
  return errors;
}

export default function UserManagement() {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ q: '', role: '', status: '' });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState({ show: false, user: null });
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ show: false, user: null, status: '', action: '' });
  const latestRequest = useRef(0);

  const loadUsers = useCallback(async () => {
    const requestNumber = ++latestRequest.current;
    setLoading(true);
    setError('');
    try {
      const result = await getUsers({ ...filters, page, pageSize: PAGE_SIZE });
      if (requestNumber !== latestRequest.current) return;
      const totalPages = Math.max(1, Number(result.totalPages || 1));
      if (page > totalPages) {
        setPage(totalPages);
        return;
      }
      setUsers(Array.isArray(result.data) ? result.data : []);
      setMeta({ total: Number(result.total || 0), totalPages });
    } catch (requestError) {
      if (requestNumber !== latestRequest.current) return;
      setError(requestError.response?.data?.message || requestError.message || 'Không thể tải danh sách người dùng.');
      setUsers([]);
    } finally {
      if (requestNumber === latestRequest.current) setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditor({ show: true, user: null });
  };

  const openEdit = (user) => {
    setForm({ fullName: user.fullName || user.name || '', email: user.email, role: user.role, status: user.status, password: '', dateOfBirth: user.dateOfBirth || '', avatar: user.avatar || '' });
    setFormErrors({});
    setEditor({ show: true, user });
  };

  const saveUser = async (event) => {
    event.preventDefault();
    const errors = validate(form, Boolean(editor.user));
    if (editor.user?.id === admin?.id && form.role !== editor.user.role) errors.role = 'Bạn không thể tự thay đổi role.';
    if (editor.user?.id === admin?.id && form.status !== editor.user.status) errors.status = 'Bạn không thể tự thay đổi trạng thái.';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    setError('');
    try {
      const common = { fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), role: form.role, dateOfBirth: form.dateOfBirth, avatar: form.avatar.trim() };
      if (editor.user) {
        await updateUser(editor.user.id, common);
        if (form.status !== editor.user.status) await updateUserStatus(editor.user.id, form.status);
        toast.success('Cập nhật tài khoản thành công.');
      } else {
        await createUser({ ...common, status: form.status, password: form.password });
        toast.success('Tạo tài khoản thành công.');
      }
      setEditor({ show: false, user: null });
      await loadUsers();
    } catch (requestError) {
      setFormErrors(requestError.errors || {});
      setError(requestError.message || 'Không thể lưu tài khoản.');
    } finally {
      setSaving(false);
    }
  };

  const askAction = (action, target, status = '') => {
    if (target.id === admin?.id) {
      setError('Bạn không thể tự khóa, cấm hoặc xóa tài khoản của mình.');
      return;
    }
    setConfirm({ show: true, user: target, status, action });
  };

  const performAction = async () => {
    const { action, user, status } = confirm;
    setConfirm((old) => ({ ...old, show: false }));
    setLoading(true);
    setError('');
    try {
      if (action === 'delete') await deleteUser(user.id);
      else {
        let lockedUntil = null;
        if (status === 'locked') {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 1);
          lockedUntil = expiry.toISOString();
        }
        await updateUserStatus(user.id, status, lockedUntil);
      }
      toast.success(action === 'delete' ? 'Xóa tài khoản thành công.' : 'Cập nhật trạng thái thành công.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Thao tác thất bại.');
      setLoading(false);
    }
  };

  const updateFilter = (event) => {
    setFilters((old) => ({ ...old, [event.target.name]: event.target.value }));
    setPage(1);
  };

  const message = confirm.action === 'delete'
    ? `Xóa ${confirm.user?.fullName || confirm.user?.email}? API sẽ chặn nếu tài khoản còn dữ liệu liên quan.`
    : `Chuyển ${confirm.user?.fullName || confirm.user?.email} sang trạng thái ${confirm.status}?`;

  return (
    <div style={{ margin: '-16px -24px 0', background: 'var(--tp-page-bg)', minHeight: '100vh' }}>
      <div className="tp-page-header"><div className="tp-page-header-inner d-flex justify-content-between align-items-center"><div><div className="tp-page-badge"><i className="bi bi-people-fill" /> Quản lý</div><h1 className="tp-page-title">Người dùng</h1><p className="tp-page-sub">CRUD tài khoản, role và trạng thái với audit log phía server.</p></div><Button variant="light" className="rounded-pill px-4" onClick={openCreate}><i className="bi bi-person-plus me-2" />Add User</Button></div></div>
      <div className="tp-main-content"><Container fluid="xxl" className="px-4">
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        <Card className="studio-filter-card mb-4"><Form className="row g-3" onSubmit={(event) => event.preventDefault()}>
          <div className="col-md-5"><Form.Control aria-label="Tìm theo tên hoặc email" name="q" placeholder="Search by name or email..." value={filters.q} onChange={updateFilter} className="tp-input" /></div>
          <div className="col-md-3"><Form.Select aria-label="Lọc theo role" name="role" value={filters.role} onChange={updateFilter} className="tp-input"><option value="">All Roles</option><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></Form.Select></div>
          <div className="col-md-3"><Form.Select aria-label="Lọc theo status" name="status" value={filters.status} onChange={updateFilter} className="tp-input"><option value="">All Statuses</option><option value="active">Active</option><option value="locked">Locked</option><option value="banned">Banned</option></Form.Select></div>
          <div className="col-md-1"><Button aria-label="Xóa bộ lọc" variant="outline-secondary" className="w-100" onClick={() => { setFilters({ q: '', role: '', status: '' }); setPage(1); }}><i className="bi bi-x-lg" /></Button></div>
        </Form></Card>
        <Card className="studio-table-card">
          <div className="d-flex justify-content-between px-4 py-3 border-bottom"><strong>Tổng số: {meta.total}</strong><span className="text-muted">Trang {page}/{meta.totalPages}</span></div>
          <div className="table-responsive"><Table hover responsive className="align-middle mb-0"><thead><tr><th className="ps-4">Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created At</th><th className="text-end pe-4">Actions</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" /><div>Đang tải người dùng...</div></td></tr>
              : users.length === 0 ? <tr><td colSpan="6" className="text-center py-5 text-muted">Không có người dùng phù hợp.</td></tr>
                : users.map((item) => <tr key={item.id}><td className="ps-4 fw-medium">{item.fullName || item.name}</td><td>{item.email}</td><td className="text-capitalize">{item.role}</td><td><StatusBadge status={item.status} /></td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td><td className="text-end pe-4"><Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(item)}>Edit</Button><Dropdown className="d-inline" align="end"><Dropdown.Toggle size="sm" variant="light" disabled={item.id === admin?.id}>Status</Dropdown.Toggle><Dropdown.Menu>{item.status !== 'active' && <Dropdown.Item onClick={() => askAction('status', item, 'active')}>Unlock / Set Active</Dropdown.Item>}{item.status !== 'locked' && <Dropdown.Item onClick={() => askAction('status', item, 'locked')}>Lock 24 hours</Dropdown.Item>}{item.status !== 'banned' && <Dropdown.Item className="text-danger" onClick={() => askAction('status', item, 'banned')}>Ban</Dropdown.Item>}<Dropdown.Divider /><Dropdown.Item className="text-danger" onClick={() => askAction('delete', item)}>Delete</Dropdown.Item></Dropdown.Menu></Dropdown></td></tr>)}
          </tbody></Table></div>
          {meta.totalPages > 1 && <Pagination className="justify-content-center p-3 mb-0"><Pagination.Prev aria-label="Trang trước" disabled={page === 1} onClick={() => setPage((old) => old - 1)} />{Array.from({ length: meta.totalPages }, (_, index) => index + 1).map((number) => <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>{number}</Pagination.Item>)}<Pagination.Next aria-label="Trang sau" disabled={page === meta.totalPages} onClick={() => setPage((old) => old + 1)} /></Pagination>}
        </Card>
      </Container></div>

      <Modal show={editor.show} onHide={() => !saving && setEditor({ show: false, user: null })} centered size="lg"><Form onSubmit={saveUser} noValidate><Modal.Header closeButton><Modal.Title>{editor.user ? 'Edit User' : 'Add User'}</Modal.Title></Modal.Header><Modal.Body><div className="row g-3">
        <Field col="col-md-6" id="managedFullName" label="Họ và tên" value={form.fullName} error={formErrors.fullName} onChange={(value) => setForm((old) => ({ ...old, fullName: value }))} />
        <Field col="col-md-6" id="managedEmail" label="Email" type="email" value={form.email} error={formErrors.email} onChange={(value) => setForm((old) => ({ ...old, email: value }))} />
        <div className="col-md-6"><Form.Group controlId="managedRole"><Form.Label>Role</Form.Label><Form.Select disabled={editor.user?.id === admin?.id} value={form.role} isInvalid={Boolean(formErrors.role)} onChange={(event) => setForm((old) => ({ ...old, role: event.target.value }))}><option value="student">Student</option><option value="teacher">Teacher</option>{editor.user && <option value="admin">Admin</option>}</Form.Select><Form.Control.Feedback type="invalid">{formErrors.role}</Form.Control.Feedback></Form.Group></div>
        <div className="col-md-6"><Form.Group controlId="managedStatus"><Form.Label>Status</Form.Label><Form.Select disabled={editor.user?.id === admin?.id} value={form.status} isInvalid={Boolean(formErrors.status)} onChange={(event) => setForm((old) => ({ ...old, status: event.target.value }))}><option value="active">Active</option><option value="locked">Locked</option><option value="banned">Banned</option></Form.Select><Form.Control.Feedback type="invalid">{formErrors.status}</Form.Control.Feedback></Form.Group></div>
        {!editor.user && <Field col="col-12" id="managedPassword" label="Mật khẩu ban đầu" type="password" value={form.password} error={formErrors.password} onChange={(value) => setForm((old) => ({ ...old, password: value }))} />}
        <Field col="col-md-6" id="managedDob" label="Ngày sinh" type="date" value={form.dateOfBirth} error={formErrors.dateOfBirth} onChange={(value) => setForm((old) => ({ ...old, dateOfBirth: value }))} />
        <Field col="col-md-6" id="managedAvatar" label="Avatar URL" value={form.avatar} onChange={(value) => setForm((old) => ({ ...old, avatar: value }))} />
      </div></Modal.Body><Modal.Footer><Button variant="secondary" onClick={() => setEditor({ show: false, user: null })} disabled={saving}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button></Modal.Footer></Form></Modal>
      <ConfirmModal isOpen={confirm.show} title={confirm.action === 'delete' ? 'Xóa tài khoản' : 'Đổi trạng thái'} message={message} variant="danger" onConfirm={performAction} onClose={() => setConfirm((old) => ({ ...old, show: false }))} />
    </div>
  );
}

function Field({ col, id, label, type = 'text', value, error, onChange }) {
  return <div className={col}><Form.Group controlId={id}><Form.Label>{label}</Form.Label><Form.Control type={type} autoComplete={type === 'password' ? 'new-password' : undefined} value={value} isInvalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} /><Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback></Form.Group></div>;
}
