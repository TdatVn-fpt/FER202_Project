import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

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
            <Link to="/learning/dashboard" className="site-nav-link" onClick={closeMenu}>
              Level test
            </Link>
          </li>
        </ul>

        <div className="site-nav-ctas">
          <Link to="/login" className="site-login-button">
            Log In
          </Link>
          <Link to="/register" className="site-signup-link">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
