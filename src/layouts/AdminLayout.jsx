import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // EARS[Event-driven]: WHEN Admin clicks Logout, THE system SHALL trigger logout action.
    localStorage.removeItem('ielts_auth_user'); // Clear auth token/session
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    // EARS[Ubiquitous]: THE system SHALL display the Admin Sidebar for all /admin routes.
    <div className="admin-layout">
      
      {/* Mobile Header Toggle */}
      {/* EARS[Unwanted]: WHERE the layout is rendered on mobile, THE system SHALL provide an overlay/toggle (or responsive hiding). */}
      <div className="d-md-none p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="m-0">Admin Center</h5>
        <button 
          className="btn btn-outline-light btn-sm" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
          data-testid="mobile-menu-toggle"
        >
          {isMobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`} data-testid="admin-sidebar">
        <div className="admin-sidebar-header d-none d-md-block">
          Admin Center
        </div>
        
        <nav className="admin-nav mt-3 mt-md-0">
          {/* EARS[Event-driven]: WHEN Admin clicks on a navigation link, THE system SHALL navigate to the target route and highlight the active link. */}
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Users Management
          </NavLink>
        </nav>

        <button 
          className="admin-logout-btn mt-4 mt-md-auto" 
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content" data-testid="admin-main-content">
        <Outlet />
      </main>
      
    </div>
  );
}
