/**
 * TransactionList.jsx — Admin: Xem giao dịch mock payment (read-only)
 * Route: /admin/transactions
 *
 * Traceability Matrix:
 * - ADM-CONTENT: Admin xem giao dịch mock payment (read-only)
 * - PLAN §2.2: Component dùng Bootstrap 5, PascalCase
 * - SPEC §6: Transactions collection với status: completed/pending/failed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button, Badge, Spinner, Alert, Row, Col, Card, Container } from 'react-bootstrap';
import { getTransactions } from '../../services/adminService';

const TransactionList = ({ isEmbedded = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', method: '' });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.method) params.method = filters.method;
      const data = await getTransactions(params);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể tải danh sách giao dịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const getMethodLabel = (method) => {
    const methods = {
      'bank-transfer': '🏦 Bank Transfer',
      'momo': '📱 MoMo',
      'vnpay': '💳 VNPay',
    };
    return methods[method] || method;
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(amount);
  };

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const content = (
    <>
      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="tp-stat-card bg-white p-4 rounded-4 shadow-sm border border-light d-flex align-items-center gap-3 h-100">
            <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
              💰
            </div>
            <div>
              <div className="text-muted small fw-medium">Tổng doanh thu</div>
              <div className="fw-bold fs-5 text-success">{formatCurrency(totalRevenue, 'VND')}</div>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="tp-stat-card bg-white p-4 rounded-4 shadow-sm border border-light d-flex align-items-center gap-3 h-100">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
              ✅
            </div>
            <div>
              <div className="text-muted small fw-medium">Giao dịch thành công</div>
              <div className="fw-bold fs-5 text-primary">
                {transactions.filter(t => t.status === 'completed').length}
              </div>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="tp-stat-card bg-white p-4 rounded-4 shadow-sm border border-light d-flex align-items-center gap-3 h-100">
            <div className="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
              ❌
            </div>
            <div>
              <div className="text-muted small fw-medium">Giao dịch thất bại / pending</div>
              <div className="fw-bold fs-5 text-danger">
                {transactions.filter(t => t.status !== 'completed').length}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Filter Bar */}
      <Card className="studio-filter-card mb-4">
          <Form className="row g-3 align-items-end">
            <div className="col-md-4">
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange} className="tp-input" id="txn-status-filter">
                <option value="">Tất cả trạng thái</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Select name="method" value={filters.method} onChange={handleFilterChange} className="tp-input" id="txn-method-filter">
                <option value="">Tất cả phương thức</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="momo">MoMo</option>
                <option value="vnpay">VNPay</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => setFilters({ status: '', method: '' })}>
                Xóa bộ lọc
              </Button>
            </div>
          </Form>
      </Card>

      {/* Table */}
      <Card className="studio-table-card">
          {loading ? (
            <div className="d-flex justify-content-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-5 text-muted">
              Không có giao dịch nào phù hợp.
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="tp-table align-middle">
                <thead>
                  <tr>
                    <th className="ps-4">Mã GD</th>
                    <th>User ID</th>
                    <th>Khóa học</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Trạng thái</th>
                    <th className="text-end pe-4">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(txn => (
                    <tr key={txn.id}>
                      <td className="ps-4 fw-medium">
                        <code>{txn.id}</code>
                      </td>
                      <td className="text-muted">{txn.userId || 'N/A'}</td>
                      <td>{txn.courseId || 'N/A'}</td>
                      <td className="fw-semibold text-dark">
                        {formatCurrency(txn.amount, txn.currency)}
                      </td>
                      <td>
                        {getMethodLabel(txn.method)}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(txn.status)} className="rounded-pill text-capitalize px-3">
                          {txn.status}
                        </Badge>
                      </td>
                      <td className="text-end pe-4 text-muted">
                        {txn.createdAt ? new Date(txn.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
      </Card>
    </>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div style={{ margin: '-16px -24px 0', background: 'var(--tp-page-bg)', minHeight: '100vh' }}>
      <div className="tp-page-header">
        <div className="tp-page-header-inner">
          <div>
            <div className="tp-page-badge"><i className="bi bi-receipt"></i> Giao dịch</div>
            <h1 className="tp-page-title">Transactions</h1>
            <p className="tp-page-sub">Xem toàn bộ giao dịch thanh toán trong hệ thống (chỉ xem)</p>
          </div>
        </div>
      </div>
      <div className="tp-main-content">
        <Container fluid="xxl" className="px-4">
          <div className="d-flex justify-content-end mb-3">
            <Badge bg="secondary" className="fs-6 px-3 py-2 rounded-pill shadow-sm">{transactions.length} Giao dịch</Badge>
          </div>
          {content}
        </Container>
      </div>
    </div>
  );
};

export default TransactionList;
