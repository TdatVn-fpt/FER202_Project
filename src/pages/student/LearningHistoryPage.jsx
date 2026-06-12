import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HistoryFilter from '../../components/feature-student-dashboard-history/HistoryFilter';
import HistoryTable from '../../components/feature-student-dashboard-history/HistoryTable';
import { useHistoryFilter } from '../../hooks/useHistoryFilter';
import { getCurrentUser } from '../../services/authService';

// URL giả lập JSON-Server
const API_URL = 'http://localhost:9999';

const LearningHistoryPage = () => {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || '';
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hook xử lý mảng lọc
  const { handleFilterChange, filteredAttempts } = useHistoryFilter(attempts);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);

        // Re-fetch user từ server theo email để lấy id mới nhất, tránh localStorage stale
        let resolvedUserId = userId;
        if (currentUser?.email) {
          try {
            const userRes = await axios.get(`${API_URL}/users?email=${encodeURIComponent(currentUser.email)}`);
            if (userRes.data?.length > 0) {
              resolvedUserId = userRes.data[0].id;
            }
          } catch (_) { /* dùng userId cũ nếu fetch lỗi */ }
        }

        const res = await axios.get(`${API_URL}/testAttempts?userId=${resolvedUserId}`);
        const sorted = (res.data || []).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setAttempts(sorted);
      } catch (err) {
        setError('Failed to fetch learning history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, [userId]);

  // EARS[State-driven]: WHILE the data is loading, THE system SHALL display a spinner.
  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" data-testid="history-loading">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm border-0" role="alert" data-testid="history-error">
          <h4 className="alert-heading fw-bold mb-3">⚠️ Xảy ra lỗi kết nối</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger px-4" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // EARS[Event]: WHEN the data is ready, THE system SHALL display the filter form and table.
  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bolder text-dark" style={{ letterSpacing: '-0.5px' }}>
        Learning History
      </h2>
      
      {/* Component T009 */}
      <HistoryFilter onFilterChange={handleFilterChange} />
      
      {/* Component T010 */}
      <HistoryTable attempts={filteredAttempts} />
      
    </div>
  );
};

export default LearningHistoryPage;
