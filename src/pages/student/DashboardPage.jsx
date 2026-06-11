import React from 'react';
import { getCurrentUser } from '../../services/authService';
import { useDashboardData } from '../../hooks/useDashboardData';
import StatCard from '../../components/feature-student-dashboard-history/StatCard';
import TestScoreChart from '../../components/feature-student-dashboard-history/TestScoreChart';
import SkillRadarChart from '../../components/feature-student-dashboard-history/SkillRadarChart';

const DashboardPage = () => {
  // Lấy userId từ user đang đăng nhập (lưu trong localStorage)
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || '';
  const { data, loading, error } = useDashboardData(userId);

  // EARS[State-driven]: WHILE the dashboard data is loading, THE system SHALL display a loading spinner.
  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" data-testid="dashboard-loading">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // EARS[Unwanted]: If the data fetch fails, THE system SHALL display an error message and allow retry.
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm border-0" role="alert" data-testid="dashboard-error">
          <h4 className="alert-heading fw-bold mb-3">⚠️ Xảy ra lỗi kết nối</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger px-4" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // EARS[Event]: WHEN the Student navigates to the dashboard, THE system SHALL display their personalized metrics.
  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bolder text-dark" style={{ letterSpacing: '-0.5px' }}>
        My Dashboard
      </h2>
      
      {/* Row 1: Stat Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Completed Lessons" value={data.stats.completedLessons} icon={<i className="bi bi-journal-check"></i>} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Total Mock Tests" value={data.stats.completedTests} icon={<i className="bi bi-file-earmark-text"></i>} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Average Band" value={data.stats.averageBandScore} icon={<i className="bi bi-award"></i>} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Study Hours" value={data.stats.studyHours} icon={<i className="bi bi-clock-history"></i>} />
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <TestScoreChart data={data.lineChartData} />
        </div>
        <div className="col-12 col-lg-4">
          <SkillRadarChart data={data.radarChartData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
