import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser } from '../../services/authService';

const API_URL = 'http://localhost:9999';

const SKILL_CONFIG = {
  Reading:   { color: '#0ea5e9', bg: '#e0f2fe', icon: '📖', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  Listening: { color: '#f59e0b', bg: '#fef3c7', icon: '🎧', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  Writing:   { color: '#8b5cf6', bg: '#ede9fe', icon: '✍️', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  Speaking:  { color: '#10b981', bg: '#d1fae5', icon: '🎤', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
};
const getSkill = (skill) => SKILL_CONFIG[skill] || { color: '#6366f1', bg: '#eef2ff', icon: '📝', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' };

const INSTRUCTIONS = [
  { icon: '📶', text: 'Đảm bảo kết nối mạng ổn định trong suốt quá trình làm bài.' },
  { icon: '🚫', text: 'Không tải lại (refresh) trang khi đang làm bài để tránh mất dữ liệu.' },
  { icon: '⏰', text: 'Bài làm sẽ tự động được nộp khi hết thời gian.' },
  { icon: '📊', text: 'Bạn có thể xem lại kết quả và đáp án chi tiết sau khi nộp bài.' },
];

export default function TestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testDetail, setTestDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingAttempt, setIsCreatingAttempt] = useState(false);

  useEffect(() => {
    const fetchTestDetail = async () => {
      try {
        const response = await axios.get(`${API_URL}/tests/${id}`);
        setTestDetail(response.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Không tìm thấy bài thi.' : 'Lỗi khi tải chi tiết bài thi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestDetail();
  }, [id]);

  const handleStartTest = async () => {
    setIsCreatingAttempt(true);
    try {
      const currentUser = getCurrentUser();
      const payload = {
        userId: currentUser?.id,
        testId: id,
        skill: testDetail?.skill,
        startTime: new Date().toISOString(),
        status: 'in-progress',
      };
      const response = await axios.post(`${API_URL}/testAttempts`, payload);
      navigate(`/learning/tests/attempt/${response.data.id}`);
    } catch (err) {
      alert('Không thể bắt đầu bài thi. Vui lòng thử lại sau.');
      setIsCreatingAttempt(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }} data-testid="detail-loading">
        <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem', color: '#1b4332' }} role="status" />
        <p className="text-muted fw-semibold">Đang tải thông tin bài thi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5" data-testid="detail-error">
        <div className="alert alert-danger shadow-sm border-0 rounded-4 p-5 text-center">
          <h4 className="fw-bold mb-3">😞 {error}</h4>
          <Link to="/learning/tests" className="btn btn-outline-danger rounded-pill px-4">← Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  if (!testDetail) return null;

  const sk = getSkill(testDetail.skill);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }} data-testid="detail-page">

      {/* ===== HERO HEADER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '0 0 0',
        borderBottom: '1px solid #1e293b',
      }}>
        {/* Breadcrumb */}
        <div className="container py-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: 14 }}>
              <li className="breadcrumb-item">
                <Link to="/learning/tests" className="text-decoration-none" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Danh sách bài thi
                </Link>
              </li>
              <li className="breadcrumb-item active" style={{ color: 'rgba(255,255,255,0.9)' }} aria-current="page">
                {testDetail.title}
              </li>
            </ol>
          </nav>
        </div>

        {/* Title area */}
        <div className="container pb-5 pt-2">
          <div className="row align-items-end">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width:48, height:48, background:sk.gradient, fontSize:24, boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}>
                  {sk.icon}
                </div>
                <span className="badge px-3 py-2 fw-semibold" style={{ background:sk.bg, color:sk.color, borderRadius:20, fontSize:13 }}>
                  {testDetail.skill}
                </span>
              </div>
              <h1 className="fw-bold text-white mb-2" style={{ fontSize:'clamp(1.6rem,4vw,2.4rem)', letterSpacing:'-0.3px' }}>
                {testDetail.title}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:15, marginBottom:0 }}>
                Bài thi thực hành chuẩn định dạng IELTS. Hãy chuẩn bị sẵn sàng trước khi bắt đầu tính giờ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="container py-5">
        <div className="row g-4 align-items-start">

          {/* LEFT: Test info */}
          <div className="col-lg-7">
            {/* Stats row */}
            <div className="row g-3 mb-4">
              {[
                { icon: '⏱️', label: 'Thời gian làm bài', value: `${testDetail.durationMinutes} phút`, color: '#0ea5e9', bg: '#e0f2fe' },
                { icon: '📝', label: 'Tổng số câu hỏi', value: `${testDetail.totalQuestions} câu`, color: '#8b5cf6', bg: '#ede9fe' },
                { icon: '🎯', label: 'Thang điểm', value: testDetail.bandScale || 'IELTS 0–9', color: '#10b981', bg: '#d1fae5' },
              ].map((stat, i) => (
                <div className="col-4" key={i}>
                  <div className="text-center p-3 rounded-3" style={{ background: stat.bg, border: `1px solid ${stat.color}30` }}>
                    <div style={{ fontSize: 28 }}>{stat.icon}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform:'uppercase', marginTop:4 }}>{stat.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: stat.color, marginTop:2 }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="rounded-4 p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
              <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                <span>📋</span> Hướng dẫn làm bài
              </h5>
              <div className="d-flex flex-column gap-3">
                {INSTRUCTIONS.map((ins, i) => (
                  <div key={i} className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{ins.icon}</span>
                    <p className="mb-0" style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Start box */}
          <div className="col-lg-5">
            <div className="rounded-4 overflow-hidden" style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              position: 'sticky',
              top: 80,
            }}>
              {/* Card header */}
              <div style={{
                background: sk.gradient,
                padding: '24px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>🚀</div>
                <h4 className="fw-bold text-white mb-1">Sẵn sàng chưa?</h4>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Click để bắt đầu làm bài và tính giờ ngay
                </p>
              </div>

              {/* Card body */}
              <div style={{ background: '#fff', padding: '28px' }}>
                {/* Quick info */}
                <div className="d-flex justify-content-around mb-4 pb-4" style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <div className="text-center">
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1b4332' }}>{testDetail.durationMinutes}'</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>PHÚT</div>
                  </div>
                  <div style={{ width: 1, background: '#e2e8f0' }} />
                  <div className="text-center">
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1b4332' }}>{testDetail.totalQuestions}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>CÂU HỎI</div>
                  </div>
                  <div style={{ width: 1, background: '#e2e8f0' }} />
                  <div className="text-center">
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1b4332' }}>0–9</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>BAND</div>
                  </div>
                </div>

                <button
                  className="btn w-100 fw-bold py-3"
                  style={{
                    background: isCreatingAttempt ? '#94a3b8' : 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                    color: '#fff',
                    borderRadius: 14,
                    fontSize: 17,
                    letterSpacing: 0.5,
                    boxShadow: isCreatingAttempt ? 'none' : '0 4px 16px rgba(27,67,50,0.35)',
                    transition: 'all 0.25s ease',
                    border: 'none',
                  }}
                  onClick={handleStartTest}
                  disabled={isCreatingAttempt}
                  data-testid="start-test-btn"
                  onMouseEnter={e => !isCreatingAttempt && (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isCreatingAttempt ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Đang chuẩn bị...</>
                  ) : '▶  Bắt đầu làm bài'}
                </button>

                <p className="text-center mt-3 mb-0" style={{ fontSize: 12, color: '#94a3b8' }}>
                  Đồng hồ bắt đầu ngay khi bạn nhấn nút
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
