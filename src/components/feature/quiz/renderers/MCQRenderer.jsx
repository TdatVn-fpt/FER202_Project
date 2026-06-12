import React from 'react';
import PropTypes from 'prop-types';

/**
 * MCQRenderer Component
 * Renders a Multiple Choice Question with premium bordered card-style radio options.
 */
const MCQRenderer = ({ question, currentAnswer, onAnswer, isReviewMode = false }) => {
  // EARS[Unwanted]: IF options array is empty or missing, THE system SHALL render a fallback message.
  if (!question || !Array.isArray(question.options) || question.options.length === 0) {
    return (
      <div className="text-muted fst-italic" data-testid="mcq-fallback">
        Không tìm thấy lựa chọn nào cho câu hỏi này.
      </div>
    );
  }

  const handleChange = (optionValue) => {
    // EARS[Event]: WHEN user selects an option, THE system SHALL trigger onAnswer.
    if (onAnswer && !isReviewMode) {
      onAnswer(question.id, optionValue);
    }
  };

  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="mcq-renderer" data-testid={`mcq-question-${question.id}`}>
      <div className="mb-4">
        <p className="fs-5 fw-semibold text-dark lh-base mb-0">
          {question.prompt || question.questionText}
        </p>
      </div>
      <div className="question-options d-flex flex-column gap-2">
        {question.options.map((option, index) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const isChecked = currentAnswer === optionValue;
          const letter = OPTION_LETTERS[index] || String(index + 1);

          return (
            <div
              key={`${question.id}-opt-${index}`}
              onClick={() => handleChange(optionValue)}
              role="radio"
              aria-checked={isChecked}
              tabIndex={isReviewMode ? -1 : 0}
              onKeyDown={(e) => e.key === 'Enter' && handleChange(optionValue)}
              className={`d-flex align-items-center gap-3 p-3 rounded-3 border-2 ${
                isReviewMode ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{
                cursor: isReviewMode ? 'not-allowed' : 'pointer',
                border: isChecked
                  ? '2px solid #0d6efd'
                  : '2px solid #dee2e6',
                backgroundColor: isChecked ? '#eef2ff' : '#fff',
                transition: 'all 0.15s ease',
              }}
              data-testid={`mcq-radio-${index}`}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background: isChecked ? '#0d6efd' : '#f0f0f0',
                  color: isChecked ? '#fff' : '#555',
                  fontSize: 14,
                  transition: 'all 0.15s ease',
                }}
              >
                {letter}
              </div>
              <span className="fs-6 text-dark">{optionLabel}</span>
            </div>
          );
        })}
      </div>
      {/* Hidden real radio input for form compatibility */}
      {question.options.map((option, index) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        return (
          <input
            key={`hidden-${index}`}
            type="radio"
            name={`question-${question.id}`}
            value={optionValue}
            checked={currentAnswer === optionValue}
            onChange={() => handleChange(optionValue)}
            disabled={isReviewMode}
            style={{ display: 'none' }}
          />
        );
      })}
    </div>
  );
};

MCQRenderer.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    prompt: PropTypes.string,
    questionText: PropTypes.string,
    options: PropTypes.array,
  }).isRequired,
  currentAnswer: PropTypes.any,
  onAnswer: PropTypes.func,
  isReviewMode: PropTypes.bool,
};

export default MCQRenderer;
