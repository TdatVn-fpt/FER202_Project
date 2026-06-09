import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const stats = [
  { icon: 'PQ', value: '25,000+', label: 'Practice Questions' },
  { icon: 'EC', value: '120+', label: 'Expert Courses' },
  { icon: 'MT', value: '250+', label: 'Mock Tests' },
  { icon: 'LR', value: '4.8/5', label: 'Learner Rating' }
];

const featureCards = [
  {
    icon: '7+',
    title: 'Band 7+ Courses',
    text: 'Step-by-step learning paths for all four skills based on proven strategies and real exam patterns.',
    link: 'Explore Courses'
  },
  {
    icon: 'AI',
    title: 'Mock Test Simulator',
    text: 'Take full-length IELTS tests in a real exam environment with detailed band scores and feedback.',
    link: 'Start a Test'
  },
  {
    icon: 'SR',
    title: 'Smart Review',
    text: 'Review weak areas with targeted practice, performance insights, and smart flashcards to retain more.',
    link: 'Improve Smarter'
  }
];

export default function Home() {
  const homeRef = useRef(null);

  useEffect(() => {
    const root = homeRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animatedItems = Array.from(root.querySelectorAll('[data-animate]'));

    if (reduceMotion) {
      animatedItems.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    animatedItems.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * 80, 520)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    animatedItems.forEach((item) => observer.observe(item));

    let cursorFrame = 0;

    const handlePointerMove = (event) => {
      window.cancelAnimationFrame(cursorFrame);
      cursorFrame = window.requestAnimationFrame(() => {
        root.style.setProperty('--cursor-x', `${event.clientX}px`);
        root.style.setProperty('--cursor-y', `${event.clientY}px`);
      });
    };

    root.addEventListener('pointermove', handlePointerMove);

    return () => {
      observer.disconnect();
      root.removeEventListener('pointermove', handlePointerMove);
      window.cancelAnimationFrame(cursorFrame);
    };
  }, []);

  return (
    <div className="home-page guest-home" ref={homeRef}>
      <div className="luxury-cursor" aria-hidden="true"></div>

      <section className="master-hero">
        <div className="master-container master-hero-grid">
          <div className="master-hero-copy" data-animate="fade-up">
            <span className="trust-pill">Trusted by 50,000+ IELTS learners</span>
            <h1>
              Master IELTS with <span>Structured Courses &amp; Real Practice Tests</span>
            </h1>
            <p>
              Expert-designed courses, band-focused learning paths, extensive question banks,
              realistic mock tests, and smart progress tracking all in one place.
            </p>

            <div className="master-actions">
              <Link to="/courses" className="master-btn master-btn-primary">
                Explore Courses <span aria-hidden="true">-&gt;</span>
              </Link>
              <a href="#practice-tests" className="master-btn master-btn-secondary">
                <span className="play-icon" aria-hidden="true"></span>
                Start Practice
              </a>
            </div>

            <div className="hero-benefits" aria-label="IELTSMaster benefits">
              <span>Band 7+ Strategies</span>
              <span>Up-to-date Content</span>
              <span>Learn at Your Pace</span>
            </div>
          </div>

          <div className="blank-preview" data-animate="fade-left" aria-label="Empty image area">
            <div className="blank-preview-inner"></div>
          </div>
        </div>
      </section>

      <section className="stats-section" data-animate="fade-up">
        <div className="master-container stats-card">
          {stats.map((item) => (
            <article className="stat-item" key={item.label}>
              <span className="stat-icon">{item.icon}</span>
              <div>
                <strong>{item.value}</strong>
                <small>{item.label}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-card-section" id="practice-tests">
        <div className="master-container feature-card-grid">
          {featureCards.map((card, index) => (
            <article className="master-feature-card" key={card.title} data-animate="fade-up">
              <span className={`feature-icon feature-icon-${index + 1}`}>{card.icon}</span>
              <div>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
                <Link to={index === 0 ? '/courses' : '/register'}>
                  {card.link} <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="question-bank-section" id="question-bank">
        <div className="master-container bank-panel" data-animate="fade-up">
          <div>
            <span className="trust-pill">Question Bank</span>
            <h2>Luxury motion, clean cards, and smooth scrolling for focused IELTS study.</h2>
          </div>
          <Link to="/register" className="master-btn master-btn-primary">
            Build My Plan
          </Link>
        </div>
      </section>
    </div>
  );
}
