import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { testService } from '../../services/testService';
import { testAttemptService } from '../../services/testAttemptService';
import { isFreeAccessibleTest, normalizeTest } from '../../utils/testModel';

const SKILL_CONFIG = {
  Reading: { color: '#0ea5e9', bg: '#e0f2fe', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  Listening: { color: '#f59e0b', bg: '#fef3c7', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  Writing: { color: '#8b5cf6', bg: '#ede9fe', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  Speaking: { color: '#10b981', bg: '#d1fae5', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
};

const getSkill = (skill) => SKILL_CONFIG[skill] || SKILL_CONFIG.Reading;

const SKILL_GUIDE = {
  Reading: 'Đọc passage ở panel trái, trả lời câu hỏi ở panel phải và quản lý thời gian trong 60 phút.',
  Listening: 'Nghe audio, làm theo từng section và điền đáp án chính xác theo thứ tự câu hỏi.',
  Writing: 'Hoàn thành Task 1 và Task 2. Hệ thống hiển thị word count và chờ giáo viên chấm.',
  Speaking: 'Đi qua từng part, trả lời từng prompt/cue card. Bản demo lưu câu trả lời dạng text/mock audio.',
};

export default function TestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isPublicFreeRoute = location.pathname.startsWith('/free-tests');

  const [testDetail, setTestDetail] = useState(null);
  const [attemptInfo, setAttemptInfo] = useState({ limit: 0, used: 0, remaining: Infinity });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingAttempt, setIsCreatingAttempt] = useState(false);

  useEffect(() => {
    const fetchTestDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const test = await testService.getTestById(id);
        const normalized = normalizeTest(test);
        setTestDetail(normalized);

        if (isFreeAccessibleTest(normalized)) {
          const remaining = await testAttemptService.getRemainingAttempts(normalized, currentUser);
          setAttemptInfo(remaining);
        }
      } catch (err) {
        setError('Không tìm thấy bài test hoặc không thể tải dữ liệu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestDetail();
  }, [id, currentUser]);

  const canStart = useMemo(() => {
    if (!testDetail) return false;
    if (isFreeAccessibleTest(testDetail)) {
      return attemptInfo.remaining > 0;
    }
    return Boolean(currentUser);
  }, [testDetail, attemptInfo.remaining, currentUser]);

  const blockedMessage = useMemo(() => {
    if (!testDetail) return '';
    if (isFreeAccessibleTest(testDetail) && attemptInfo.remaining <= 0) {
      if (!currentUser) {
        return 'Bạn đã dùng hết 3 lượt miễn phí trên trình duyệt này. Hãy đăng ký hoặc đăng nhập để tiếp tục học với lộ trình đầy đủ.';
      }
      return 'Bạn đã dùng hết lượt làm miễn phí. Hãy mua hoặc vào khóa học phù hợp để tiếp tục luyện tập.';
    }
    if (!currentUser && !isFreeAccessibleTest(testDetail)) {
      return 'Bạn cần đăng nhập để làm test thuộc khóa học.';
    }
    return '';
  }, [testDetail, attemptInfo.remaining, currentUser]);

  const handleStartTest = async () => {
    if (!testDetail) return;
    if (!canStart) return;

    setIsCreatingAttempt(true);
    try {
      const attempt = await testAttemptService.createAttempt(testDetail, currentUser);
      const prefix = isPublicFreeRoute ? '/free-tests' : '/learning/tests';
      navigate(`${prefix}/attempt/${attempt.id}`);
    } catch (err) {
      alert('Không thể bắt đầu bài thi. Vui lòng thử lại sau.');
      setIsCreatingAttempt(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem', color: '#1b4332' }} role="status" />
        <p className="text-muted fw-semibold">Đang tải thông tin bài test...</p>
      </div>
    );
  }

  if (error || !testDetail) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-sm border-0 rounded-4 p-5 text-center">
          <h4 className="fw-bold mb-3">{error}</h4>
          <Link to={isPublicFreeRoute ? '/courses' : '/learning/tests'} className="btn btn-outline-danger rounded-pill px-4">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const sk = getSkill(testDetail.skill);
  const isFree = isFreeAccessibleTest(testDetail);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="container py-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: 14 }}>
              <li className="breadcrumb-item">
                <Link to={isPublicFreeRoute ? '/courses' : '/learning/tests'} className="text-decoration-none" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {isPublicFreeRoute ? 'Tài nguyên miễn phí' : 'Danh sách bài thi'}
                </Link>
              </li>
              <li className="breadcrumb-item active" style={{ color: 'rgba(255,255,255,0.9)' }}>{testDetail.title}</li>
            </ol>
          </nav>
        </div>
        <div className="container pb-5 pt-2">
          <div className="row align-items-end">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-3" style={{ width: 48, height: 48, background: sk.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                <span className="badge px-3 py-2 fw-semibold" style={{ background: sk.bg, color: sk.color, borderRadius: 20 }}>
                  {testDetail.skill}
                </span>
                {isFree && <span className="badge bg-success px-3 py-2 rounded-pill">Free test</span>}
              </div>
              <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>
                {testDetail.title}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 15, marginBottom: 0 }}>
                {testDetail.description || SKILL_GUIDE[testDetail.skill]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4 align-items-start">
          <div className="col-lg-7">
            <div className="row g-3 mb-4">
              {[
                { label: 'Thời gian', value: `${testDetail.durationMinutes} phút`, color: '#0ea5e9', bg: '#e0f2fe' },
                { label: 'Số câu/task', value: `${testDetail.totalQuestions}`, color: '#8b5cf6', bg: '#ede9fe' },
                { label: 'Thang điểm', value: testDetail.bandScale || 'IELTS 0-9', color: '#10b981', bg: '#d1fae5' },
              ].map((stat) => (
                <div className="col-4" key={stat.label}>
                  <div className="text-center p-3 rounded-3" style={{ background: stat.bg, border: `1px solid ${stat.color}30` }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-4 p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
              <h5 className="fw-bold text-dark mb-4">Hướng dẫn làm bài</h5>
              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded-3" style={{ background: '#f8fafc' }}>{SKILL_GUIDE[testDetail.skill]}</div>
                <div className="p-3 rounded-3" style={{ background: '#f8fafc' }}>Không tải lại trang trong lúc làm bài để tránh mất dữ liệu.</div>
                <div className="p-3 rounded-3" style={{ background: '#f8fafc' }}>Bài làm sẽ tự nộp khi hết thời gian.</div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="rounded-4 overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', position: 'sticky', top: 80 }}>
              <div style={{ background: sk.gradient, padding: 24, textAlign: 'center' }}>
                <h4 className="fw-bold text-white mb-1">Sẵn sàng làm bài?</h4>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Đồng hồ bắt đầu ngay khi bạn nhấn nút.
                </p>
              </div>
              <div style={{ background: '#fff', padding: 28 }}>
                {isFree && (
                  <div className="alert alert-info border-0 rounded-3 small">
                    {!currentUser && (
                      <div className="mb-2">
                        Lượt làm bài của bạn được lưu trên trình duyệt này. Đăng ký tài khoản để lưu tiến trình vĩnh viễn.
                      </div>
                    )}
                    <strong>Lượt còn lại:</strong> {attemptInfo.remaining === Infinity ? 'Không giới hạn' : `${attemptInfo.remaining}/${attemptInfo.limit}`}
                  </div>
                )}

                {blockedMessage && (
                  <div className="alert alert-warning border-0 rounded-3">
                    {blockedMessage}
                    <div className="d-flex gap-2 mt-3 flex-wrap">
                      {!currentUser && (
                        <>
                          <Link to="/login" className="btn btn-sm btn-primary">Đăng nhập</Link>
                          <Link to="/register" className="btn btn-sm btn-outline-primary">Đăng ký</Link>
                        </>
                      )}
                      {currentUser && testDetail.courseId && (
                        <Link to={`/courses/${testDetail.courseId}`} className="btn btn-sm btn-primary">Xem khóa học</Link>
                      )}
                    </div>
                  </div>
                )}

                <button
                  className="btn w-100 fw-bold py-3"
                  style={{
                    background: !canStart || isCreatingAttempt ? '#94a3b8' : 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                    color: '#fff',
                    borderRadius: 14,
                    fontSize: 17,
                    border: 'none',
                  }}
                  onClick={handleStartTest}
                  disabled={!canStart || isCreatingAttempt}
                >
                  {isCreatingAttempt ? 'Đang chuẩn bị...' : 'Bắt đầu làm bài'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
