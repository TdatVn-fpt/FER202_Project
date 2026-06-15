import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * FillBlankRenderer Component
 * Renders Fill in the Blank question types with a premium styled text input.
 */
const FillBlankRenderer = ({ question, currentAnswer, onAnswer, isReviewMode = false }) => {
  // EARS[State-driven]: THE local state SHALL sync with the external currentAnswer prop.
  const [localValue, setLocalValue] = useState(currentAnswer || '');

  useEffect(() => {
    setLocalValue(currentAnswer || '');
  }, [currentAnswer]);

  // EARS[Unwanted]: IF question data is invalid, THE system SHALL render an error message.
  if (!question || !question.id) {
    return (
      <div className="text-danger fst-italic" data-testid="fillblank-fallback">
        Dữ liệu câu hỏi bị lỗi.
      </div>
    );
  }

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    // EARS[Event]: WHEN user blurs the input field, THE system SHALL trigger onAnswer.
    if (onAnswer && !isReviewMode) {
      if (localValue !== currentAnswer) {
        onAnswer(question.id, localValue.trim());
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className="fillblank-renderer" data-testid={`fillblank-question-${question.id}`}>
      <div className="mb-4">
        <p className="fs-5 fw-semibold text-dark lh-base mb-0">
          {question.prompt || question.questionText}
        </p>
      </div>
      <div className="question-input">
        <div className="position-relative" style={{ maxWidth: 420 }}>
          <input
            type="text"
            className="form-control form-control-lg"
            id={`q${question.id}-input`}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isReviewMode}
            placeholder="Nhập câu trả lời..."
            data-testid="fillblank-input"
            autoComplete="off"
            style={{
              border: localValue ? '2px solid #0d6efd' : '2px solid #dee2e6',
              borderRadius: 12,
              transition: 'border-color 0.15s ease',
              background: isReviewMode ? '#f8f9fa' : '#fff',
            }}
          />
          {localValue && !isReviewMode && (
            <span
              className="position-absolute top-50 end-0 translate-middle-y me-3 text-success"
              style={{ fontSize: 18 }}
            >
              ✓
            </span>
          )}
        </div>
        {!isReviewMode && (
          <p className="text-muted small mt-2 mb-0">
            <em>Nhấn Enter hoặc click ra ngoài để lưu câu trả lời</em>
          </p>
        )}
      </div>
    </div>
  );
};

FillBlankRenderer.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    prompt: PropTypes.string,
    questionText: PropTypes.string,
  }).isRequired,
  currentAnswer: PropTypes.any,
  onAnswer: PropTypes.func,
  isReviewMode: PropTypes.bool,
};

export default FillBlankRenderer;
