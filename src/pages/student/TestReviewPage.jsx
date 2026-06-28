import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../../services/api';
import { testService } from '../../services/testService';
import { convertBandScore } from '../../utils/quizUtils';
import {
  buildSpeakingQuestions,
  buildWritingQuestions,
  calculateObjectiveScore,
  getAnswerValue,
  isAutoGradedSkill,
  isCorrectAnswer,
  normalizeTest,
} from '../../utils/testModel';

const skillConfig = {
  Reading: { color: '#0ea5e9', bg: '#e0f2fe', icon: 'bi-book' },
  Listening: { color: '#f59e0b', bg: '#fef3c7', icon: 'bi-headphones' },
  Writing: { color: '#8b5cf6', bg: '#ede9fe', icon: 'bi-pencil-square' },
  Speaking: { color: '#10b981', bg: '#d1fae5', icon: 'bi-mic' },
};

const getSessionQuestions = (test, questionRecords) => {
  const normalized = normalizeTest(test);
  if (normalized.skill === 'Writing') return buildWritingQuestions(normalized);
  if (normalized.skill === 'Speaking' && questionRecords.length === 0) return buildSpeakingQuestions(normalized);
  return questionRecords.map((question, index) => ({
    ...question,
    skill: question.skill || normalized.skill,
    order: Number(question.order || index + 1),
  }));
};

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
}

function calcDuration(start, end) {
  if (!start || !end) return '-';
  const ms = new Date(end) - new Date(start);
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const seconds = Math.max(0, Math.floor((ms % 60000) / 1000));
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function ManualReviewCard({ question, index, studentAnswer }) {
  const isWriting = question.type === 'writing-task';
  const wordCount = studentAnswer ? String(studentAnswer).trim().split(/\s+/).length : 0;

  return (
    <div data-testid={`review-question-${question.id}`} className="rounded-4 overflow-hidden shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
      <div className="px-4 py-3 fw-bold" style={{ background: isWriting ? '#faf5ff' : '#ecfdf5', color: isWriting ? '#6d28d9' : '#065f46' }}>
        {isWriting ? `Writing Task ${question.taskNumber || index + 1}` : `Speaking Part ${question.part || index + 1}`}
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="text-muted small text-uppercase fw-bold mb-2">Prompt</div>
          <div className="lh-lg" style={{ whiteSpace: 'pre-wrap' }}>{question.prompt || question.questionText}</div>
          {question.imageUrl && <img src={question.imageUrl} alt="Writing prompt" className="img-fluid rounded-3 border mt-3" />}
          {question.subPoints?.length > 0 && (
            <ul className="mt-3 mb-0">
              {question.subPoints.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
            </ul>
          )}
        </div>

        <div className="rounded-3 p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
            <span className="text-muted small text-uppercase fw-bold">Student answer</span>
            {isWriting && <span className="small fw-bold text-muted">{wordCount} words</span>}
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {studentAnswer || <em className="text-muted">Chưa có câu trả lời.</em>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectiveReviewCard({ question, index, studentAnswer }) {
  const correct = isCorrectAnswer(question, studentAnswer);
  const empty = !studentAnswer && studentAnswer !== 0;
  const options = question.options || [];

  return (
    <div
      data-testid={`review-question-${question.id}`}
      className="rounded-4 overflow-hidden shadow-sm"
      style={{ background: '#fff', border: `2px solid ${correct ? '#10b981' : empty ? '#cbd5e1' : '#ef4444'}` }}
    >
      <div
        className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{ background: correct ? '#d1fae5' : empty ? '#f8fafc' : '#fee2e2' }}
      >
        <span className="fw-bold">Question {index + 1}</span>
        <span className={`fw-bold ${correct ? 'text-success' : empty ? 'text-muted' : 'text-danger'}`}>
          {empty ? 'Skipped' : correct ? 'Correct' : 'Incorrect'}
        </span>
      </div>

      <div className="p-4">
        <p className="fw-semibold text-dark lh-base mb-3">{question.prompt || question.questionText}</p>

        {question.type === 'fill-in-the-blank' ? (
          <div className="d-flex flex-column gap-2">
            <div className="rounded-3 p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span className="text-muted small">Your answer: </span>
              <span className="fw-bold">{studentAnswer || 'No answer'}</span>
            </div>
            <div className="rounded-3 p-3" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
              <span className="text-muted small">Correct answer: </span>
              <span className="fw-bold text-success">{question.answer}</span>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {options.map((option, optionIndex) => {
              const value = typeof option === 'object' ? option.value : option;
              const label = typeof option === 'object' ? option.label : option;
              const isUserChoice = String(studentAnswer) === String(value);
              const isRightChoice = String(question.answer || '').trim().toLowerCase() === String(value).trim().toLowerCase();

              let bg = '#f8fafc';
              let border = '#e2e8f0';
              let color = '#475569';
              if (isRightChoice) {
                bg = '#d1fae5';
                border = '#10b981';
                color = '#065f46';
              } else if (isUserChoice) {
                bg = '#fee2e2';
                border = '#ef4444';
                color = '#7f1d1d';
              }

              return (
                <div key={optionIndex} className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: bg, border: `2px solid ${border}` }}>
                  <span className="fw-bold" style={{ color }}>{String.fromCharCode(65 + optionIndex)}.</span>
                  <span style={{ color, flex: 1 }}>{label}</span>
                  {isRightChoice && <span className="fw-bold text-success">Correct</span>}
                  {isUserChoice && !isRightChoice && <span className="fw-bold text-danger">Your choice</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestReviewPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const isFreeRoute = location.pathname.startsWith('/free-tests');

  const [attempt, setAttempt] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const attemptRes = await api.get(`/testAttempts/${attemptId}`);
        const attemptData = attemptRes.data;
        const testData = await testService.getTestById(attemptData.testId);
        const questionRecords = await testService.getQuestionsForTest(testData.id);
        const sessionQuestions = getSessionQuestions(testData, questionRecords);

        if (!ignore) {
          setAttempt(attemptData);
          setTestDetail(testData);
          setQuestions(sessionQuestions);
        }
      } catch (err) {
        if (!ignore) setError('Không thể tải kết quả bài làm.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [attemptId]);

  const normalizedTest = useMemo(() => (testDetail ? normalizeTest(testDetail) : null), [testDetail]);
  const autoGraded = normalizedTest ? isAutoGradedSkill(normalizedTest.skill) : false;
  const scoreData = useMemo(() => {
    if (!autoGraded) return { correct: 0, total: questions.length, band: 0 };
    const score = calculateObjectiveScore(questions, attempt?.answers || {});
    return { ...score, band: convertBandScore(score.correct, score.total) };
  }, [attempt, autoGraded, questions]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }} data-testid="review-loading">
        <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem', color: '#1b4332' }} role="status" />
        <p className="text-muted fw-semibold">Đang tải kết quả...</p>
      </div>
    );
  }

  if (error || !attempt || !normalizedTest) {
    return (
      <div className="container mt-5" data-testid="review-error">
        <div className="alert alert-danger rounded-4 p-4 text-center">
          {error || 'Không tìm thấy kết quả bài làm.'}
          <br />
          <Link to={isFreeRoute ? '/courses' : '/learning/tests'} className="btn btn-outline-danger mt-3 rounded-pill">Quay lại</Link>
        </div>
      </div>
    );
  }

  const sk = skillConfig[normalizedTest.skill] || skillConfig.Reading;
  const listPath = isFreeRoute ? '/courses' : '/learning/tests';
  const retakePath = isFreeRoute ? `/free-tests/${normalizedTest.id}` : `/learning/tests/${normalizedTest.id}`;
  const percentage = scoreData.total ? Math.round((scoreData.correct / scoreData.total) * 100) : 0;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }} data-testid="review-page">
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
        <div className="container py-4">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb mb-0" style={{ fontSize: 13 }}>
              <li className="breadcrumb-item">
                <Link to={listPath} className="text-decoration-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {isFreeRoute ? 'Tài nguyên miễn phí' : 'Danh sách bài test'}
                </Link>
              </li>
              <li className="breadcrumb-item active" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Kết quả
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-center gap-3 mb-2">
            <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 48, height: 48, background: sk.bg, color: sk.color }}>
              <i className={`bi ${sk.icon}`} />
            </span>
            <div>
              <h1 className="fw-bold text-white mb-0" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)' }}>{normalizedTest.title}</h1>
              <span className="badge mt-1 px-3 py-1" style={{ background: sk.bg, color: sk.color, borderRadius: 20 }}>{normalizedTest.skill}</span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-4 mt-3 pb-4" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            <span><strong className="text-white">Bắt đầu:</strong> {formatDate(attempt.startTime)}</span>
            <span><strong className="text-white">Hoàn thành:</strong> {formatDate(attempt.completedAt || attempt.submittedAt)}</span>
            <span><strong className="text-white">Thời gian:</strong> {calcDuration(attempt.startTime, attempt.completedAt || attempt.submittedAt)}</span>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {autoGraded ? (
          <div className="row g-3 mb-5">
            <div className="col-6 col-md-3">
              <div className="rounded-4 p-4 text-center h-100 bg-white shadow-sm">
                <div className="fw-black" style={{ fontSize: 40, fontWeight: 900, color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}>{percentage}%</div>
                <div className="text-muted small text-uppercase fw-bold">Tỷ lệ đúng</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="rounded-4 p-4 text-center h-100 shadow-sm" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: '#065f46' }}>{scoreData.correct}</div>
                <div className="text-success small text-uppercase fw-bold">Câu đúng</div>
                <div className="text-muted small">/ {scoreData.total} câu</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="rounded-4 p-4 text-center h-100 bg-white shadow-sm">
                <div style={{ fontSize: 40, fontWeight: 900, color: sk.color }}>{scoreData.band.toFixed(1)}</div>
                <div className="text-muted small text-uppercase fw-bold">Band Score</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="rounded-4 p-4 text-center h-100 shadow-sm" style={{ background: sk.bg, border: `1px solid ${sk.color}40` }}>
                <i className={`bi ${sk.icon}`} style={{ fontSize: 36, color: sk.color }} />
                <div className="fw-bold mt-2" style={{ color: sk.color }}>Completed</div>
                <div className="text-muted small">{normalizedTest.skill}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-3 mb-5">
            <div className="col-12 col-md-4">
              <div className="rounded-4 p-4 text-center h-100 bg-white shadow-sm" style={{ border: '1px solid #f59e0b' }}>
                <i className="bi bi-hourglass-split" style={{ fontSize: 36, color: '#d97706' }} />
                <div className="fw-bold mt-2" style={{ color: '#d97706' }}>Chờ giáo viên chấm</div>
                <div className="text-muted small">Writing/Speaking cần feedback thủ công</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="rounded-4 p-4 text-center h-100 bg-white shadow-sm">
                <div style={{ fontSize: 40, fontWeight: 900 }}>4</div>
                <div className="text-muted small text-uppercase fw-bold">Tiêu chí IELTS</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="rounded-4 p-4 text-center h-100 shadow-sm" style={{ background: sk.bg, border: `1px solid ${sk.color}40` }}>
                <i className={`bi ${sk.icon}`} style={{ fontSize: 36, color: sk.color }} />
                <div className="fw-bold mt-2" style={{ color: sk.color }}>Submitted</div>
                <div className="text-muted small">{normalizedTest.skill}</div>
              </div>
            </div>
          </div>
        )}

        <h4 className="fw-bold text-dark mb-4">Chi tiết bài làm</h4>
        <div className="d-flex flex-column gap-4">
          {questions.map((question, index) => {
            const studentAnswer = getAnswerValue(attempt.answers || {}, question, index);
            return autoGraded ? (
              <ObjectiveReviewCard key={question.id} question={question} index={index} studentAnswer={studentAnswer} />
            ) : (
              <ManualReviewCard key={question.id} question={question} index={index} studentAnswer={studentAnswer} />
            );
          })}
        </div>

        <div className="d-flex justify-content-center gap-3 mt-5 pb-5 flex-wrap">
          <Link to={listPath} className="btn fw-bold px-5 py-3 rounded-pill" style={{ background: '#1b4332', color: '#fff' }}>
            Quay lại danh sách
          </Link>
          <Link to={retakePath} className="btn fw-bold px-5 py-3 rounded-pill" style={{ background: '#fff', color: '#1b4332', border: '2px solid #1b4332' }}>
            Làm lại
          </Link>
        </div>
      </div>
    </div>
  );
}
