import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-text">IELTS</span>
        </Link>

        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Menu">
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/courses" className="nav-link">
              Courses
            </Link>
          </li>
          <li className="nav-item">
            <a href="#features" className="nav-link">
              Features
            </a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-link">
              About
            </a>
          </li>
          <li className="nav-item">
            <a href="#contact" className="nav-link">
              Contact
            </a>
          </li>
        </ul>

        <div className="nav-ctas">
          <Link to="/login" className="nav-link-text">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
