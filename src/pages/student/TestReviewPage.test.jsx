/**
 * Traceability Matrix:
 * - Feature: Practice Test & Quiz System
 * - Task: T020 - Page: Test Review Page
 * - SPEC Requirement: "Load attempt. Chuyển Renderer sang chế độ Readonly (isReviewMode=true). Hiển thị chi tiết đúng/sai & giải thích."
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import TestReviewPage from './TestReviewPage';

// Mock child components
jest.mock('../../components/feature/quiz/QuestionRenderer', () => ({ question, currentAnswer, isReviewMode }) => (
  <div data-testid={`mock-renderer-${question.id}`}>
    MockRenderer Q{question.id} (Review: {isReviewMode ? 'yes' : 'no'})
  </div>
));



// Mock React Router
jest.mock('react-router-dom', () => ({
  useParams: () => ({ attemptId: '200' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock('axios');

describe('TestReviewPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAttempt = { 
    id: 200, 
    testId: 1, 
    status: 'completed',
    answers: {
      0: 'Correct Answer',
      1: 'Wrong Answer'
    }
  };
  
  const mockTest = { id: 1, title: 'Review Mock Test' };
  
  const mockQuestions = [
    { id: 10, type: 'multiple-choice', answer: 'Correct Answer' },
    { id: 11, type: 'true-false-not-given', answer: 'True' }, // user answered 'Wrong Answer'
  ];

  const setupAxiosMocks = () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/attempts/')) return Promise.resolve({ data: mockAttempt });
      if (url.includes('/tests/')) return Promise.resolve({ data: mockTest });
      if (url.includes('/questions?')) return Promise.resolve({ data: mockQuestions });
      return Promise.reject(new Error('not found'));
    });
  };

  // EARS[State-driven]: Basic rendering and score calculation
  it('renders score summary correctly and displays read-only questions', async () => {
    setupAxiosMocks();
    render(<TestReviewPage />);

    expect(screen.getByTestId('review-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('review-page')).toBeInTheDocument();
    });

    // Check score calculation (1 correct out of 2)
    // New UI shows percent or separate counts
    expect(screen.getByText('50%')).toBeInTheDocument(); // pct card
    // '1' may appear multiple times (score + question index); just check it exists
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);

    // New UI renders QuestionReviewCard with data-testid="review-question-{id}"
    expect(screen.getByTestId('review-question-10')).toBeInTheDocument();
    expect(screen.getByTestId('review-question-11')).toBeInTheDocument();

    // Check Correct/Wrong UI in question cards
    expect(screen.getByText('✓ Chính xác')).toBeInTheDocument();
    expect(screen.getByText('✗ Sai')).toBeInTheDocument();
  });

  // EARS[Unwanted]: API error
  it('displays error when data fetching fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    render(<TestReviewPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('review-error')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Lỗi khi tải dữ liệu kết quả bài làm.')).toBeInTheDocument();
  });
});
