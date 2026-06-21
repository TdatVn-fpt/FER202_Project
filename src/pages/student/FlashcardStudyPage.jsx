import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FlashcardDeck from '../../components/feature/flashcards/FlashcardDeck';
import FlashcardProgress from '../../components/feature/flashcards/FlashcardProgress';
import api from '../../services/api';
import { getCurrentUser } from '../../services/authService';

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const getCardLabel = (card, index) => (
  card?.word || card?.frontText || card?.term || card?.vocabulary || `Flashcard ${index + 1}`
);

const getDeckName = (deck) => (
  deck?.name || deck?.title || deck?.topic || 'Flashcard deck'
);

const buildProgressMap = (progressRecords, validCardIds) => {
  const progressMap = {};

  normalizeArray(progressRecords).forEach((record) => {
    if (!record?.flashcardId || !validCardIds.has(record.flashcardId)) {
      return;
    }

    if (record.status === 'known' || record.status === 'review') {
      progressMap[record.flashcardId] = record;
    }
  });

  return progressMap;
};

const FlashcardStudyPage = () => {
  const { deckId, id } = useParams();
  const navigate = useNavigate();
  const activeDeckId = deckId || id;
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || 'google-student-1';

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [pendingCardId, setPendingCardId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDeck = async () => {
      setLoading(true);
      setError('');
      setSaveError('');

      if (!activeDeckId) {
        // EARS[Unwanted]: WHERE a requested flashcard deck does not exist, THE system SHALL display a not-found state.
        setError('Bo flashcard khong ton tai.');
        setLoading(false);
        return;
      }

      try {
        // EARS[Event]: WHEN a Student opens a flashcard deck, THE system SHALL load deck flashcards.
        const [deckResponse, cardResponse, progressResponse] = await Promise.all([
          api.get(`/categories/${activeDeckId}`),
          api.get(`/flashcards?categoryId=${activeDeckId}`),
          api.get(`/flashcardProgress?userId=${userId}`)
        ]);

        if (!isMounted) {
          return;
        }

        const nextCards = normalizeArray(cardResponse.data);
        const validCardIds = new Set(nextCards.map((card) => card?.id).filter(Boolean));

        setDeck(deckResponse.data || null);
        setCards(nextCards);
        // EARS[Unwanted]: WHERE progress references a deleted flashcard, THE system SHALL ignore stale progress records.
        setProgressMap(buildProgressMap(progressResponse.data, validCardIds));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        // EARS[State]: WHILE JSON-Server is unavailable, THE system SHALL display a connection error instead of crashing.
        setError(requestError?.response?.status === 404
          ? 'Bo flashcard khong ton tai.'
          : 'Khong the ket noi may chu. Vui long thu lai sau.');
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

  const knownCount = useMemo(() => (
    Object.values(progressMap).filter((record) => record.status === 'known').length
  ), [progressMap]);

  const reviewCount = useMemo(() => (
    Object.values(progressMap).filter((record) => record.status === 'review').length
  ), [progressMap]);

  const saveStatus = async (cardId, status) => {
    if (!cardId || pendingCardId) {
      return;
    }

    const previousRecord = progressMap[cardId];
    const optimisticRecord = {
      ...previousRecord,
      userId,
      flashcardId: cardId,
      status
    };

    // EARS[Event]: WHEN a Student marks a flashcard as Known, THE system SHALL save status as `known`.
    // EARS[Event]: WHEN a Student marks a flashcard as Review, THE system SHALL save status as `review`.
    setSaveError('');
    setPendingCardId(cardId);
    setProgressMap((previousMap) => ({
      ...previousMap,
      [cardId]: optimisticRecord
    }));

    try {
      // EARS[Event]: WHEN a Student updates flashcard status, THE system SHALL persist progress through the API.
      const response = previousRecord?.id
        ? await api.patch(`/flashcardProgress/${previousRecord.id}`, { status })
        : await api.post('/flashcardProgress', {
            userId,
            flashcardId: cardId,
            status
          });

      const savedRecord = response?.data || optimisticRecord;
      setProgressMap((previousMap) => ({
        ...previousMap,
        [cardId]: savedRecord
      }));
    } catch {
      // EARS[Unwanted]: WHERE flashcard progress cannot be saved, THE system SHALL display an error notification.
      setProgressMap((previousMap) => {
        const nextMap = { ...previousMap };

        if (previousRecord) {
          nextMap[cardId] = previousRecord;
        } else {
          delete nextMap[cardId];
        }

        return nextMap;
      });
      setSaveError('Khong the luu tien do hoc tap.');
    } finally {
      setPendingCardId('');
    }
  };

  if (loading) {
    return (
      <main className="container py-4">
        {/* EARS[Event]: WHEN flashcard data is loading, THE system SHALL display a loading state. */}
        <div className="d-flex align-items-center gap-2 alert alert-light border" role="status" data-testid="flashcard-study-loading">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          Loading flashcards...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-4">
        <div className="alert alert-danger" role="alert" data-testid="flashcard-study-error">
          {error}
        </div>
        <button type="button" className="btn btn-outline-primary rounded-pill" onClick={() => navigate('/learning/flashcards')}>
          Back to decks
        </button>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-start mb-4">
        <div>
          <span className="badge rounded-pill text-bg-light mb-2">Study Deck</span>
          <h1 className="h2 mb-2">{getDeckName(deck)}</h1>
          <p className="text-muted mb-0">Flip each card, then mark it as Known or Review.</p>
        </div>
        <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => navigate('/learning/flashcards')}>
          Back to decks
        </button>
      </div>

      <FlashcardProgress total={cards.length} knownCount={knownCount} reviewCount={reviewCount} />

      {saveError && (
        <div className="alert alert-warning" role="alert" data-testid="flashcard-save-error">
          {saveError}
        </div>
      )}

      {/* EARS[Unwanted]: WHERE category filter returns no data, THE system SHALL show an EmptyState component. */}
      {cards.length === 0 ? (
        <section className="card border-0 shadow-sm text-center p-4" data-testid="flashcard-study-empty">
          <div className="card-body">
            <h2 className="h5 mb-2">Chua co flashcard de hien thi.</h2>
            <p className="text-muted mb-0">Choose another deck or add vocabulary data first.</p>
          </div>
        </section>
      ) : (
        <>
          <FlashcardDeck cards={cards} />

          <section className="card border-0 shadow-sm mt-4" aria-labelledby="flashcard-status-title">
            <div className="card-body">
              <h2 id="flashcard-status-title" className="h5 mb-3">Vocabulary status</h2>
              <div className="list-group list-group-flush">
                {cards.map((card, index) => {
                  const cardId = card?.id || `missing-card-${index}`;
                  const status = progressMap[cardId]?.status || 'new';
                  const isPending = pendingCardId === cardId;
                  const buttonsDisabled = Boolean(pendingCardId);

                  return (
                    <div className="list-group-item px-0" key={cardId}>
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
                        <div>
                          {/* EARS[Unwanted]: WHERE flashcard data is incomplete, THE system SHALL display fallback values instead of undefined content. */}
                          <strong>{getCardLabel(card, index)}</strong>
                          <div className="text-muted small">Status: {status}</div>
                        </div>
                        <div className="btn-group" role="group" aria-label={`Update ${getCardLabel(card, index)} status`}>
                          {/* EARS[State]: WHILE an API request is pending, THE system SHALL prevent duplicate save actions. */}
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            disabled={buttonsDisabled}
                            onClick={() => saveStatus(cardId, 'known')}
                          >
                            {isPending ? 'Saving...' : 'Known'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-warning"
                            disabled={buttonsDisabled}
                            onClick={() => saveStatus(cardId, 'review')}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default FlashcardStudyPage;
