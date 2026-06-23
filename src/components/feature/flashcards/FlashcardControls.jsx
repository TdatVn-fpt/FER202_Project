import React from 'react';

const toSafeIndex = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(Math.floor(numericValue), 0);
};

const toSafeTotal = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(Math.floor(numericValue), 0);
};

const callIfFunction = (callback) => {
  if (typeof callback === 'function') {
    callback();
  }
};

/**
 * FlashcardControls Component
 * Renders Previous, Shuffle and Next controls for flashcard study navigation.
 * @param {number} currentIndex - Zero-based index of the current flashcard.
 * @param {number} total - Total number of flashcards in the current deck.
 * @param {function} onPrevious - Callback when Previous is clicked.
 * @param {function} onShuffle - Callback when Shuffle is clicked.
 * @param {function} onNext - Callback when Next is clicked.
 * @param {boolean} disabled - Optional external disabled state while parent work is pending.
 */
const FlashcardControls = ({
  currentIndex = 0,
  total = 0,
  onPrevious,
  onShuffle,
  onNext,
  disabled = false
}) => {
  // EARS[Ubiquitous]: THE system SHALL support responsive UI from mobile width to desktop width.
  const safeTotal = toSafeTotal(total);

  // EARS[Unwanted]: WHERE flashcard data is incomplete, THE system SHALL display fallback values instead of undefined content.
  const safeCurrentIndex = safeTotal > 0
    ? Math.min(toSafeIndex(currentIndex), safeTotal - 1)
    : 0;

  const hasCards = safeTotal > 0;
  const isSingleCardDeck = safeTotal === 1;
  const controlsDisabled = disabled || !hasCards;
  const positionLabel = hasCards ? `${safeCurrentIndex + 1} / ${safeTotal}` : '0 / 0';

  // EARS[Event]: WHEN a Student clicks Previous, THE system SHALL display the previous flashcard.
  const handlePrevious = () => {
    callIfFunction(onPrevious);
  };

  // EARS[Event]: WHEN a Student clicks Shuffle, THE system SHALL randomize flashcard order.
  const handleShuffle = () => {
    callIfFunction(onShuffle);
  };

  // EARS[Event]: WHEN a Student clicks Next, THE system SHALL display the next flashcard.
  const handleNext = () => {
    callIfFunction(onNext);
  };

  return (
    <nav
      className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3"
      aria-label="Flashcard navigation controls"
    >
      {/* EARS[State]: WHILE a Student is viewing a flashcard, THE system SHALL maintain the current card position. */}
      <span className="badge rounded-pill text-bg-light align-self-center px-3 py-2">
        Card {positionLabel}
      </span>

      <div className="btn-group w-100 w-md-auto" role="group" aria-label="Flashcard actions">
        {/* EARS[Unwanted]: WHERE a deck has no flashcards, THE system SHALL keep navigation actions disabled instead of crashing. */}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handlePrevious}
          disabled={controlsDisabled}
          aria-label="Previous flashcard"
        >
          Previous
        </button>

        {/* EARS[Unwanted]: WHERE a deck contains only one flashcard, THE system SHALL keep shuffle safe and non-destructive. */}
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleShuffle}
          disabled={controlsDisabled || isSingleCardDeck}
          aria-label="Shuffle flashcards"
        >
          Shuffle
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={controlsDisabled}
          aria-label="Next flashcard"
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default FlashcardControls;
