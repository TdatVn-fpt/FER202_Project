import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ProgressBar from '../../components/feature/quiz/ProgressBar';
import CountdownTimer from '../../components/feature/quiz/CountdownTimer';
import QuestionRenderer from '../../components/feature/quiz/QuestionRenderer';
import api from '../../services/api';
import { testService } from '../../services/testService';
import { testAttemptService } from '../../services/testAttemptService';
import { convertBandScore } from '../../utils/quizUtils';
import {
  buildSpeakingQuestions,
  buildConfigQuestions,
  buildWritingQuestions,
  calculateObjectiveScore,
  countAnswered,
  getAnswerValue,
  getPassageForQuestion,
  getSectionForQuestion,
  isAutoGradedSkill,
  normalizeTest,
  setAnswerValue,
} from '../../utils/testModel';

const skillColor = {
  Reading: '#0ea5e9',
  Listening: '#f59e0b',
  Writing: '#8b5cf6',
  Speaking: '#10b981',
};

const getSessionQuestions = (test, questionRecords) => {
  const normalized = normalizeTest(test);

  if (normalized.skill === 'Writing') {
    return buildWritingQuestions(normalized);
  }

  if (normalized.skill === 'Speaking' && questionRecords.length === 0) {
    return buildSpeakingQuestions(normalized);
  }

  if (['Reading', 'Listening'].includes(normalized.skill)) {
    const embeddedQuestions = buildConfigQuestions(normalized);
    const bankQuestions = questionRecords.map((question, index) => ({
      ...question,
      skill: question.skill || normalized.skill,
      order: Number(question.order || embeddedQuestions.length + index + 1),
    }));
    return [...embeddedQuestions, ...bankQuestions];
  }

  return questionRecords.map((question, index) => ({
    ...question,
    skill: question.skill || normalized.skill,
    order: Number(question.order || index + 1),
  }));
};

function QuestionMapItem({ number, isCurrent, isAnswered, isFlagged, onClick }) {
  let bg = '#fff';
  let color = '#334155';
  let border = '2px solid #cbd5e1';

  if (isCurrent) {
    bg = '#1b4332';
    color = '#fff';
    border = '2px solid #1b4332';
  } else if (isFlagged) {
    bg = '#fef3c7';
    color = '#92400e';
    border = '2px solid #f59e0b';
  } else if (isAnswered) {
    bg = '#dcfce7';
    color = '#166534';
    border = '2px solid #22c55e';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="d-flex align-items-center justify-content-center fw-bold"
      style={{
        width: 34,
        height: 34,
        border,
        background: bg,
        color,
        borderRadius: 8,
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {number}
    </button>
  );
}

function AudioPlayer({ audioUrl, audioPolicy = 'allow-replay' }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedOnce, setPlayedOnce] = useState(false);
  const playOnce = audioPolicy === 'play-once';
  const disabled = playOnce && playedOnce;

  const toggle = async () => {
    if (!audioRef.current || disabled) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    await audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div
      className="d-flex align-items-center gap-3 px-4 py-3 shadow-sm"
      style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa' }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => {
          setIsPlaying(false);
          setPlayedOnce(true);
        }}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="btn fw-bold d-flex align-items-center justify-content-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: disabled ? '#cbd5e1' : '#f59e0b',
          color: '#fff',
          border: 0,
        }}
      >
        <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`} />
      </button>
      <div>
        <div className="fw-bold" style={{ color: '#92400e' }}>Listening audio</div>
        <div className="small text-muted">
          {playOnce ? 'Audio policy: play once' : 'Audio policy: replay allowed'}
        </div>
      </div>
    </div>
  );
}

function WritingAnswerPanel({ question, answer, onAnswer }) {
  const words = String(answer || '').trim() ? String(answer || '').trim().split(/\s+/).length : 0;
  const minWords = Number(question.minWords || (question.taskNumber === 1 ? 150 : 250));
  const imageUrl = question.imageUrl;

  return (
    <div
      className="d-flex flex-column flex-lg-row rounded-4 overflow-hidden shadow-sm"
      style={{ background: '#fff', border: '1px solid #e2e8f0' }}
    >
      <div
        className="p-4"
        style={{
          flex: '0 0 44%',
          minWidth: 280,
          maxWidth: 680,
          resize: 'horizontal',
          overflow: 'auto',
          background: '#faf5ff',
          borderRight: '1px solid #e9d5ff',
        }}
      >
        <div className="badge mb-3 px-3 py-2" style={{ background: '#8b5cf6' }}>
          Writing Task {question.taskNumber}
        </div>
        <p className="fw-semibold lh-lg mb-3" style={{ whiteSpace: 'pre-wrap' }}>
          {question.prompt || question.questionText}
        </p>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Writing Task ${question.taskNumber}`}
            className="img-fluid rounded-3 border"
          />
        )}
      </div>

      <div className="p-4 flex-grow-1">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
          <span className="fw-bold text-dark">Your answer</span>
          <span className={`fw-bold small ${words >= minWords ? 'text-success' : 'text-muted'}`}>
            {words}/{minWords}+ words
          </span>
        </div>
        <textarea
          className="form-control"
          rows={16}
          value={answer || ''}
          onChange={(event) => onAnswer(question.id, event.target.value)}
          placeholder="Write your answer here..."
          style={{ borderRadius: 12, lineHeight: 1.8, resize: 'vertical' }}
        />
      </div>
    </div>
  );
}

export default function TestSessionPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFreeRoute = location.pathname.startsWith('/free-tests');
  const reviewPath = isFreeRoute ? `/free-tests/review/${attemptId}` : `/learning/tests/review/${attemptId}`;

  const [attempt, setAttempt] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [expireAt, setExpireAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const attemptRes = await api.get(`/testAttempts/${attemptId}`);
        const attemptData = attemptRes.data;
        if (attemptData.status === 'completed') {
          navigate(reviewPath, { replace: true });
          return;
        }

        const testData = await testService.getTestById(attemptData.testId);
        const questionRecords = await testService.getQuestionsForTest(testData.id);
        const sessionQuestions = getSessionQuestions(testData, questionRecords);
        const expiresAt = attemptData.expiredAt
          ? new Date(attemptData.expiredAt).getTime()
          : new Date(attemptData.startTime).getTime() + Number(testData.durationMinutes || 60) * 60 * 1000;

        if (!ignore) {
          setAttempt(attemptData);
          setTestInfo(testData);
          setQuestions(sessionQuestions);
          setAnswers(attemptData.answers || {});
          setExpireAt(expiresAt);
        }
      } catch (err) {
        if (!ignore) setError('Không thể tải dữ liệu bài test.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [attemptId, navigate, reviewPath]);

  const normalizedTest = useMemo(() => (testInfo ? normalizeTest(testInfo) : null), [testInfo]);
  const skill = normalizedTest?.skill || 'Reading';
  const answeredCount = useMemo(() => countAnswered(answers, questions), [answers, questions]);
  const progressPercent = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const activeColor = skillColor[skill] || '#0ea5e9';

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => {
      const question = questions.find((item) => String(item.id) === String(questionId));
      if (!question) return prev;
      return setAnswerValue(prev, question, value);
    });
  }, [questions]);

  const handleToggleFlag = (index) => {
    setFlagged((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmitAttempt = useCallback(async () => {
    if (isSubmitting || !normalizedTest) return;
    setIsSubmitting(true);

    try {
      const submittedAt = new Date().toISOString();
      let scorePayload = { submittedAt };

      if (isAutoGradedSkill(normalizedTest.skill)) {
        const objectiveScore = calculateObjectiveScore(questions, answers);
        const band = convertBandScore(objectiveScore.correct, objectiveScore.total);
        scorePayload = {
          ...scorePayload,
          correctCount: objectiveScore.correct,
          totalScore: objectiveScore.total,
          score: band,
          overallBandScore: band,
        };
      } else {
        scorePayload = {
          ...scorePayload,
          gradingStatus: 'pending',
        };
      }

      await testAttemptService.completeAttempt(attemptId, answers, scorePayload);
      navigate(reviewPath);
    } catch (err) {
      setIsSubmitting(false);
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    }
  }, [answers, attemptId, isSubmitting, navigate, normalizedTest, questions, reviewPath]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100" data-testid="session-loading">
        <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem', color: '#1b4332' }} role="status" />
        <p className="text-muted fw-semibold">Đang chuẩn bị bài test...</p>
      </div>
    );
  }

  if (error || !attempt || !normalizedTest || questions.length === 0) {
    return (
      <div className="container mt-5" data-testid="session-error">
        <div className="alert alert-danger rounded-4 p-4 text-center shadow-sm">
          <h5 className="fw-bold">Không thể tải bài test</h5>
          <p className="mb-0">{error || 'Bài test này chưa có nội dung hợp lệ.'}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[Math.min(currentQuestionIndex, questions.length - 1)];

  const StickyHeader = () => (
    <div className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1030 }}>
      <div className="container-fluid px-4" style={{ maxWidth: 1400 }}>
        <div className="d-flex align-items-center justify-content-between py-2 gap-3">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <span className="badge px-3 py-2 fw-bold" style={{ background: activeColor, fontSize: 13, borderRadius: 20 }}>
              {skill}
            </span>
            <span className="text-muted small fw-semibold text-truncate d-none d-md-inline" style={{ maxWidth: 300 }}>
              {normalizedTest.title}
            </span>
          </div>
          <div className="flex-grow-1 d-none d-lg-flex align-items-center gap-2" style={{ maxWidth: 320 }}>
            <span className="text-muted small">{answeredCount}/{questions.length}</span>
            <div className="flex-grow-1"><ProgressBar percent={progressPercent} /></div>
          </div>
          {expireAt && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-bold"
              style={{ background: '#fff5f5', border: '2px solid #fecaca', color: '#dc2626', whiteSpace: 'nowrap' }}
            >
              <i className="bi bi-clock" />
              <CountdownTimer expireAt={expireAt} onExpire={handleSubmitAttempt} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SubmitButton = ({ block = false }) => (
    <button
      className={`btn btn-lg fw-bold py-3 text-uppercase ${block ? 'w-100 rounded-4' : 'rounded-pill px-5'}`}
      style={{ background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#1b4332,#2d6a4f)', color: '#fff', border: 'none' }}
      onClick={() => window.confirm('Bạn có chắc chắn muốn nộp bài?') && handleSubmitAttempt()}
      disabled={isSubmitting}
      data-testid="submit-btn"
    >
      {isSubmitting ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Đang nộp...
        </>
      ) : (
        `Nộp bài (${answeredCount}/${questions.length})`
      )}
    </button>
  );

  const QuestionSidebar = () => (
    <div className="d-flex flex-column gap-3">
      <div className="rounded-4 p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold mb-0 text-dark">Bản đồ câu hỏi</h6>
          <span className="text-muted small"><strong className="text-success">{answeredCount}</strong>/{questions.length}</span>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {questions.map((question, index) => (
            <QuestionMapItem
              key={question.id}
              number={index + 1}
              isCurrent={currentQuestionIndex === index}
              isAnswered={Boolean(getAnswerValue(answers, question, index))}
              isFlagged={Boolean(flagged[index])}
              onClick={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </div>
      </div>
      <SubmitButton block />
    </div>
  );

  if (skill === 'Reading') {
    const passage = getPassageForQuestion(normalizedTest, currentQuestion);
    const passageMeta = (normalizedTest.testConfig?.passages || []).find((item) => item.id === currentQuestion.referenceId);

    return (
      <div style={{ background: '#f4f6f9', minHeight: '100vh' }} data-testid="session-page">
        <StickyHeader />
        <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1400 }}>
          <div className="row g-3">
            <div className="col-12 col-lg-5">
              <div className="rounded-4 overflow-hidden shadow-sm" style={{ position: 'sticky', top: 76, maxHeight: 'calc(100vh - 100px)', background: '#fff', border: '1px solid #e2e8f0' }}>
                <div className="px-4 py-3 fw-bold" style={{ background: '#e0f2fe', color: '#0369a1', borderBottom: '2px solid #0ea5e9' }}>
                  {passageMeta?.title || 'Reading Passage'}
                </div>
                <div className="px-4 py-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 160px)', lineHeight: 1.9, fontSize: 15, color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {passageMeta?.imageUrl && <img src={passageMeta.imageUrl} alt={passageMeta.title} className="img-fluid rounded-3 border mb-3" />}
                  {passage || <span className="text-muted">Chưa có nội dung passage.</span>}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-7 d-flex flex-column gap-3">
              <div className="rounded-4 overflow-hidden shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ background: '#f8fafc', borderBottom: '1px solid #e9ecef' }}>
                  <div className="fw-bold">Question {currentQuestionIndex + 1}/{questions.length}</div>
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(currentQuestionIndex)}
                    className={`btn btn-sm rounded-pill px-3 ${flagged[currentQuestionIndex] ? 'btn-warning' : 'btn-outline-secondary'}`}
                  >
                    <i className={`bi ${flagged[currentQuestionIndex] ? 'bi-bookmark-fill' : 'bi-bookmark'} me-1`} />
                    Review
                  </button>
                </div>
                <div className="p-4 p-md-5">
                  <QuestionRenderer
                    question={currentQuestion}
                    currentAnswer={getAnswerValue(answers, currentQuestion, currentQuestionIndex)}
                    onAnswer={handleAnswer}
                  />
                </div>
                <div className="px-4 px-md-5 pb-4 d-flex justify-content-between gap-3">
                  <button
                    className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                    onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
                    onClick={() => setCurrentQuestionIndex((index) => Math.min(questions.length - 1, index + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
              <QuestionSidebar />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (skill === 'Listening') {
    const configSections = normalizedTest.testConfig?.sections || [];
    const grouped = configSections.length
      ? configSections.map((section) => ({
        section,
        questions: questions.filter((question) => question.referenceId === section.id || question.section === section.title),
      })).filter((item) => item.questions.length > 0)
      : Array.from(new Set(questions.map((question) => question.section || question.referenceId || 'Section 1'))).map((name) => ({
        section: { id: name, title: name, instruction: '' },
        questions: questions.filter((question) => (question.section || question.referenceId || 'Section 1') === name),
      }));
    const audioPolicy = normalizedTest.testConfig?.audioPolicy || 'allow-replay';
    const globalAudioUrl = normalizedTest.testConfig?.audioUrl || normalizedTest.audioUrl;

    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh' }} data-testid="session-page">
        <StickyHeader />
        {globalAudioUrl ? (
          <div className="sticky-top" style={{ zIndex: 1020, top: 57 }}>
            <AudioPlayer audioUrl={globalAudioUrl} audioPolicy={audioPolicy} />
          </div>
        ) : (
          <div className="alert alert-warning rounded-0 mb-0 text-center">Listening audio chưa được cấu hình.</div>
        )}
        <div className="container py-4" style={{ maxWidth: 980 }}>
          <div className="d-flex flex-column gap-4">
            {grouped.map(({ section, questions: sectionQuestions }) => (
              <section key={section.id || section.title}>
                <div className="rounded-4 px-4 py-3 mb-3 shadow-sm" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <div className="fw-bold" style={{ color: '#92400e', fontSize: 18 }}>{section.title || 'Listening Section'}</div>
                  {section.instruction && <p className="mb-0 mt-1 text-muted small">{section.instruction}</p>}
                </div>
                {section.audioUrl && <AudioPlayer audioUrl={section.audioUrl} audioPolicy={audioPolicy} />}
                {sectionQuestions.map((question) => {
                  const index = questions.findIndex((item) => item.id === question.id);
                  const answer = getAnswerValue(answers, question, index);
                  const sectionMeta = getSectionForQuestion(normalizedTest, question);
                  return (
                    <div key={question.id} className="rounded-4 mb-3 overflow-hidden shadow-sm" style={{ background: '#fff', border: `2px solid ${answer ? '#22c55e' : '#e2e8f0'}` }}>
                      <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ background: answer ? '#dcfce7' : '#f8fafc' }}>
                        <span className="fw-bold">Question {index + 1}</span>
                        {sectionMeta?.title && <span className="small text-muted">{sectionMeta.title}</span>}
                      </div>
                      <div className="p-4">
                        <QuestionRenderer question={question} currentAnswer={answer} onAnswer={handleAnswer} />
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
            <div className="d-flex justify-content-end pb-5">
              <SubmitButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (skill === 'Writing') {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh' }} data-testid="session-page">
        <StickyHeader />
        <div className="container py-4" style={{ maxWidth: 1260 }}>
          <div className="row g-4">
            <div className="col-12 col-xl-9 d-flex flex-column gap-4">
              {questions.map((question, index) => (
                <WritingAnswerPanel
                  key={question.id}
                  question={question}
                  answer={getAnswerValue(answers, question, index)}
                  onAnswer={handleAnswer}
                />
              ))}
            </div>
            <div className="col-12 col-xl-3">
              <div className="sticky-top d-flex flex-column gap-3" style={{ top: 80 }}>
                <QuestionSidebar />
                <div className="rounded-4 p-4 shadow-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <h6 className="fw-bold mb-3" style={{ color: '#1e40af' }}>Writing criteria</h6>
                  <ul className="text-muted small mb-0 ps-3 lh-lg">
                    <li>Task Achievement / Response</li>
                    <li>Coherence & Cohesion</li>
                    <li>Lexical Resource</li>
                    <li>Grammar Range & Accuracy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (skill === 'Speaking') {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh' }} data-testid="session-page">
        <StickyHeader />
        <div className="container py-4" style={{ maxWidth: 1100 }}>
          <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
            <h5 className="fw-bold mb-1" style={{ color: '#065f46' }}>IELTS Speaking format</h5>
            <p className="mb-0 text-muted small">
              Part 1: short interview. Part 2: cue card. Part 3: discussion and ideas.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-12 col-lg-8 d-flex flex-column gap-4">
              {questions.map((question, index) => (
                <div key={question.id} className="rounded-4 overflow-hidden shadow-sm" style={{ background: '#fff', border: '1px solid #d1fae5' }}>
                  <div className="px-4 py-3 fw-bold" style={{ background: '#ecfdf5', color: '#065f46' }}>
                    Part {question.part || index + 1}
                    {question.answerSeconds ? ` - suggested answer ${question.answerSeconds}s` : ''}
                  </div>
                  <div className="p-4">
                    <QuestionRenderer
                      question={question}
                      currentAnswer={getAnswerValue(answers, question, index)}
                      onAnswer={handleAnswer}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="col-12 col-lg-4">
              <div className="sticky-top d-flex flex-column gap-3" style={{ top: 80 }}>
                <QuestionSidebar />
                <div className="rounded-4 p-4 shadow-sm" style={{ background: '#fff', border: '1px solid #d1fae5' }}>
                  <h6 className="fw-bold mb-3" style={{ color: '#065f46' }}>Speaking criteria</h6>
                  <ul className="text-muted small mb-0 ps-3 lh-lg">
                    <li>Fluency & Coherence</li>
                    <li>Lexical Resource</li>
                    <li>Grammar Range & Accuracy</li>
                    <li>Pronunciation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" data-testid="session-page">
      <p>Kỹ năng chưa được hỗ trợ: {skill}</p>
    </div>
  );
}
