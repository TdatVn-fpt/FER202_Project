import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="site-navbar">
      <div className="site-navbar-container">
        <Link to="/" className="site-navbar-brand" aria-label="IELTS Learning home">
          <span className="brand-mark" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="site-navbar-logo-text">IELTS Learning</span>
        </Link>

        <button className="site-hamburger-menu" onClick={toggleMenu} aria-label="Menu">
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
        </button>

        <ul className={`site-nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="site-nav-item">
            <NavLink to="/" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
          </li>
          <li className="site-nav-item">
            <NavLink to="/courses" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>
              Courses
            </NavLink>
          </li>
          <li className="site-nav-item">
            <a href="#features" className="site-nav-link">
              Features
            </a>
          </li>
          <li className="site-nav-item">
            <a href="#about" className="site-nav-link">
              About
            </a>
          </li>
          <li className="site-nav-item">
            <a href="#contact" className="site-nav-link">
              Contact
            </a>
          </li>
        </ul>

        <div className="site-nav-ctas">
          <button className="site-nav-icon-button" aria-label="Search">
            <span className="site-search-icon"></span>
          </button>
          <button className="site-language-button" aria-label="Change language">
            <span>EN</span>
            <span className="site-chevron"></span>
          </button>
          <Link to="/register" className="site-signup-button">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
