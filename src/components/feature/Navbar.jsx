import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

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
            <Link to="/learning/dashboard" className="site-nav-link" onClick={closeMenu}>
              Dashboard
            </Link>
          </li>
        </ul>

        <div className="site-nav-ctas">
          <Link to="/register" className="site-signup-link">
            Sign Up
          </Link>
          <Link to="/login" className="site-login-button">
            Log In
          </Link>
        </div>
      </div>
    </nav>
  );
}
