import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

/**
 * Traceability Matrix:
 * - Happy Path 1: Render layout with Sidebar and Main Content. -> SPEC §8 (Layout Design, Bootstrap 5, DESIGN.md specs)
 * - Happy Path 2: Navigation Links render with correct labels and paths. -> PLAN §2.2 (Links: Dashboard, Users)
 * - Happy Path 3: Clicking NavLink applies active class correctly. -> EARS[Event-driven]: WHEN Admin clicks on a navigation link, THE system SHALL navigate to the target route and highlight the active link.
 * - Unwanted/Boundary 1: Mobile toggle button handles sidebar visibility. -> EARS[Unwanted]: WHERE the layout is rendered on mobile, THE system SHALL provide an overlay/toggle.
 * - Happy Path 4: Logout button clears storage and navigates to login. -> EARS[Event-driven]: WHEN Admin clicks Logout, THE system SHALL trigger logout action.
 */

// Mock useNavigate from react-router-dom
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('AdminLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = (initialRoute = '/admin/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<div data-testid="mock-dashboard">Dashboard Content</div>} />
            <Route path="users" element={<div data-testid="mock-users">Users Content</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="mock-login">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('[Happy Path 1 & 2] should render layout with sidebar, links and main content', () => {
    renderWithRouter();
    
    // Check Sidebar rendering
    const sidebar = screen.getByTestId('admin-sidebar');
    expect(sidebar).toBeInTheDocument();

    // Check Navigation Links
    const dashboardLink = screen.getByText(/Dashboard/i);
    const usersLink = screen.getByText(/Users Management/i);
    expect(dashboardLink).toBeInTheDocument();
    expect(usersLink).toBeInTheDocument();
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/admin/dashboard');
    expect(usersLink.closest('a')).toHaveAttribute('href', '/admin/users');

    // Check Main Content area renders Outlet children
    const mainContent = screen.getByTestId('admin-main-content');
    expect(mainContent).toBeInTheDocument();
    expect(screen.getByTestId('mock-dashboard')).toBeInTheDocument();
  });

  test('[Happy Path 3] should apply active class to the correct navigation link', () => {
    renderWithRouter('/admin/users');
    
    const dashboardLink = screen.getByText(/Dashboard/i);
    const usersLink = screen.getByText(/Users Management/i);
    
    // Since we are on /admin/users, usersLink should have 'active' class
    expect(usersLink.closest('a')).toHaveClass('active');
    expect(dashboardLink.closest('a')).not.toHaveClass('active');
  });

  test('[Boundary 1] should toggle mobile menu visibility when toggle button is clicked', () => {
    renderWithRouter();
    
    const toggleBtn = screen.getByTestId('mobile-menu-toggle');
    const sidebar = screen.getByTestId('admin-sidebar');
    
    // Initial state: not open on mobile (has 'd-none d-md-flex')
    expect(sidebar).toHaveClass('d-none');
    expect(sidebar).toHaveClass('d-md-flex');
    expect(sidebar).not.toHaveClass('d-flex');
    
    // Click to open
    fireEvent.click(toggleBtn);
    expect(sidebar).toHaveClass('d-flex');
    expect(sidebar).not.toHaveClass('d-none');
    
    // Click to close
    fireEvent.click(toggleBtn);
    expect(sidebar).toHaveClass('d-none');
  });

  test('[Happy Path 4] should clear localStorage and navigate to /login when logout is clicked', () => {
    // Setup initial state
    localStorage.setItem('ielts_auth_user', JSON.stringify({ id: 1, role: 'admin' }));
    
    renderWithRouter();
    
    const logoutBtn = screen.getByTestId('logout-button');
    fireEvent.click(logoutBtn);
    
    // Verify actions
    expect(localStorage.getItem('ielts_auth_user')).toBeNull();
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
  });
});
