import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../../services/testService';

const SKILL_CONFIG = {
  Reading:   { color: '#0ea5e9', bg: '#e0f2fe', icon: '📖', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' },
  Listening: { color: '#f59e0b', bg: '#fef3c7', icon: '🎧', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  Writing:   { color: '#8b5cf6', bg: '#ede9fe', icon: '✍️', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  Speaking:  { color: '#10b981', bg: '#d1fae5', icon: '🎤', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
};
const getSkill = (skill) => SKILL_CONFIG[skill] || { color: '#6366f1', bg: '#eef2ff', icon: '📝', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' };

const FILTERS = ['Tất cả', 'Reading', 'Listening', 'Writing', 'Speaking'];

export default function TestListPage() {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await testService.getPublishedTests();
        setTests(data);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải danh sách bài thi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filtered = activeFilter === 'Tất cả'
    ? tests
    : tests.filter(t => t.skill === activeFilter);

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }} data-testid="testlist-loading">
        <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem', color: '#1b4332' }} role="status" />
        <p className="text-muted fw-semibold">Đang tải danh sách bài thi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5" data-testid="testlist-error">
        <div className="alert alert-danger shadow-sm border-0 rounded-4 p-4 text-center">
          <h4 className="alert-heading fw-bold mb-2">Oops! Lỗi xảy ra</h4>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }} data-testid="testlist-page">

      {/* ===== HERO BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
        padding: '64px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div className="container position-relative">
          <div className="d-flex align-items-center gap-3 mb-3">
            <span style={{ fontSize: 36 }}>🏆</span>
            <span className="badge px-3 py-2 fw-semibold" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:13, borderRadius:20 }}>
              IELTS Practice Tests
            </span>
          </div>
          <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing:'-0.5px' }}>
            Thi thử IELTS Online
          </h1>
          <p className="mb-0" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, maxWidth: 560 }}>
            Luyện tập với bài thi chuẩn định dạng IELTS. Làm quen với áp lực thời gian thực và nhận kết quả tức thì.
          </p>
        </div>
      </div>

      {/* ===== FILTER TABS ===== */}
      <div className="bg-white border-bottom shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <div className="d-flex align-items-center gap-2 py-3 overflow-auto" style={{ scrollbarWidth: 'none' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className="btn fw-semibold flex-shrink-0"
                style={{
                  borderRadius: 24,
                  padding: '8px 22px',
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                  border: activeFilter === f ? '2px solid #1b4332' : '2px solid transparent',
                  background: activeFilter === f ? '#1b4332' : '#f1f5f9',
                  color: activeFilter === f ? '#fff' : '#475569',
                }}
              >
                {f === 'Tất cả' ? '📋 Tất cả' : f}
              </button>
            ))}
            <span className="ms-auto text-muted small flex-shrink-0">
              {filtered.length} bài thi
            </span>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="container py-5">
        {filtered.length === 0 ? (
          <div className="text-center py-5" data-testid="testlist-empty">
            <p style={{ fontSize: 64 }}>🔍</p>
            <h5 className="fw-bold text-dark mb-2">Hiện không có bài thi nào trong hệ thống.</h5>
            <p className="text-muted">Thử chọn kỹ năng khác hoặc quay lại sau.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((test) => {
              const sk = getSkill(test.skill);
              return (
                <div className="col-12 col-md-6 col-xl-4" key={test.id} data-testid={`test-card-${test.id}`}>
                  <div
                    className="h-100"
                    style={{
                      background: '#fff',
                      borderRadius: 20,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      display: 'flex', flexDirection: 'column',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.13)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'; }}
                  >
                    {/* Card top accent */}
                    <div style={{ height: 5, background: sk.gradient }} />

                    <div className="p-4 d-flex flex-column" style={{ flex: 1 }}>
                      {/* Header row */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{ width:38, height:38, background:sk.bg, fontSize:18 }}>
                            {sk.icon}
                          </div>
                          <span className="fw-bold" style={{ color:sk.color, fontSize:13 }}>
                            {test.skill}
                          </span>
                        </div>
                        {/* IELTS score badge */}
                        <div className="text-center">
                          <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>ĐIỂM</div>
                          <div style={{ fontSize:22, fontWeight:800, color:'#cbd5e1' }}>0.0</div>
                        </div>
                      </div>

                      {/* Title */}
                      <h5 className="fw-bold text-dark lh-base mb-3" style={{ fontSize: 16 }}>
                        {test.title}
                      </h5>

                      {/* Metadata */}
                      <div className="d-flex align-items-center gap-3 mb-4" style={{ fontSize:13, color:'#64748b' }}>
                        <span className="d-flex align-items-center gap-1">
                          <span>🕒</span> {test.durationMinutes} phút
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <span>📝</span> {test.totalQuestions} câu
                        </span>
                      </div>

                      {/* Status + CTA */}
                      <div className="mt-auto d-flex align-items-center justify-content-between gap-3">
                        <span className="d-flex align-items-center gap-1" style={{ fontSize:13, color:'#10b981', fontWeight:600 }}>
                          <span style={{ width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block' }} />
                          Chưa thi
                        </span>
                        <Link
                          to={`/learning/tests/${test.id}`}
                          className="btn fw-bold px-4 py-2"
                          style={{
                            background: '#1b4332',
                            color: '#fff',
                            borderRadius: 12,
                            fontSize: 14,
                            transition: 'background 0.2s ease',
                            textDecoration: 'none',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background='#2d6a4f'}
                          onMouseLeave={e => e.currentTarget.style.background='#1b4332'}
                        >
                          Thi thử →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
