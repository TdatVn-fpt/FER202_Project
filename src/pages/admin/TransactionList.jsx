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
import { Table, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { getTransactions, updateTransaction } from '../../services/adminService';

// EARS[Ubiquitous]: THE system SHALL display transaction list (read-only) at /admin/transactions
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', method: '' });

  // EARS[Event]: WHEN Admin loads TransactionList, THE system SHALL fetch all transactions
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

  const handleApprove = async (transactionId) => {
    if (window.confirm('Bạn có chắc muốn duyệt giao dịch này?')) {
      try {
        setLoading(true);
        await updateTransaction(transactionId, { status: 'completed' });
        fetchTransactions();
      } catch (err) {
        setError('Lỗi khi duyệt giao dịch: ' + err.message);
        setLoading(false);
      }
    }
  };

  const handleReject = async (transactionId) => {
    if (window.confirm('Bạn có chắc muốn từ chối giao dịch này?')) {
      try {
        setLoading(true);
        await updateTransaction(transactionId, { status: 'failed' });
        fetchTransactions();
      } catch (err) {
        setError('Lỗi khi từ chối giao dịch: ' + err.message);
        setLoading(false);
      }
    }
  };

  // EARS[Ubiquitous]: THE system SHALL compute total revenue from completed transactions
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Transactions</h2>
          <p className="text-muted mb-0">Xem toàn bộ giao dịch thanh toán trong hệ thống (chỉ xem)</p>
        </div>
        <Badge bg="secondary" className="fs-6 px-3 py-2">{transactions.length} Giao dịch</Badge>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-success bg-opacity-10 p-3">
                <span className="fs-3">💰</span>
              </div>
              <div>
                <div className="text-muted small">Tổng doanh thu</div>
                <div className="fw-bold fs-5 text-success">{formatCurrency(totalRevenue, 'VND')}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-primary bg-opacity-10 p-3">
                <span className="fs-3">✅</span>
              </div>
              <div>
                <div className="text-muted small">Giao dịch thành công</div>
                <div className="fw-bold fs-5 text-primary">
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-3 bg-danger bg-opacity-10 p-3">
                <span className="fs-3">❌</span>
              </div>
              <div>
                <div className="text-muted small">Giao dịch thất bại / pending</div>
                <div className="fw-bold fs-5 text-danger">
                  {transactions.filter(t => t.status !== 'completed').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <Form className="row g-3 align-items-end">
            <div className="col-md-4">
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-pill" id="txn-status-filter">
                <option value="">Tất cả trạng thái</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Select name="method" value={filters.method} onChange={handleFilterChange} className="rounded-pill" id="txn-method-filter">
                <option value="">Tất cả phương thức</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="momo">MoMo</option>
                <option value="vnpay">VNPay</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Button variant="primary" className="w-100 rounded-pill" onClick={fetchTransactions} id="txn-filter-btn">
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
                <th className="ps-4">Mã GD</th>
                <th>Người dùng</th>
                <th>Khóa học</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
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
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-credit-card-2-front fs-1 d-block mb-2 opacity-50"></i>
                    Không có giao dịch nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.id}>
                    <td className="ps-4">
                      <code className="text-primary small">{txn.id}</code>
                    </td>
                    <td>
                      <div className="fw-medium">{txn.userName}</div>
                      <small className="text-muted">{txn.userId}</small>
                    </td>
                    <td>
                      <div>{txn.courseTitle}</div>
                      <small className="text-muted">{txn.courseId}</small>
                    </td>
                    <td className="fw-bold text-success">
                      {formatCurrency(txn.amount, txn.currency)}
                    </td>
                    <td className="text-muted">{getMethodLabel(txn.method)}</td>
                    <td>
                      <Badge bg={getStatusVariant(txn.status)} className="rounded-pill text-capitalize">
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="text-muted">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="text-end pe-4">
                      {txn.status === 'pending' && (
                        <div className="d-flex gap-2 justify-content-end">
                          <Button variant="success" size="sm" onClick={() => handleApprove(txn.id)} className="rounded-pill px-3">Duyệt</Button>
                          <Button variant="danger" size="sm" onClick={() => handleReject(txn.id)} className="rounded-pill px-3">Từ chối</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
