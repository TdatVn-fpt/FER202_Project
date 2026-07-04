import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import FlashcardFilter from '../../components/feature/flashcards/FlashcardFilter';
import StudentPageBanner from '../../components/common/StudentPageBanner';

const ALL_CATEGORIES = 'all';

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const getCategoryName = (category) => (
  category?.name || category?.title || category?.topic || 'Untitled deck'
);

const getCategoryDescription = (category) => (
  category?.description || 'Practice IELTS vocabulary with this topic.'
);

const buildDecks = (categories, flashcards) => {
  const safeCategories = normalizeArray(categories);
  const safeFlashcards = normalizeArray(flashcards);

  return safeCategories.map((category) => {
    const categoryId = category?.id || '';
    const cards = safeFlashcards.filter((card) => card?.deckId === categoryId);

    return {
      id: categoryId,
      name: getCategoryName(category),
      description: getCategoryDescription(category),
      totalCards: cards.length
    };
  });
};

const FlashcardListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFlashcardDecks = async () => {
      setLoading(true);
      setError('');

      try {
        // EARS[Event]: WHEN a Student navigates to `/learning/flashcards`, THE system SHALL load available flashcard decks.
        const [categoryResponse, flashcardResponse] = await Promise.all([
          api.get('/flashcardDecks?status=published'),
          api.get('/flashcards')
        ]);

        if (!isMounted) {
          return;
        }

        // EARS[Unwanted]: WHERE flashcard data is incomplete, THE system SHALL display fallback values instead of undefined content.
        setCategories(normalizeArray(categoryResponse.data));
        setFlashcards(normalizeArray(flashcardResponse.data));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        // EARS[Event]: WHEN flashcard data cannot be loaded, THE system SHALL display a readable error message.
        setError(requestError?.response?.status === 404
          ? 'Khong tim thay bo flashcard yeu cau.'
          : 'Khong the tai danh sach flashcard. Vui long thu lai sau.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFlashcardDecks();

    return () => {
      isMounted = false;
    };
  }, []);

  const decks = useMemo(() => buildDecks(categories, flashcards), [categories, flashcards]);

  const filteredDecks = useMemo(() => {
    // EARS[Event]: WHEN a Student selects a category filter, THE system SHALL display flashcards matching that category.
    if (selectedCategoryId === ALL_CATEGORIES) {
      return decks;
    }

    return decks.filter((deck) => deck.id === selectedCategoryId);
  }, [decks, selectedCategoryId]);

  const handleSelectCategory = (categoryId) => {
    // EARS[State]: WHILE a Student remains in a deck list, THE system SHALL preserve the selected category filter.
    setSelectedCategoryId(categoryId || ALL_CATEGORIES);
  };

  const handleOpenDeck = (deckId) => {
    if (!deckId) {
      return;
    }

    // EARS[Event]: WHEN a Student opens a flashcard deck, THE system SHALL load deck flashcards.
    navigate(`/learning/flashcards/${deckId}`);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <StudentPageBanner
        title="Flashcard Decks"
        subtitle="Choose a topic and practice vocabulary with quick review cards."
        badgeText="IELTS VOCABULARY"
        badgeIcon="bi-layers-fill"
      />
      
      <div className="container" style={{ marginTop: '-20px', position: 'relative', zIndex: 10 }}>

      {loading && (
        // EARS[Event]: WHEN flashcard data is loading, THE system SHALL display a loading state.
        <div className="d-flex align-items-center gap-2 alert alert-light border" role="status" data-testid="flashcard-loading">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          Loading flashcard decks...
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert" data-testid="flashcard-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <FlashcardFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
          />

          {/* EARS[Unwanted]: WHERE category filter returns no data, THE system SHALL show an EmptyState component. */}
          {filteredDecks.length === 0 ? (
            <section className="card border-0 shadow-sm text-center p-4" data-testid="flashcard-empty">
              <div className="card-body">
                <h2 className="h5 mb-2">Khong tim thay flashcard phu hop.</h2>
                <p className="text-muted mb-0">Choose another topic to continue learning.</p>
              </div>
            </section>
          ) : (
            // EARS[Ubiquitous]: THE system SHALL allow students to browse and select flashcard decks.
            <div className="row g-3" data-testid="flashcard-deck-list">
              {filteredDecks.map((deck) => (
                <div className="col-12 col-md-6 col-xl-4" key={deck.id || deck.name}>
                  <article className="card h-100 border-0 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between gap-3 mb-3">
                        <h2 className="h5 mb-0">{deck.name}</h2>
                        <span className="badge rounded-pill text-bg-light align-self-start">
                          {deck.totalCards} cards
                        </span>
                      </div>
                      <p className="text-muted flex-grow-1">{deck.description}</p>
                      <button
                        type="button"
                        className="btn btn-primary rounded-pill align-self-start"
                        onClick={() => handleOpenDeck(deck.id)}
                        disabled={!deck.id}
                        aria-label={`Open ${deck.name}`}
                      >
                        Start deck
                      </button>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default FlashcardListPage;
