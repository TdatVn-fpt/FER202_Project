import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonSidebar from '../../components/feature-course-learning/LessonSidebar';
import LessonContentPlayer from '../../components/feature-course-learning/LessonContentPlayer';
import {
  getLessons,
  getLessonProgress,
  getEnrollment,
  updateEnrollmentProgress,
  getLessonProgressByLesson,
  createLessonProgress,
  updateLessonProgress,
} from '../../services/courseLearning.service';
import { calculateProgress, getNextLesson, getPreviousLesson } from '../../utils/progress.util';

// EARS[Ubiquitous]: THE system SHALL protect all /learning/* routes (done via ProtectedRoute in AppRoutes).
// Mock userId - in production this would come from auth context/store.
const MOCK_USER_ID = 'u-001';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // T015: Mark as Completed state
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [markError, setMarkError] = useState(null);

  // ──────────────────────────────────────────
  // Data Fetching
  // ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch lessons, lesson progress (array), and enrollment in parallel
        const [lessonsData, progressRecords, enrollmentData] = await Promise.all([
          getLessons(courseId),
          getLessonProgress(MOCK_USER_ID, courseId),
          getEnrollment(MOCK_USER_ID, courseId),
        ]);

        setLessons(lessonsData);
        setEnrollment(enrollmentData);

        // EARS[State-driven]: Extract completed lesson IDs from individual progress records.
        const ids = Array.isArray(progressRecords)
          ? progressRecords.filter((p) => p.completed).map((p) => p.lessonId)
          : [];
        setCompletedIds(ids);

        // EARS[State-driven]: IF no lessonId in URL AND lessons exist, THEN load the first lesson.
        if (!lessonId && lessonsData.length > 0) {
          navigate(
            `/learning/courses/${courseId}/lessons/${lessonsData[0].id}`,
            { replace: true }
          );
        }
      } catch (err) {
        // EARS[Unwanted]: IF fetching fails, THEN show a recoverable error message.
        setError(err.message || 'Failed to load lesson data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchData();
  }, [courseId, lessonId, navigate]);

  // ──────────────────────────────────────────
  // Derived state
  // ──────────────────────────────────────────
  const currentLesson = lessons.find((l) => l.id === lessonId) || null;
  const isCurrentCompleted = completedIds.includes(lessonId);
  const prevLesson = lessons.length > 0 ? getPreviousLesson(lessons, lessonId) : null;
  const nextLesson = lessons.length > 0 ? getNextLesson(lessons, lessonId) : null;
  const isLastLesson = !nextLesson;

  // ──────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────

  // EARS[Event]: WHEN user selects lesson from sidebar, THEN update the player via URL change.
  const handleSelectLesson = (selectedLessonId) => {
    navigate(`/learning/courses/${courseId}/lessons/${selectedLessonId}`);
  };

  const handlePrevLesson = () => {
    if (prevLesson) navigate(`/learning/courses/${courseId}/lessons/${prevLesson.id}`);
  };

  const handleNextLesson = () => {
    if (nextLesson) navigate(`/learning/courses/${courseId}/lessons/${nextLesson.id}`);
  };

  // EARS[Event]: WHEN Student clicks Mark as Completed on an incomplete lesson,
  //   THE system SHALL create or patch a lessonProgress record, recalculate progress,
  //   PATCH enrollments, and auto-navigate to the next lesson.
  const handleMarkCompleted = async () => {
    // EARS[Unwanted]: WHERE Student double-clicks, disable button during submission.
    if (!lessonId || isMarkingComplete || isCurrentCompleted) return;

    setIsMarkingComplete(true);
    setMarkError(null);

    try {
      // Step 1: Check if a lessonProgress record already exists for this lesson.
      // EARS[Event]: IF record exists → PATCH, IF not → POST (prevent duplicate writes).
      const existing = await getLessonProgressByLesson(MOCK_USER_ID, lessonId);
      if (existing) {
        await updateLessonProgress(existing.id, {
          completed: true,
          completedAt: new Date().toISOString(),
        });
      } else {
        await createLessonProgress({
          id: `lp-${Date.now()}`,
          userId: MOCK_USER_ID,
          courseId,
          lessonId,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }

      // Step 2: Update local state optimistically.
      const newCompletedIds = completedIds.includes(lessonId)
        ? completedIds
        : [...completedIds, lessonId];
      setCompletedIds(newCompletedIds);

      // Step 3: Recalculate progress %.
      // EARS[Ubiquitous]: THE system SHALL calculate progress from approved lessons only.
      const newProgress = calculateProgress(newCompletedIds.length, lessons.length);

      // EARS[Event]: WHEN all lessons completed, set enrollment status = 'completed'.
      const newStatus = newProgress === 100 ? 'completed' : 'active';

      // Step 4: PATCH enrollment with updated progress + status.
      if (enrollment) {
        await updateEnrollmentProgress(enrollment.id, newProgress, newStatus);
        setEnrollment((prev) => ({ ...prev, progress: newProgress, status: newStatus }));
      }

      // Step 5: Auto-navigate to next lesson if available.
      // EARS[Event]: WHEN a Student clicks Mark as Completed, THE system SHOULD auto-advance.
      if (nextLesson) {
        navigate(`/learning/courses/${courseId}/lessons/${nextLesson.id}`);
      }
    } catch (err) {
      // EARS[Unwanted]: IF marking fails, show inline error. Allow retry.
      setMarkError(err.message || 'Failed to mark lesson as completed. Please try again.');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // ──────────────────────────────────────────
  // Render: Loading
  // ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container-fluid py-5 text-center" data-testid="loading-spinner">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading lesson...</p>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // Render: Error
  // ──────────────────────────────────────────
  if (error) {
    return (
      <div className="container py-5">
        <div
          className="alert alert-danger shadow-sm rounded-4 d-flex align-items-center gap-2"
          role="alert"
          data-testid="error-alert"
        >
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>
            <strong>Unable to load lesson.</strong> {error}
            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // Render: Main Layout
  // ──────────────────────────────────────────
  return (
    <div
      className="container-fluid py-4"
      style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
    >
      <div className="row g-4">
        {/* ── Left Column: Content + Controls ── */}
        <div className="col-lg-8 d-flex flex-column gap-3">
          {/* Content Player (T011) */}
          <LessonContentPlayer lesson={currentLesson} />

          {/* ── T015: Action Bar ── */}
          <div className="card shadow-sm border-0 rounded-4 p-3">
            {/* Inline error for mark action */}
            {markError && (
              <div
                className="alert alert-danger py-2 mb-3 d-flex align-items-center gap-2"
                role="alert"
                data-testid="mark-error"
              >
                <i className="bi bi-x-circle-fill"></i>
                {markError}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              {/* Previous Lesson */}
              {/* EARS[Event]: WHEN user clicks Previous Lesson, navigate to previous by order. */}
              {/* EARS[Edge]: IF first lesson, Previous button is disabled. */}
              <button
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={handlePrevLesson}
                disabled={!prevLesson}
                data-testid="btn-prev-lesson"
                aria-label="Go to previous lesson"
              >
                <i className="bi bi-arrow-left me-1"></i> Previous
              </button>

              {/* Mark as Completed / Completed Badge */}
              {isCurrentCompleted ? (
                <span
                  className="badge bg-success fs-6 px-4 py-2 rounded-pill"
                  data-testid="badge-completed"
                  aria-label="Lesson completed"
                >
                  <i className="bi bi-check-circle-fill me-1"></i> Completed
                </span>
              ) : (
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleMarkCompleted}
                  disabled={isMarkingComplete}
                  data-testid="btn-mark-complete"
                  aria-label="Mark lesson as completed"
                >
                  {isMarkingComplete ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i> Mark as Completed
                    </>
                  )}
                </button>
              )}

              {/* Next Lesson / Finish Course */}
              {/* EARS[Edge]: IF last lesson, show Finish Course instead of Next. */}
              {/* EARS[Event]: WHEN all lessons completed, enrollment status becomes 'completed'. */}
              {isLastLesson ? (
                <button
                  className="btn btn-success rounded-pill px-4"
                  onClick={() => navigate(`/learning/courses`)}
                  data-testid="btn-finish-course"
                  aria-label="Finish course and go to my courses"
                >
                  Finish Course <i className="bi bi-trophy-fill ms-1"></i>
                </button>
              ) : (
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  onClick={handleNextLesson}
                  disabled={!nextLesson}
                  data-testid="btn-next-lesson"
                  aria-label="Go to next lesson"
                >
                  Next <i className="bi bi-arrow-right ms-1"></i>
                </button>
              )}
            </div>

            {/* Progress mini-indicator */}
            {enrollment && (
              <div className="mt-3">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Course Progress</span>
                  <span data-testid="progress-percent">
                    {enrollment.progress ?? 0}%
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${enrollment.progress ?? 0}%` }}
                    aria-valuenow={enrollment.progress ?? 0}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    data-testid="progress-bar"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Lesson Sidebar (T010) ── */}
        <div className="col-lg-4">
          <LessonSidebar
            lessons={lessons}
            currentLessonId={lessonId}
            completedLessonIds={completedIds}
            onSelectLesson={handleSelectLesson}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
