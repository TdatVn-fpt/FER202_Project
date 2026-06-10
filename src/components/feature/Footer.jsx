import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-fer202">
      <div className="footer-fer202-container">
        <h2 className="footer-fer202-title">IELTS Online Learning System</h2>
        <p className="footer-fer202-desc">
          This project is developed as a capstone assignment for the <strong>FER202</strong> course. 
          <br />
          It is an academic project designed to demonstrate front-end development skills using ReactJS.
        </p>
        
        <div className="footer-fer202-links">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        <div className="footer-fer202-copyright">
          &copy; {new Date().getFullYear()} IELTS Master Team. All rights reserved for academic purposes.
        </div>
      </div>
    </footer>
  );
}
