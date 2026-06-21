import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../../components/feature/quiz/ProgressBar';
import CountdownTimer from '../../components/feature/quiz/CountdownTimer';
import QuestionRenderer from '../../components/feature/quiz/QuestionRenderer';

const API_URL = 'http://localhost:9999';

// ─── Question Map Item ─────────────────────────────────────────────────────
const QMapItem = ({ number, isCurrent, isAnswered, isFlagged, onClick }) => {
  let bg = '#fff', color = '#334155', border = '2px solid #cbd5e1';
  if (isCurrent)   { bg = '#1b4332'; color = '#fff'; border = '2px solid #1b4332'; }
  else if (isFlagged)  { bg = '#fef3c7'; color = '#92400e'; border = '2px solid #f59e0b'; }
  else if (isAnswered) { bg = '#dcfce7'; color = '#166534'; border = '2px solid #22c55e'; }

  return (
    <button type="button" onClick={onClick} title={isCurrent?'Đang làm':isFlagged?'Cần xem lại':isAnswered?'Đã làm':'Chưa làm'}
      style={{ width:34, height:34, border, background:bg, color, borderRadius:8, fontWeight:700, fontSize:13,
        cursor:'pointer', transition:'all 0.15s ease', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {number}
    </button>
  );
};

// ─── Audio Player for Listening ───────────────────────────────────────────
const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="d-flex align-items-center gap-3 px-4 py-3"
      style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)', borderBottom: '1px solid #f59e0b' }}>
      <audio ref={audioRef} src={audioUrl}
        onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)} />
      <span style={{ fontSize: 20 }}>🎧</span>
      <button type="button" onClick={toggle}
        className="btn fw-bold d-flex align-items-center justify-content-center"
        style={{ width:40, height:40, borderRadius:'50%', background:'#f59e0b', color:'#fff', border:'none', fontSize:16, flexShrink:0 }}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div className="flex-grow-1">
        <div className="rounded-pill" style={{ height:6, background:'#fed7aa', position:'relative' }}>
          <div className="rounded-pill" style={{ height:6, background:'#f59e0b', width:`${pct}%`, transition:'width 0.3s linear' }} />
        </div>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#92400e', whiteSpace:'nowrap' }}>
        {fmt(currentTime)} / {duration>0?fmt(duration):'--:--'}
      </span>
      <span style={{ fontSize:12, color:'#92400e', fontWeight:600 }}>
        Nghe và trả lời tất cả câu hỏi bên dưới
      </span>
    </div>
  );
};

// ─── Main TestSessionPage ─────────────────────────────────────────────────
export default function TestSessionPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [expireAt, setExpireAt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attemptRes = await axios.get(`${API_URL}/attempts/${attemptId}`);
        const attemptData = attemptRes.data;
        setAttempt(attemptData);
        if (attemptData.status === 'completed') {
          navigate(`/learning/tests/review/${attemptId}`, { replace: true });
          return;
        }
        const testRes = await axios.get(`${API_URL}/tests/${attemptData.testId}`);
        const testData = testRes.data;
        setTestInfo(testData);
        const questionsRes = await axios.get(`${API_URL}/questions?testId=${attemptData.testId}`);
        setQuestions(questionsRes.data);
        const startTime = new Date(attemptData.startTime).getTime();
        const durationMs = (testData.durationMinutes || 60) * 60 * 1000;
        setExpireAt(startTime + durationMs);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu bài thi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [attemptId, navigate]);

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => {
      const index = questions.findIndex(q => q.id === questionId);
      if (index === -1) return prev;
      return { ...prev, [index]: value };
    });
  }, [questions]);

  const handleToggleFlag = (index) => setFlagged(prev => ({ ...prev, [index]: !prev[index] }));

  const handleSubmitAttempt = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`${API_URL}/attempts/${attemptId}`, {
        status: 'completed', completedAt: new Date().toISOString(), answers,
      });
      navigate(`/learning/tests/review/${attemptId}`);
    } catch (err) {
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  }, [attemptId, answers, isSubmitting, navigate]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100" data-testid="session-loading">
        <div className="spinner-border mb-3" style={{ width:'3rem', height:'3rem', color:'#1b4332' }} role="status" />
        <p className="text-muted fw-semibold">Đang chuẩn bị bài thi...</p>
      </div>
    );
  }

  if (error || !attempt || questions.length === 0) {
    return (
      <div className="container mt-5" data-testid="session-error">
        <div className="alert alert-danger rounded-4 p-4 text-center shadow-sm">
          <h5 className="fw-bold">Không thể tải bài thi</h5>
          <p className="mb-0">{error || 'Không tìm thấy câu hỏi nào cho bài thi này.'}</p>
        </div>
      </div>
    );
  }

  const skill = testInfo?.skill || 'Reading';
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  const SKILL_COLOR = {
    Reading: '#0ea5e9', Listening: '#f59e0b', Writing: '#8b5cf6', Speaking: '#10b981',
  };
  const skillColor = SKILL_COLOR[skill] || '#0ea5e9';

  // ─── Shared Sticky Header ──────────────────────────────────────────────
  const StickyHeader = () => (
    <div className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1030 }}>
      <div className="container-fluid px-4" style={{ maxWidth: 1400 }}>
        <div className="d-flex align-items-center justify-content-between py-2 gap-3">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <span className="badge px-3 py-2 fw-bold" style={{ background: skillColor, fontSize: 13, borderRadius: 20 }}>
              {skill}
            </span>
            <span className="text-muted small fw-semibold text-truncate d-none d-md-inline" style={{ maxWidth: 260 }}>
              {testInfo?.title}
            </span>
          </div>
          <div className="flex-grow-1 d-none d-lg-flex align-items-center gap-2" style={{ maxWidth:300 }}>
            <span className="text-muted small">{answeredCount}/{questions.length}</span>
            <div className="flex-grow-1"><ProgressBar percent={progressPercent} /></div>
          </div>
          {expireAt && (
            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-bold"
              style={{ background:'#fff5f5', border:'2px solid #fecaca', color:'#dc2626', whiteSpace:'nowrap', fontSize:18 }}>
              <span>⏱</span>
              <CountdownTimer expireAt={expireAt} onExpire={handleSubmitAttempt} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Question Map + Submit Sidebar ────────────────────────────────────
  const QuestionSidebar = () => (
    <div className="d-flex flex-column gap-3">
      {/* Map card */}
      <div className="rounded-4 p-4" style={{ background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold mb-0 text-dark">Bản đồ câu hỏi</h6>
          <span className="text-muted small">
            <strong className="text-success">{answeredCount}</strong>/{questions.length} câu
          </span>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {questions.map((q, index) => (
            <QMapItem key={q.id} number={index+1}
              isCurrent={currentQuestionIndex === index && skill !== 'Listening' && skill !== 'Writing'}
              isAnswered={!!answers[index]} isFlagged={!!flagged[index]}
              onClick={() => setCurrentQuestionIndex(index)} />
          ))}
        </div>
        <div className="d-flex flex-wrap gap-2 pt-2 border-top">
          {[
            { bg:'#dcfce7', border:'#22c55e', label:'Đã làm' },
            { bg:'#fef3c7', border:'#f59e0b', label:'Cần xem lại' },
            { bg:'#fff',    border:'#cbd5e1', label:'Chưa làm' },
          ].map(l => (
            <span key={l.label} className="d-flex align-items-center gap-1 small text-muted">
              <span style={{ width:14, height:14, borderRadius:4, border:`2px solid ${l.border}`, background:l.bg, display:'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      {/* Submit */}
      <button
        className="btn btn-lg fw-bold rounded-3 py-3 text-uppercase"
        style={{ background: isSubmitting?'#94a3b8':'linear-gradient(135deg,#1b4332,#2d6a4f)', color:'#fff', border:'none', boxShadow:'0 4px 16px rgba(27,67,50,0.3)', letterSpacing:0.5 }}
        onClick={() => window.confirm('Bạn có chắc chắn muốn nộp bài?') && handleSubmitAttempt()}
        disabled={isSubmitting} data-testid="submit-btn"
      >
        {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"/>Đang nộp...</> : `Nộp bài (${answeredCount}/${questions.length})`}
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // LAYOUT: READING — 2 columns sticky
  // ═══════════════════════════════════════════════════════════════════════
  if (skill === 'Reading') {
    const currentQuestion = questions[currentQuestionIndex];
    const passage = currentQuestion?.passage || '';
    return (
      <div style={{ background:'#f4f6f9', minHeight:'100vh', display:'flex', flexDirection:'column' }} data-testid="session-page">
        <StickyHeader />
        <div className="flex-grow-1 py-4">
          <div className="container-fluid px-3 px-md-4" style={{ maxWidth:1400 }}>
            <div className="row g-3">
              {/* Left: passage */}
              <div className="col-12 col-lg-5">
                <div className="rounded-4 overflow-hidden shadow-sm" style={{ position:'sticky', top:76, height:'calc(100vh - 100px)', display:'flex', flexDirection:'column', background:'#fff', border:'1px solid #e2e8f0' }}>
                  <div className="px-4 py-3 fw-bold d-flex align-items-center gap-2" style={{ background:'#e0f2fe', color:'#0369a1', borderBottom:'2px solid #0ea5e9', fontSize:14, flexShrink:0 }}>
                    📖 Reading Passage
                  </div>
                  <div className="px-5 py-4 overflow-auto" style={{ flex:1, lineHeight:1.9, fontSize:15, color:'#1e293b', fontFamily:'Georgia,serif', whiteSpace:'pre-wrap' }}>
                    {passage || <span className="text-muted">Không có đề bài.</span>}
                  </div>
                </div>
              </div>
              {/* Right: questions + sidebar */}
              <div className="col-12 col-lg-7 d-flex flex-column gap-3">
                {/* Question card */}
                <div className="rounded-4 overflow-hidden shadow-sm" style={{ background:'#fff', border:'1px solid #e2e8f0' }}>
                  <div className="d-flex align-items-center justify-content-between px-4 py-3"
                    style={{ background:'#f8fafc', borderBottom:'1px solid #e9ecef' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                        style={{ width:36, height:36, background:'#0ea5e9', fontSize:15 }}>
                        {currentQuestionIndex+1}
                      </span>
                      <span className="text-muted fw-semibold" style={{ fontSize:14 }}>/ {questions.length} câu</span>
                    </div>
                    <button type="button" onClick={() => handleToggleFlag(currentQuestionIndex)}
                      className={`btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 ${flagged[currentQuestionIndex]?'btn-warning':'btn-outline-secondary'}`}
                      data-testid={`flag-checkbox-${currentQuestion.id}`} style={{ fontSize:13, fontWeight:600 }}>
                      <span>{flagged[currentQuestionIndex]?'🔖':'🏳️'}</span>
                      <span className="d-none d-sm-inline">{flagged[currentQuestionIndex]?'Đã đánh dấu':'Đánh dấu xem lại'}</span>
                    </button>
                  </div>
                  <div className="p-4 p-md-5">
                    <QuestionRenderer question={currentQuestion} currentAnswer={answers[currentQuestionIndex]||''} onAnswer={handleAnswer} />
                  </div>
                  <div className="px-4 px-md-5 pb-4 d-flex justify-content-between gap-3">
                    <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                      onClick={() => setCurrentQuestionIndex(i=>Math.max(0,i-1))}
                      disabled={currentQuestionIndex===0} data-testid="prev-btn">← Câu trước</button>
                    <button className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm"
                      onClick={() => setCurrentQuestionIndex(i=>Math.min(questions.length-1,i+1))}
                      disabled={currentQuestionIndex===questions.length-1} data-testid="next-btn">Câu tiếp theo →</button>
                  </div>
                </div>
                <QuestionSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LAYOUT: LISTENING — Audio player top + Cloze template
  // ═══════════════════════════════════════════════════════════════════════
  if (skill === 'Listening') {
    const sections = [...new Set(questions.map(q=>q.section||'Section 1'))];
    return (
      <div style={{ background:'#f8fafc', minHeight:'100vh', display:'flex', flexDirection:'column' }} data-testid="session-page">
        <StickyHeader />

        {/* Audio player sticky below header */}
        {testInfo?.audioUrl && (
          <div className="sticky-top" style={{ zIndex:1020, top:57 }}>
            <AudioPlayer audioUrl={testInfo.audioUrl} />
          </div>
        )}

        <div className="flex-grow-1 py-4">
          <div className="container" style={{ maxWidth:900 }}>
            <div className="d-flex flex-column gap-4">
              {sections.map(section => {
                const sectionQs = questions.filter(q=>(q.section||'Section 1')===section);
                const firstQ = sectionQs[0];
                
                // Track embedded questions
                const templateQuestions = new Set();
                let templateElements = null;

                if (firstQ?.formContext) {
                  const parts = firstQ.formContext.split(/___(Q\d+)___/g);
                  templateElements = (
                    <div className="rounded-4 p-4 p-md-5 mb-4 shadow-sm" style={{ background:'#fff', border:'1px solid #fcd34d', fontSize:16, lineHeight:2.2, whiteSpace:'pre-wrap', color: '#1e293b' }}>
                      {parts.map((part, index) => {
                        const match = part.match(/^Q(\d+)$/);
                        if (match) {
                          const qNum = parseInt(match[1], 10);
                          const qIndex = qNum - 1; // absolute index in questions array
                          const q = questions[qIndex];
                          if (q) {
                            templateQuestions.add(q.id);
                            const isAnswered = !!answers[qIndex];
                            return (
                              <span key={index} className="d-inline-flex align-items-center gap-2 mx-1" style={{ verticalAlign: 'middle' }}>
                                <span className="badge" style={{ background: isAnswered ? '#22c55e' : '#f59e0b', color:'#fff', padding:'5px 8px', borderRadius: 4 }}>{qNum}</span>
                                <input
                                  type="text"
                                  className="form-control d-inline-block fw-semibold"
                                  style={{ 
                                    width: 160, 
                                    padding: '6px 12px', 
                                    fontSize: 15, 
                                    border: `2px solid ${isAnswered ? '#22c55e' : '#cbd5e1'}`,
                                    borderRadius: 8, 
                                    color: '#0f172a',
                                    background: isAnswered ? '#f0fdf4' : '#fff'
                                  }}
                                  value={answers[qIndex] || ''}
                                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                                  placeholder="Nhập trả lời..."
                                />
                              </span>
                            );
                          }
                        }
                        return <span key={index}>{part}</span>;
                      })}
                    </div>
                  );
                }

                const remainingQs = sectionQs.filter(q => !templateQuestions.has(q.id));

                return (
                  <div key={section} className="mb-2">
                    {/* Section header */}
                    <div className="rounded-4 px-4 py-3 mb-4 shadow-sm" style={{ background:'linear-gradient(135deg,#fef3c7,#fde68a)', border:'1px solid #f59e0b' }}>
                      <div className="fw-bold" style={{ color:'#92400e', fontSize:18 }}>{section}</div>
                      {firstQ?.sectionInstruction && (
                        <p className="mb-0 mt-1" style={{ fontSize:14, color:'#78350f', fontWeight: 500 }}>{firstQ.sectionInstruction}</p>
                      )}
                    </div>
                    
                    {/* Embedded template */}
                    {templateElements}

                    {/* Remaining Questions in this section */}
                    {remainingQs.map((question) => {
                      const qIndex = questions.indexOf(question);
                      const isAnswered = !!answers[qIndex];
                      return (
                        <div key={question.id} className="rounded-4 mb-4 overflow-hidden shadow-sm"
                          style={{ background:'#fff', border:`2px solid ${isAnswered?'#22c55e':'#e2e8f0'}` }}>
                          <div className="d-flex align-items-center gap-2 px-4 py-3"
                            style={{ background:isAnswered?'#dcfce7':'#f8fafc', borderBottom:`1px solid ${isAnswered?'#bbf7d0':'#e9ecef'}` }}>
                            <span className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0"
                              style={{ width:32, height:32, background:isAnswered?'#22c55e':'#94a3b8', fontSize:14 }}>
                              {qIndex+1}
                            </span>
                            <span className="fw-semibold text-muted" style={{ fontSize:14 }}>
                              {question.type==='fill-in-the-blank'?'Điền vào chỗ trống':question.type==='multiple-choice'?'Trắc nghiệm':'T/F/NG'}
                            </span>
                            {isAnswered && <span className="ms-auto text-success fw-bold" style={{fontSize:13}}>✓ Đã trả lời</span>}
                          </div>
                          <div className="p-4 p-md-5">
                            <QuestionRenderer question={question} currentAnswer={answers[qIndex]||''} onAnswer={handleAnswer} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {/* Submit Button since we removed the sidebar */}
              <div className="mt-4 pb-5 d-flex justify-content-end">
                <button
                  className="btn btn-lg fw-bold rounded-pill px-5 py-3 text-uppercase"
                  style={{ background: isSubmitting?'#94a3b8':'linear-gradient(135deg,#1b4332,#2d6a4f)', color:'#fff', border:'none', boxShadow:'0 4px 16px rgba(27,67,50,0.3)', letterSpacing:0.5 }}
                  onClick={() => window.confirm('Bạn có chắc chắn muốn nộp bài?') && handleSubmitAttempt()}
                  disabled={isSubmitting} data-testid="submit-btn"
                >
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"/>Đang nộp...</> : `Nộp bài (${answeredCount}/${questions.length})`}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LAYOUT: WRITING — split task list
  // ═══════════════════════════════════════════════════════════════════════
  if (skill === 'Writing') {
    return (
      <div style={{ background:'#f8fafc', minHeight:'100vh', display:'flex', flexDirection:'column' }} data-testid="session-page">
        <StickyHeader />
        <div className="flex-grow-1 py-4">
          <div className="container" style={{ maxWidth:1100 }}>
            <div className="row g-4">
              <div className="col-12 col-lg-8 d-flex flex-column gap-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="rounded-4 overflow-hidden shadow-sm"
                    style={{ background:'#fff', border:'1px solid #e2e8f0' }}>
                    <div className="px-5 py-4 d-flex align-items-center justify-content-between"
                      style={{ background:'linear-gradient(135deg,#f3e8ff,#ede9fe)', borderBottom:'2px solid #8b5cf6' }}>
                      <div className="fw-bold" style={{ color:'#6d28d9', fontSize:16 }}>✍️ Writing Task {question.taskNumber}</div>
                      <span className="badge px-3 py-2" style={{ background:'#8b5cf6', color:'#fff', borderRadius:20, fontSize:12 }}>
                        {question.taskNumber===1?'150+ words':'250+ words'}
                      </span>
                    </div>
                    {question.diagramDescription && (
                      <div className="mx-5 mt-4 p-3 rounded-3 text-center"
                        style={{ background:'#f0fdf4', border:'2px dashed #86efac' }}>
                        <div style={{ fontSize:40, marginBottom:8 }}>📊</div>
                        <p className="text-muted small mb-0 fst-italic">{question.diagramDescription}</p>
                      </div>
                    )}
                    <div className="p-5">
                      <QuestionRenderer question={question} currentAnswer={answers[index]||''} onAnswer={handleAnswer} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-12 col-lg-4">
                <div className="sticky-top" style={{ top:80 }}>
                  <div className="d-flex flex-column gap-3">
                    <button
                      className="btn btn-lg fw-bold rounded-4 py-3 text-uppercase shadow-sm"
                      style={{ background: isSubmitting?'#94a3b8':'linear-gradient(135deg,#1b4332,#2d6a4f)', color:'#fff', border:'none', letterSpacing:0.5 }}
                      onClick={() => window.confirm('Bạn có chắc chắn muốn nộp bài?') && handleSubmitAttempt()}
                      disabled={isSubmitting} data-testid="submit-btn"
                    >
                      {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"/>Đang nộp...</> : `Nộp bài (${answeredCount}/${questions.length})`}
                    </button>
                    <div className="rounded-4 p-4 shadow-sm" style={{ background:'#eff6ff', border:'1px solid #bfdbfe' }}>
                      <h6 className="fw-bold mb-3" style={{ color:'#1e40af' }}>📝 Tiêu chí chấm điểm</h6>
                      <ul className="text-muted small mb-0 ps-3 lh-lg">
                        <li>Task Achievement / Response</li>
                        <li>Coherence & Cohesion</li>
                        <li>Lexical Resource</li>
                        <li>Grammatical Range & Accuracy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LAYOUT: SPEAKING — card per part
  // ═══════════════════════════════════════════════════════════════════════
  if (skill === 'Speaking') {
    const PART_COLORS = {
      1: { color:'#0ea5e9', bg:'#e0f2fe', label:'Part 1 – Introduction & Interview', time:'4–5 phút' },
      2: { color:'#8b5cf6', bg:'#f3e8ff', label:'Part 2 – Individual Long Turn', time:'3–4 phút' },
      3: { color:'#f59e0b', bg:'#fef3c7', label:'Part 3 – Two-way Discussion', time:'4–5 phút' },
    };
    return (
      <div style={{ background:'#f8fafc', minHeight:'100vh', display:'flex', flexDirection:'column' }} data-testid="session-page">
        <StickyHeader />
        <div className="flex-grow-1 py-4">
          <div className="container" style={{ maxWidth:1000 }}>
            {/* Format info banner */}
            <div className="rounded-4 p-4 mb-4 d-flex align-items-center gap-4 flex-wrap shadow-sm"
              style={{ background:'linear-gradient(135deg,#ecfdf5,#d1fae5)', border:'1px solid #6ee7b7' }}>
              <span style={{ fontSize:48 }}>🎤</span>
              <div>
                <h5 className="fw-bold mb-1" style={{ color:'#065f46' }}>IELTS Speaking Test Format</h5>
                <p className="mb-0 text-muted small">
                  Bài thi gồm 3 phần. Mỗi phần có mục tiêu và thời lượng khác nhau. Trả lời tự nhiên, đầy đủ và lưu loát nhất có thể.
                </p>
              </div>
              <div className="d-flex gap-3 flex-wrap ms-auto">
                {[1,2,3].map(p => (
                  <div key={p} className="text-center px-3 py-2 rounded-3" style={{ background:'rgba(255,255,255,0.7)' }}>
                    <div className="fw-bold" style={{ color: PART_COLORS[p].color }}>Part {p}</div>
                    <div className="text-muted" style={{ fontSize:12 }}>{PART_COLORS[p].time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="row g-4">
              <div className="col-12 col-lg-8 d-flex flex-column gap-4">
                {questions.map((question, index) => {
                  const part = question.part || 1;
                  const pc = PART_COLORS[part] || PART_COLORS[1];
                  return (
                    <div key={question.id} className="rounded-4 overflow-hidden shadow-sm"
                      style={{ background:'#fff', border:`2px solid ${pc.color}30` }}>
                      <div className="p-5">
                        <QuestionRenderer question={question} currentAnswer={answers[index]||''} onAnswer={handleAnswer} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="col-12 col-lg-4">
                <div className="sticky-top" style={{ top:80 }}>
                  <div className="d-flex flex-column gap-3">
                    <button
                      className="btn btn-lg fw-bold rounded-4 py-3 text-uppercase shadow-sm"
                      style={{ background: isSubmitting?'#94a3b8':'linear-gradient(135deg,#1b4332,#2d6a4f)', color:'#fff', border:'none', letterSpacing:0.5 }}
                      onClick={() => window.confirm('Bạn có chắc chắn muốn nộp bài?') && handleSubmitAttempt()}
                      disabled={isSubmitting} data-testid="submit-btn"
                    >
                      {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"/>Đang nộp...</> : `Nộp bài (${answeredCount}/${questions.length})`}
                    </button>
                    <div className="rounded-4 p-4 shadow-sm" style={{ background:'#ecfdf5', border:'1px solid #6ee7b7' }}>
                      <h6 className="fw-bold mb-3" style={{ color:'#065f46' }}>📊 Tiêu chí chấm điểm</h6>
                      <ul className="text-muted small mb-0 ps-3 lh-lg">
                        <li>Fluency & Coherence</li>
                        <li>Lexical Resource</li>
                        <li>Grammatical Range & Accuracy</li>
                        <li>Pronunciation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (unknown skill)
  return <div className="container mt-5" data-testid="session-page"><p>Kỹ năng chưa được hỗ trợ: {skill}</p></div>;
}
