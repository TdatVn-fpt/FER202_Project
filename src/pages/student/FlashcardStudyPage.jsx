import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FlashcardDeck from '../../components/feature/flashcards/FlashcardDeck';
import FlashcardLearn from './FlashcardLearn';
import FlashcardTest from './FlashcardTest';
import api from '../../services/api';
import { getCurrentUser } from '../../services/authService';
import './FlashcardStudyPage.css';

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const getCardLabel = (card, index) => (
  card?.word || card?.frontText || card?.term || card?.vocabulary || `Flashcard ${index + 1}`
);

const getCardMeaning = (card) => (
  card?.meaning || card?.backText || card?.definition || card?.translation || ''
);

const getDeckName = (deck) => (
  deck?.name || deck?.title || deck?.topic || 'Flashcard deck'
);

const FlashcardStudyPage = () => {
  const { deckId, id } = useParams();
  const navigate = useNavigate();
  const activeDeckId = deckId || id;
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || 'google-student-1';

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quizlet Modes: 'flashcards', 'learn', 'test'
  const [activeMode, setActiveMode] = useState('flashcards');

  useEffect(() => {
    let isMounted = true;

    const loadDeck = async () => {
      setLoading(true);
      setError('');

      if (!activeDeckId) {
        setError('Bộ flashcard không tồn tại.');
        setLoading(false);
        return;
      }

      try {
        const [deckResponse, cardResponse] = await Promise.all([
          api.get(`/flashcardDecks/${activeDeckId}`),
          api.get(`/flashcards?deckId=${activeDeckId}`)
        ]);

        if (!isMounted) return;

        setDeck(deckResponse.data || null);
        setCards(normalizeArray(cardResponse.data));
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError?.response?.status === 404
          ? 'Bộ flashcard không tồn tại.'
          : 'Không thể kết nối máy chủ. Vui lòng thử lại sau.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDeck();

    return () => {
      isMounted = false;
    };
  }, [activeDeckId, userId]);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <main className="container py-4">
        <div className="d-flex align-items-center gap-2 alert alert-light border" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          Đang tải bộ từ vựng...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-4">
        <div className="alert alert-danger" role="alert">{error}</div>
        <button type="button" className="btn btn-outline-primary rounded-pill" onClick={() => navigate('/learning/flashcards')}>
          Quay lại
        </button>
      </main>
    );
  }

  return (
    <div style={{ backgroundColor: '#f6f7fb', minHeight: 'calc(100vh - 60px)' }}>
      <main className="container py-4">
        {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h1 className="h3 mb-0 fw-bold">{getDeckName(deck)}</h1>
        <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => navigate('/learning/flashcards')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Đóng
        </button>
      </div>

      {/* Quizlet Modes Top Bar */}
      <nav className="study-mode-nav">
        <button 
          className={`mode-btn ${activeMode === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveMode('flashcards')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg> Thẻ ghi nhớ
        </button>
        <button 
          className={`mode-btn ${activeMode === 'learn' ? 'active' : ''}`}
          onClick={() => setActiveMode('learn')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21.5 2 21.5 8 15.5 8"></polyline><polyline points="2.5 22 2.5 16 8.5 16"></polyline><path d="M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg> Học
        </button>
        <button 
          className={`mode-btn ${activeMode === 'test' ? 'active' : ''}`}
          onClick={() => setActiveMode('test')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Kiểm tra
        </button>
      </nav>

      {/* Main Content Area based on Mode */}
      {cards.length === 0 ? (
        <section className="card border-0 shadow-sm text-center p-5">
          <div className="card-body">
            <h2 className="h5 mb-2">Chưa có flashcard để hiển thị.</h2>
            <p className="text-muted mb-0">Bộ từ vựng này đang trống.</p>
          </div>
        </section>
      ) : (
        <>
          {activeMode === 'flashcards' && (
            <>
              {/* The Flipcard Player */}
              <FlashcardDeck cards={cards} />

              {/* Term List below the deck */}
              <div className="term-list-container">
                <div className="term-list-header">
                  <h2>Thuật ngữ trong học phần này ({cards.length})</h2>
                  <select className="form-select w-auto fw-semibold border-0 shadow-sm">
                    <option>Thứ tự gốc</option>
                    <option>Bảng chữ cái</option>
                  </select>
                </div>
                
                <div className="term-list">
                  {cards.map((card, index) => (
                    <div className="term-item" key={card.id || index}>
                      <div className="term-item-content">
                        <div className="term-word">
                          {getCardLabel(card, index)}
                        </div>
                        <div className="term-definition">
                          {getCardMeaning(card)}
                        </div>
                      </div>
                      <div className="term-actions">
                        <button className="icon-btn" onClick={() => handleSpeak(getCardLabel(card, index))} title="Nghe thuật ngữ">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeMode === 'learn' && (
            <FlashcardLearn cards={cards} deckName={getDeckName(deck)} onExit={() => setActiveMode('flashcards')} />
          )}

          {activeMode === 'test' && (
            <FlashcardTest cards={cards} deckName={getDeckName(deck)} onExit={() => setActiveMode('flashcards')} />
          )}
        </>
      )}
      </main>
    </div>
  );
};

export default FlashcardStudyPage;
