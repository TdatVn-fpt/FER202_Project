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
        <Link to="/" className="site-navbar-brand" aria-label="IELTS Master home" onClick={closeMenu}>
          <span className="site-navbar-logo-text">
            IELTS<br />MASTER
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
          <li className="nav-item-dropdown">
            <NavLink to="/courses" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              Free resources <span className="nav-chevron"></span>
            </NavLink>
            <div className="mega-menu">
              <div className="mega-menu-content">
                <div className="mega-menu-left">
                  <h2><Link to="/courses" onClick={closeMenu}>Free resources</Link></h2>
                  <p>Find learning materials at your English level.</p>
                  <Link to="/courses" className="explore-btn" onClick={closeMenu}>Explore all free resources</Link>
                </div>
                <div className="mega-menu-center">
                  <h3>In this section</h3>
                  <ul>
                    <li><Link to="/learning-hub" onClick={closeMenu}>Learning hub <span>&gt;</span></Link></li>
                    <li><Link to="/listening" onClick={closeMenu}>Listening <span>&gt;</span></Link></li>
                    <li><Link to="/reading" onClick={closeMenu}>Reading <span>&gt;</span></Link></li>
                    <li><Link to="/writing" onClick={closeMenu}>Writing <span>&gt;</span></Link></li>
                    <li><Link to="/speaking" onClick={closeMenu}>Speaking <span>&gt;</span></Link></li>
                    <li><Link to="/grammar" onClick={closeMenu}>Grammar <span>&gt;</span></Link></li>
                    <li><Link to="/vocabulary" onClick={closeMenu}>Vocabulary <span>&gt;</span></Link></li>
                    <li><Link to="/business-english" onClick={closeMenu}>Business English <span>&gt;</span></Link></li>
                    <li><Link to="/general-english" onClick={closeMenu}>General English <span>&gt;</span></Link></li>
                  </ul>
                </div>
                <div className="mega-menu-right">
                   <div className="mega-menu-image-placeholder"></div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <a href="#practice-tests" className="site-nav-link" onClick={closeMenu}>
              Online courses <span className="nav-chevron"></span>
            </a>
          </li>
          <li>
            <a href="#question-bank" className="site-nav-link" onClick={closeMenu}>
              IELTS preparation <span className="nav-chevron"></span>
            </a>
          </li>
          <li>
            <Link to={dashboardPath} className="site-nav-link" onClick={closeMenu}>
              Level test <span className="nav-chevron"></span>
            </Link>
          </li>
        </ul>

        <div className="site-nav-ctas">
          {currentUser ? (
            <>
              <button className="site-search-button" aria-label="Search" onClick={() => {}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Search</span>
              </button>
              <span className="site-signup-link">{currentUser.name}</span>
              <button type="button" className="site-login-button border-0" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <button className="site-search-button" aria-label="Search" onClick={() => {}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Search</span>
              </button>
              <Link to="/login" className="site-login-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Log in</span>
              </Link>
              <Link to="/register" className="site-signup-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
