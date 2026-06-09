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
        <Link to="/" className="site-navbar-brand" aria-label="British Council home" onClick={closeMenu}>
          <span className="bc-logo-dots" aria-hidden="true"></span>
          <span className="site-navbar-logo-text">
            BRITISH<br />COUNCIL
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
              Free resources
            </NavLink>
          </li>
          <li>
            <a href="#practice-tests" className="site-nav-link" onClick={closeMenu}>
              Online courses
            </a>
          </li>
          <li>
            <a href="#question-bank" className="site-nav-link" onClick={closeMenu}>
              IELTS preparation
            </a>
          </li>
          <li>
<<<<<<< HEAD
            <Link to="/learning/dashboard" className="site-nav-link" onClick={closeMenu}>
              Level test
=======
            <Link to={dashboardPath} className="site-nav-link" onClick={closeMenu}>
              Dashboard
>>>>>>> origin
            </Link>
          </li>
        </ul>

        <div className="site-nav-ctas">
<<<<<<< HEAD
          <Link to="/login" className="site-login-button">
            Log In
          </Link>
          <Link to="/register" className="site-signup-link">
            Register
          </Link>
=======
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
>>>>>>> origin
        </div>
      </div>
    </nav>
  );
}
