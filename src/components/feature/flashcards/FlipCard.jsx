import React from 'react';
import './FlipCard.css';

/**
 * FlipCard Component
 * Dumb component that renders a 3D flipping card.
 * @param {string} frontText - Text to display on the front.
 * @param {string} backText - Text to display on the back.
 * @param {boolean} isFlipped - State indicating if the card is flipped.
 * @param {function} onFlip - Callback when the card is clicked.
 */
const FlipCard = ({ frontText, backText, isFlipped, onFlip }) => {
  // EARS[Ubiquitous]: THE system SHALL support front-side and back-side flashcard views.
  
  // EARS[Unwanted]: WHERE flashcard data is incomplete, THE system SHALL display fallback values instead of undefined content.
  const displayFront = frontText || "Front Content Missing";
  const displayBack = backText || "Back Content Missing";

  return (
    // EARS[Event]: WHEN a Student clicks a flashcard, THE system SHALL flip the card.
    <div className="flip-card-container" onClick={onFlip} role="button" aria-pressed={isFlipped}>
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        
        {/* Front Side */}
        <div className="flip-card-front card shadow-sm d-flex justify-content-center align-items-center text-center p-4">
          <h3 className="m-0 text-body-strong">{displayFront}</h3>
          <span className="text-muted-soft position-absolute bottom-0 mb-3 small">Click to flip</span>
        </div>

        {/* Back Side */}
        <div className="flip-card-back card shadow-sm d-flex justify-content-center align-items-center text-center p-4">
          <h3 className="m-0 text-primary-custom">{displayBack}</h3>
          <span className="text-muted-soft position-absolute bottom-0 mb-3 small">Click to flip</span>
        </div>

      </div>
    </div>
  );
};

export default FlipCard;
