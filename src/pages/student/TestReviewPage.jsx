import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { convertBandScore } from '../../utils/quizUtils';

const API_URL = 'http://localhost:9999';

const SKILL_CONFIG = {
  Reading:   { color: '#0ea5e9', bg: '#e0f2fe', icon: '📖', gradient: 'linear-gradient(135deg,#0ea5e9,#0284c7)' },
  Listening: { color: '#f59e0b', bg: '#fef3c7', icon: '🎧', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
};
const getSkill = (skill) => SKILL_CONFIG[skill] || { color: '#6366f1', bg: '#eef2ff', icon: '📝', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' };

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
}

function calcDuration(start, end) {
  if (!start || !end) return '—';
  const ms = new Date(end) - new Date(start);
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Inline QuestionReview card styled like The Forum
function QuestionReviewCard({ question, index, studentAnswer }) {
  const isWriting = question.type === 'writing-task';
  const isSpeaking = question.type === 'speaking-part';
  const isManualGraded = isWriting || isSpeaking;

  // Manual Graded layout (Writing/Speaking) - Simplified, no yellow boxes, no question numbers
  if (isManualGraded) {
    const wordCount = studentAnswer ? String(studentAnswer).trim().split(/\s+/).length : 0;
    
    return (
      <div data-testid={`review-question-${question.id}`} className="mb-4">
        <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
          {isWriting ? `Task ${question.taskNumber || index + 1}` : `Part ${question.part || index + 1}`}
        </h5>
        
        <div className="p-4 rounded-4" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div className="mb-4 text-dark" style={{ fontSize:15, lineHeight: 1.6 }}>
            <strong>Đề bài: </strong>
            <span style={{ whiteSpace: 'pre-wrap' }}>{question.prompt || question.questionText}</span>
          </div>

          {isWriting && (
            <div className="p-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-muted small mb-3 d-flex justify-content-between border-bottom pb-2">
                <span className="text-uppercase fw-bold" style={{ letterSpacing: 0.5 }}>Bài làm của bạn</span>
                <span className="fw-bold">{wordCount} từ</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: '#334155', fontSize: 15, lineHeight: 1.8 }}>
                {studentAnswer || <em className="text-muted">Bạn chưa viết nội dung nào cho phần này.</em>}
              </div>
            </div>
          )}

          {isSpeaking && (
            <div className="p-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-muted small mb-3 border-bottom pb-2 text-uppercase fw-bold" style={{ letterSpacing: 0.5 }}>
                Phần ghi âm của bạn
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: '#e0e7ff', color: '#4f46e5' }}>
                  <span style={{ fontSize: 20 }}>🎙️</span>
                </div>
                <span style={{ color: '#334155', fontSize: 15, fontWeight: 500 }}>
                  {studentAnswer || <em className="text-muted">Bạn chưa ghi âm cho phần này.</em>}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Auto Graded Layout
  const isCorrect = studentAnswer &&
    String(studentAnswer).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
  const isEmpty = !studentAnswer;

  const OPTION_LETTERS = ['A','B','C','D','E','F'];

  const renderOptions = () => {
    if (question.type === 'fill-in-the-blank') {
      return (
        <div className="mt-3 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <span className="text-muted" style={{ fontSize:13 }}>Câu trả lời của bạn: </span>
          <span style={{ fontWeight:700, color: isCorrect ? '#10b981' : isEmpty ? '#94a3b8' : '#ef4444' }}>
            {studentAnswer || <em className="text-muted fw-normal">Không trả lời</em>}
          </span>
        </div>
      );
    }

    const opts = question.options || [];
    return (
      <div className="d-flex flex-column gap-2 mt-3">
        {opts.map((opt, i) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          const isUserChoice = String(studentAnswer) === String(val);
          const isCorrectAnswer = String(question.answer).trim().toLowerCase() === String(val).trim().toLowerCase();

          let bg = '#f8fafc', border = '#e2e8f0', color = '#475569';
          if (isCorrectAnswer) { bg = '#d1fae5'; border = '#10b981'; color = '#065f46'; }
          else if (isUserChoice && !isCorrect) { bg = '#fee2e2'; border = '#ef4444'; color = '#7f1d1d'; }

          return (
            <div key={i} className="d-flex align-items-center gap-3 p-3 rounded-3"
              style={{ background: bg, border: `2px solid ${border}`, transition: 'none' }}>
              <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                style={{ width:28, height:28, background: isCorrectAnswer ? '#10b981' : (isUserChoice && !isCorrect) ? '#ef4444' : '#e2e8f0',
                  color: (isCorrectAnswer || (isUserChoice && !isCorrect)) ? '#fff' : '#64748b', fontSize:13 }}>
                {OPTION_LETTERS[i]}
              </div>
              <span style={{ fontSize:14, color, flex:1 }}>{label}</span>
              
              {/* Clear labels for correct/wrong choices */}
              {isCorrectAnswer && isUserChoice && <span className="ms-auto text-success fw-bold">✓ Chính xác</span>}
              {isCorrectAnswer && !isUserChoice && <span className="ms-auto text-success fw-bold">✓ Đáp án đúng</span>}
              {isUserChoice && !isCorrectAnswer && <span className="ms-auto text-danger fw-bold">✗ Bạn chọn</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      data-testid={`review-question-${question.id}`}
      className="rounded-4 overflow-hidden"
      style={{
        background: '#fff',
        border: `2px solid ${isCorrect ? '#10b981' : isEmpty ? '#cbd5e1' : '#ef4444'}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}
    >
      {/* Question header */}
      <div className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{
          background: isCorrect ? '#d1fae5' : isEmpty ? '#f8fafc' : '#fee2e2',
          borderBottom: `1px solid ${isCorrect ? '#10b981' : isEmpty ? '#cbd5e1' : '#ef4444'}30`,
        }}>
        <div className="d-flex align-items-center gap-2">
          <span className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
            style={{ width:30, height:30, background: isCorrect ? '#10b981' : isEmpty ? '#94a3b8' : '#ef4444', fontSize:13 }}>
            {index + 1}
          </span>
          <span className="fw-semibold" style={{ color: isCorrect ? '#065f46' : isEmpty ? '#475569' : '#7f1d1d', fontSize:14 }}>
            {question.type === 'multiple-choice' ? 'Trắc nghiệm' :
              question.type === 'true-false-not-given' ? 'True / False / Not Given' : 'Điền vào chỗ trống'}
          </span>
        </div>
        <span className="fw-bold" style={{ fontSize:14, color: isCorrect ? '#10b981' : isEmpty ? '#64748b' : '#ef4444' }}>
          {isEmpty ? '— Bỏ qua' : isCorrect ? '✓ Chính xác' : '✗ Sai'}
        </span>
      </div>

      {/* Question body */}
      <div className="p-4">
        <p className="fw-semibold text-dark lh-base mb-1" style={{ fontSize:15 }}>
          {question.prompt || question.questionText}
        </p>

        {renderOptions()}

        {/* Answer summary */}
        {question.type === 'fill-in-the-blank' && (
          <div className="mt-3 p-3 rounded-3 d-flex align-items-center gap-2"
            style={{ background: '#d1fae5', border:'1px solid #10b981' }}>
            <span className="text-success">✓</span>
            <span style={{ fontSize:13, color:'#065f46' }}>
              <strong>Đáp án đúng:</strong> <span className="fw-bold">{question.answer}</span>
            </span>
          </div>
        )}

        {/* Incorrect fill-in */}
        {question.type === 'fill-in-the-blank' && !isCorrect && !isEmpty && (
          <div className="mt-2 p-3 rounded-3 d-flex align-items-center gap-2"
            style={{ background: '#fee2e2', border:'1px solid #ef4444' }}>
            <span className="text-danger">✗</span>
            <span style={{ fontSize:13, color:'#7f1d1d' }}>
              <strong>Bạn đã nhập:</strong> <span className="text-decoration-line-through">{studentAnswer}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestReviewPage() {
  const { attemptId } = useParams();

  const [attempt, setAttempt] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState({ correct: 0, total: 0, band: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
const attemptRes = await axios.get(`${API_URL}/testAttempts/${attemptId}`);
        const attemptData = attemptRes.data;
        setAttempt(attemptData);

        const testRes = await axios.get(`${API_URL}/tests/${attemptData.testId}`);
        setTestDetail(testRes.data);

        const questionsRes = await axios.get(`${API_URL}/questions?testId=${attemptData.testId}`);
        const questionsData = questionsRes.data;
        setQuestions(questionsData);

        let correctCount = 0;
        const answers = attemptData.answers || {};
        questionsData.forEach((q, index) => {
          const studentAnswer = answers[index];
          if (studentAnswer && String(studentAnswer).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) {
            correctCount++;
          }
        });

        const band = convertBandScore(correctCount, questionsData.length);
        setScoreData({ correct: correctCount, total: questionsData.length, band });
      } catch (err) {
        setError('Lỗi khi tải dữ liệu kết quả bài làm.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }} data-testid="review-loading">
        <div className="spinner-border mb-3" style={{ width:'3rem', height:'3rem', color:'#1b4332' }} role="status" />
        <p className="text-muted fw-semibold">Đang tải kết quả...</p>
      </div>
    );
  }

  if (error || !attempt || !testDetail) {
    return (
      <div className="container mt-5" data-testid="review-error">
        <div className="alert alert-danger rounded-4 p-4 text-center">
          {error || 'Không tìm thấy kết quả bài làm.'}
          <br />
          <Link to="/learning/tests" className="btn btn-outline-danger mt-3 rounded-pill">← Quay lại</Link>
        </div>
      </div>
    );
  }

  const sk = getSkill(testDetail.skill);
  const isAutoGraded = !['Writing', 'Speaking'].includes(testDetail.skill);

  const renderScoreCards = () => {
    if (!isAutoGraded) {
      return (
        <div className="row g-3 mb-5">
          <div className="col-12 col-md-4">
            <div className="rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center" style={{ background:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid #f59e0b' }}>
              <div style={{ fontSize:40 }}>⏳</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#d97706', textTransform:'uppercase', marginTop:8 }}>Chờ chấm điểm</div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>Bài làm tự luận</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center" style={{ background:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:40, fontWeight:900, color:'#334155' }}>4</div>
              <div style={{ fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5 }}>Tiêu chí đánh giá</div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>Đang chờ giảng viên</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center" style={{ background: sk.bg, boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:`1px solid ${sk.color}40` }}>
              <div style={{ fontSize:40 }}>{sk.icon}</div>
              <div style={{ fontSize:14, fontWeight:800, color:sk.color, textTransform:'capitalize' }}>
                {attempt.status === 'completed' ? 'Hoàn thành' : attempt.status}
              </div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>{testDetail.skill}</div>
            </div>
          </div>
        </div>
      );
    }

    // Auto Graded Cards
    const pct = scoreData.total > 0 ? Math.round((scoreData.correct / scoreData.total) * 100) : 0;
    const bandColor = scoreData.band >= 7 ? '#10b981' : scoreData.band >= 5 ? '#f59e0b' : '#ef4444';
    
    return (
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div className="rounded-4 p-4 text-center h-100" style={{ background:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' }}>
            <div style={{ fontSize:40, fontWeight:900, color: pct>=70?'#10b981':pct>=50?'#f59e0b':'#ef4444' }}>{pct}%</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5 }}>Tỉ lệ đúng</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="rounded-4 p-4 text-center h-100" style={{ background:'#d1fae5', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #10b981' }}>
            <div style={{ fontSize:40, fontWeight:900, color:'#065f46' }}>{scoreData.correct}</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:0.5 }}>Câu đúng</div>
            <div style={{ fontSize:12, color:'#6ee7b7' }}>/ {scoreData.total} câu</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="rounded-4 p-4 text-center h-100" style={{ background:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:`2px solid ${bandColor}` }}>
            <div style={{ fontSize:40, fontWeight:900, color:bandColor }}>{scoreData.band.toFixed(1)}</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5 }}>Band Score</div>
            <div style={{ fontSize:11, color:'#cbd5e1' }}>IELTS Mock</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="rounded-4 p-4 text-center h-100" style={{ background: sk.bg, boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:`1px solid ${sk.color}40` }}>
            <div style={{ fontSize:40 }}>{sk.icon}</div>
            <div style={{ fontSize:14, fontWeight:800, color:sk.color, textTransform:'capitalize' }}>
              {attempt.status === 'completed' ? 'Hoàn thành' : attempt.status}
            </div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>{testDetail.skill}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }} data-testid="review-page">

      {/* ===== HEADER ===== */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', paddingBottom: 0 }}>
        <div className="container py-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb mb-0" style={{ fontSize: 13 }}>
              <li className="breadcrumb-item">
                <Link to="/learning/tests" className="text-decoration-none" style={{ color:'rgba(255,255,255,0.55)' }}>
                  Danh sách bài thi
                </Link>
              </li>
              <li className="breadcrumb-item active" style={{ color:'rgba(255,255,255,0.85)' }}>
                Kết quả: {testDetail.title}
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-center gap-3 mb-2">
            <span style={{ fontSize:32 }}>{sk.icon}</span>
            <div>
              <h1 className="fw-bold text-white mb-0" style={{ fontSize:'clamp(1.4rem,3vw,2rem)' }}>
                {testDetail.title}
              </h1>
              <span className="badge mt-1 px-3 py-1" style={{ background:sk.bg, color:sk.color, borderRadius:20, fontSize:12 }}>
                {testDetail.skill}
              </span>
            </div>
          </div>

          {/* Meta info row */}
          <div className="d-flex flex-wrap gap-4 mt-3 pb-4" style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>
            <span>📅 <strong className="text-white">Bắt đầu:</strong> {formatDate(attempt.startTime)}</span>
            <span>✅ <strong className="text-white">Hoàn thành:</strong> {formatDate(attempt.completedAt)}</span>
            <span>⏱ <strong className="text-white">Thời gian làm:</strong> {calcDuration(attempt.startTime, attempt.completedAt)}</span>
          </div>
        </div>
      </div>

      {/* ===== SCORE CARDS ===== */}
      <div className="container" style={{ marginTop: -1 }}>
        
        {renderScoreCards()}

        {/* ===== QUESTION REVIEW LIST ===== */}
        <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
          <span>📋</span> Chi tiết từng bài
        </h4>

        <div className="d-flex flex-column gap-4">
          {questions.map((question, index) => (
            <QuestionReviewCard
              key={question.id}
              question={question}
              index={index}
              studentAnswer={attempt.answers?.[index]}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="d-flex justify-content-center gap-3 mt-5 pb-5 flex-wrap">
          <Link
            to="/learning/tests"
            className="btn fw-bold px-5 py-3 rounded-pill"
            style={{ background:'#1b4332', color:'#fff', fontSize:15, boxShadow:'0 4px 16px rgba(27,67,50,0.3)' }}
          >
            ← Về danh sách bài thi
          </Link>
          <Link
            to={`/learning/tests/${testDetail.id}`}
            className="btn fw-bold px-5 py-3 rounded-pill"
            style={{ background:'#fff', color:'#1b4332', border:'2px solid #1b4332', fontSize:15 }}
          >
            🔁 Thi lại
          </Link>
        </div>
      </div>
    </div>
  );
}
