/**
 * Traceability Matrix:
 * - ADM-CONTENT (T012): Render Overview tab with 4 stat cards.
 * - ADM-CONTENT (T013): Render Approvals Queue tab with pending content.
 * - ADM-CONTENT (T013): Click review to open ApprovalDetailModal.
 * - Error Handling: Handle API errors gracefully on dashboard stats & queue fetch.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../../../pages/admin/AdminDashboard';
import { getUsers, getApprovalRequests, getAuditLogs } from '../../../services/adminService';
import api from '../../../services/api';

// Virtual mocks
jest.mock('../../../services/adminService', () => ({
  getUsers: jest.fn(),
  getApprovalRequests: jest.fn(),
  getAuditLogs: jest.fn(),
}), { virtual: true });

jest.mock('../../../services/api', () => ({
  get: jest.fn(),
}), { virtual: true });

// Mock ApprovalDetailModal to prevent it from rendering deep tree
jest.mock('../../../components/feature/admin/ApprovalDetailModal', () => {
  return function MockApprovalModal({ isOpen, request, onActionSuccess }) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-approval-modal">
        Modal Open for {request?.targetId}
        <button onClick={() => onActionSuccess('approve')}>Simulate Success</button>
      </div>
    );
  };
});

describe('AdminDashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- T012 Tests (Overview Tab) ---
  it('should render all 3 tabs', async () => {
    getUsers.mockResolvedValue({ headers: { 'x-total-count': '0' } });
    getApprovalRequests.mockResolvedValue([]);
    getAuditLogs.mockResolvedValue({ headers: { 'x-total-count': '0' } });
    api.get.mockResolvedValue({ headers: { 'x-total-count': '0' } });

    render(<AdminDashboard />);
    
    expect(screen.getByRole('tab', { name: /System Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Approvals Queue/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Audit Logs/i })).toBeInTheDocument();
  });

  it('should fetch and display stats successfully (Happy Path)', async () => {
    getUsers.mockResolvedValue({ headers: { 'x-total-count': '150' } });
    getApprovalRequests.mockResolvedValue([{}, {}, {}]); // length 3
    getAuditLogs.mockResolvedValue({ headers: { 'x-total-count': '500' } });
    api.get.mockResolvedValue({ headers: { 'x-total-count': '25' } });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('25')).toBeInTheDocument(); // Courses
      expect(screen.getByText('3')).toBeInTheDocument(); // Pending Content
      expect(screen.getAllByText('Audit Logs').length).toBeGreaterThan(0);
    });
  });

  it('should handle API fetch error gracefully (Error Path)', async () => {
    getUsers.mockRejectedValue(new Error('Network Error'));
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard statistics. Please try again later.')).toBeInTheDocument();
    });
  });

  // --- T013 Tests (Approvals Queue Tab) ---
  it('should fetch and display pending queue when Approvals tab is clicked', async () => {
    // Setup for initial overview load
    getUsers.mockResolvedValue({ headers: { 'x-total-count': '0' } });
    getAuditLogs.mockResolvedValue({ headers: { 'x-total-count': '0' } });
    api.get.mockResolvedValue({ headers: { 'x-total-count': '0' } });
    
    // First load for overview
    getApprovalRequests.mockResolvedValue([{}, {}]); 
    
    render(<AdminDashboard />);
    
    // Switch to Approvals Tab
    const queueTab = screen.getByRole('tab', { name: /Approvals Queue/i });
    
    // EARS[State-driven]: WHILE content status is pending, THE system SHALL display it in the approvals queue
    // Mock return for queue tab
    const mockQueue = [
      { id: 'req-1', targetType: 'course', targetId: 'course-1', teacherId: 't-1', createdAt: '2026-06-01T00:00:00Z' }
    ];
    getApprovalRequests.mockResolvedValueOnce(mockQueue);
    
    fireEvent.click(queueTab);

    await waitFor(() => {
      expect(screen.getByText('course-1')).toBeInTheDocument();
      expect(screen.getByText('t-1')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching pending queue', async () => {
    render(<AdminDashboard />);
    
    getApprovalRequests.mockRejectedValueOnce(new Error('Queue Error'));
    
    const queueTab = screen.getByRole('tab', { name: /Approvals Queue/i });
    fireEvent.click(queueTab);

    await waitFor(() => {
      expect(screen.getByText('Failed to load pending requests. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should open ApprovalDetailModal when Review button is clicked', async () => {
    getApprovalRequests.mockResolvedValue([{ id: 'req-1', targetType: 'course', targetId: 'course-1' }]);
    
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('tab', { name: /Approvals Queue/i }));

    await waitFor(() => {
      expect(screen.getByText('course-1')).toBeInTheDocument();
    });

    const reviewBtn = screen.getByRole('button', { name: /Review/i });
    fireEvent.click(reviewBtn);

    // Modal should be open
    await waitFor(() => {
      expect(screen.getByTestId('mock-approval-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Open for course-1')).toBeInTheDocument();
    });
  });

  it('should refresh queue after modal action is successful', async () => {
    // Initial fetch
    getApprovalRequests.mockResolvedValue([{ id: 'req-1', targetType: 'course', targetId: 'course-1' }]);
    
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('tab', { name: /Approvals Queue/i }));

    await waitFor(() => {
      expect(screen.getByText('course-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Review/i }));

    // Mock next fetch after action success (empty queue)
    getApprovalRequests.mockResolvedValueOnce([]);

    // Trigger action success
    const simulateBtn = await screen.findByText('Simulate Success');
    fireEvent.click(simulateBtn);

    await waitFor(() => {
      expect(screen.getByText('No pending content to review.')).toBeInTheDocument();
    });
  });
});
