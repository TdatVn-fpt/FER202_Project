import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-column">
            <h3 className="footer-column-title">Product</h3>
            <ul className="footer-links">
              <li><Link to="/courses" className="footer-link">Courses</Link></li>
              <li><a href="#pricing" className="footer-link">Pricing</a></li>
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#security" className="footer-link">Security</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Learn</h3>
            <ul className="footer-links">
              <li><a href="#blog" className="footer-link">Blog</a></li>
              <li><a href="#resources" className="footer-link">Resources</a></li>
              <li><a href="#guides" className="footer-link">Guides</a></li>
              <li><a href="#faq" className="footer-link">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Company</h3>
            <ul className="footer-links">
              <li><a href="#about" className="footer-link">About Us</a></li>
              <li><a href="#careers" className="footer-link">Careers</a></li>
              <li><a href="#press" className="footer-link">Press</a></li>
              <li><a href="#contact" className="footer-link">Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Legal</h3>
            <ul className="footer-links">
              <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
              <li><a href="#terms" className="footer-link">Terms of Service</a></li>
              <li><a href="#cookies" className="footer-link">Cookie Policy</a></li>
              <li><a href="#disclaimer" className="footer-link">Disclaimer</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Community</h3>
            <ul className="footer-links">
              <li><a href="#discord" className="footer-link">Discord</a></li>
              <li><a href="#twitter" className="footer-link">Twitter</a></li>
              <li><a href="#linkedin" className="footer-link">LinkedIn</a></li>
              <li><a href="#instagram" className="footer-link">Instagram</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Brand</h3>
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="brand-mark footer-brand-mark" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span className="footer-logo-text">IELTS Learning</span>
              </Link>
              <p className="footer-tagline">Master English. Master Your Future.</p>
            </div>
          </div>
        </div>

        <div className="footer-legal-band">
          <div className="footer-legal-content">
            <p className="footer-legal-text">
              © {currentYear} IELTS Learning. All rights reserved. IELTS is a trademark of the University of Cambridge, the British Council, and IDP Education.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
