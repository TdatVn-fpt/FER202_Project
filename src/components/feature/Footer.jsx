import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const footerColumns = [
  {
    title: 'Free resources',
    links: ['Learning hub', 'Listening', 'Reading', 'Writing', 'Speaking', 'Grammar', 'Vocabulary', 'Business English', 'General English']
  },
  {
    title: 'Online courses',
    links: ['Live classes', 'Personal tutoring', 'Self-Study course', 'Learning-style quiz']
  },
  {
    title: 'IELTS preparation',
    links: ['IELTS Coach']
  },
  {
    title: 'Level test',
    links: ['Take free level test', 'Understand your English level', 'Improve your English level']
  }
];

export default function Footer() {
  return (
    <footer className="footer">
      <section className="footer-cta">
        <h2>Start your IELTS preparation today</h2>
        <p>Choose the right preparation option and begin building the skills you need for your test.</p>
        <Link to="/courses" className="footer-cta-button">
          Choose your IELTS preparation
        </Link>
        <div className="footer-cta-points">
          <span>✓ Expert guidance</span>
          <span>✓ Real test practice</span>
          <span>✓ Proven results</span>
        </div>
      </section>

      <div className="footer-links-panel">
        <div className="footer-container">
          <div className="footer-columns">
            {footerColumns.map((column) => (
              <div className="footer-column" key={column.title}>
                <h3 className="footer-column-title">{column.title}</h3>
                <ul className="footer-links">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link to="/courses" className="footer-link">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
