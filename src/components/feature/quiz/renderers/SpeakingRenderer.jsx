import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * SpeakingRenderer — Renders IELTS Speaking Part prompts
 * Mock UI: shows topic card + cue card + mock recording button (no real audio recording)
 */
const SpeakingRenderer = ({ question, currentAnswer, onAnswer, isReviewMode = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNote, setRecordedNote] = useState(currentAnswer || '');
  const timerRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  const part = question.part || 1;

  const partConfig = {
    1: { label: 'Part 1 – Introduction & Interview', color: '#0ea5e9', bg: '#e0f2fe', tip: 'Answer in 2–3 sentences. Be natural and conversational.' },
    2: { label: 'Part 2 – Individual Long Turn', color: '#8b5cf6', bg: '#f3e8ff', tip: `You have 1 minute to prepare, then speak for 1–2 minutes about the topic.` },
    3: { label: 'Part 3 – Two-way Discussion', color: '#f59e0b', bg: '#fef3c7', tip: 'Discuss ideas in depth. Give reasons and examples.' },
  };
  const cfg = partConfig[part] || partConfig[1];

  const handleStartRecording = () => {
    if (isReviewMode) return;
    setIsRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
  };

  const handleStopRecording = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    const note = `[Đã ghi âm – ${elapsed}s]`;
    setRecordedNote(note);
    if (onAnswer) onAnswer(question.id, note);
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="speaking-renderer" data-testid={`speaking-question-${question.id}`}>
      {/* Part badge */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <span className="badge px-3 py-2 fw-bold" style={{ background: cfg.color, color: '#fff', borderRadius: 20, fontSize: 13 }}>
          {cfg.label}
        </span>
      </div>

      {/* Tip */}
      <div className="p-3 rounded-3 mb-4" style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, fontSize: 14, color: cfg.color }}>
        💡 <strong>Tip:</strong> {cfg.tip}
      </div>

      {/* Part 2 cue card style */}
      {part === 2 ? (
        <div className="p-4 rounded-4 mb-4"
          style={{ background: '#fff', border: '2px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="fw-bold text-dark mb-3" style={{ fontSize: 16 }}>
            🃏 CUE CARD — Describe:
          </div>
          <p className="fw-semibold lh-lg text-dark" style={{ fontSize: 15 }}>
            {question.prompt || question.questionText}
          </p>
          {question.subPoints && (
            <ul className="text-secondary mt-3" style={{ fontSize: 14 }}>
              {question.subPoints.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
          )}
          <p className="text-muted small mt-3 mb-0">
            You should say <strong>why</strong> this is important to you.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-3 mb-4"
          style={{ background: '#f8fafc', border: '2px solid #e2e8f0' }}>
          <p className="fw-semibold text-dark lh-lg mb-0" style={{ fontSize: 15 }}>
            {question.prompt || question.questionText}
          </p>
          {question.subPoints && (
            <ul className="text-secondary mt-3 mb-0" style={{ fontSize: 14 }}>
              {question.subPoints.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Mock recording UI */}
      {!isReviewMode ? (
        <div className="rounded-4 p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                className="btn fw-bold px-4 py-2 d-flex align-items-center gap-2"
                style={{ background: '#ef4444', color: '#fff', borderRadius: 24, border:'none', fontSize:14 }}
                data-testid="speaking-record-btn"
              >
                <span style={{ width:10, height:10, borderRadius:'50%', background:'#fff', display:'inline-block' }} />
                Bắt đầu ghi âm (Mock)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="btn fw-bold px-4 py-2 d-flex align-items-center gap-2"
                style={{ background: '#1e293b', color: '#fff', borderRadius: 24, border:'none', fontSize:14 }}
                data-testid="speaking-stop-btn"
              >
                <span style={{ width:10, height:10, borderRadius:3, background:'#fff', display:'inline-block' }} />
                Dừng ghi âm — {formatTime(elapsed)}
              </button>
            )}
            {isRecording && (
              <span style={{ fontSize:13, color:'#ef4444', fontWeight:700 }}>
                🔴 Đang ghi âm... {formatTime(elapsed)}
              </span>
            )}
          </div>
          {recordedNote && (
            <div className="mt-3 p-3 rounded-3 d-flex align-items-center gap-2"
              style={{ background:'#d1fae5', border:'1px solid #10b981' }}>
              <span>✓</span>
              <span style={{ fontSize:13, color:'#065f46' }}>{recordedNote}</span>
            </div>
          )}
          <p className="text-muted small mt-3 mb-0">
            * Đây là demo — ghi âm thực không được lưu trữ trong phiên bản này.
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-3" style={{ background:'#f8fafc', border:'1px solid #e2e8f0' }}>
          <span className="text-muted small">Trả lời đã ghi: </span>
          <span className="fw-semibold" style={{ fontSize:14 }}>{currentAnswer || <em>Không có ghi âm</em>}</span>
        </div>
      )}
    </div>
  );
};

SpeakingRenderer.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    prompt: PropTypes.string,
    questionText: PropTypes.string,
    part: PropTypes.number,
    subPoints: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  currentAnswer: PropTypes.any,
  onAnswer: PropTypes.func,
  isReviewMode: PropTypes.bool,
};

export default SpeakingRenderer;
