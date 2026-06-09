import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, getDashboardPathByRole, logout } from '../../services/authService';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);
  const dashboardPath = getDashboardPathByRole(currentUser?.role);

  React.useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());

    window.addEventListener('auth:user-changed', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('auth:user-changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="site-navbar" aria-label="Main navigation">
      <div className="site-navbar-container">
        <Link to="/" className="site-navbar-brand" aria-label="IELTSMaster home" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-cap"></span>
          </span>
          <span className="site-navbar-logo-text">
            IELTS<span>Master</span>
          </span>
        </Link>

        <button
          className="site-hamburger-menu"
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
        </button>

        <ul className={`site-nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <NavLink to="/courses" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              Courses
            </NavLink>
          </li>
          <li>
            <a href="#practice-tests" className="site-nav-link" onClick={closeMenu}>
              Practice Tests
            </a>
          </li>
          <li>
            <a href="#question-bank" className="site-nav-link" onClick={closeMenu}>
              Question Bank
            </a>
          </li>
          <li>
            <Link to={dashboardPath} className="site-nav-link" onClick={closeMenu}>
              Dashboard
            </Link>
          </li>
        </ul>

        <div className="site-nav-ctas">
          {currentUser ? (
            <>
              <span className="site-signup-link">{currentUser.name}</span>
              <button type="button" className="site-login-button border-0" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <Link to="/login" className="site-login-button">
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
