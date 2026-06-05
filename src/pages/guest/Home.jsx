import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const lessonCards = [
    { tag: 'Live lesson', title: 'Band 6.5 Listening Sprint', meta: 'Expert feedback in 45 minutes' },
    { tag: 'Reading', title: 'Skimming and scanning drills', meta: '12 practice passages' },
    { tag: 'Speaking', title: 'Part 2 cue card workshop', meta: 'AI score and tutor review' }
  ];

  const features = [
    { number: '01', title: 'Placement test', text: 'Find the right IELTS level before choosing a course.' },
    { number: '02', title: 'Live lessons', text: 'Join small-group sessions with IELTS-focused teachers.' },
    { number: '03', title: 'Mock tests', text: 'Practice Listening, Reading, Writing, and Speaking by format.' },
    { number: '04', title: 'Progress dashboard', text: 'Track band-score movement and skill gaps each week.' }
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">IELTS online learning system</span>
            <h1>Study IELTS with a clear path to your target band.</h1>
            <p className="hero-subtitle">
              Practice lessons, live classes, mock tests, and progress tracking in one learning workspace.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="btn-primary-large">Explore courses</Link>
              <Link to="/register" className="btn-secondary-large">Take placement test</Link>
            </div>
          </div>

          <div className="hero-visual" aria-label="IELTS study abroad course preview">
            <div className="globe-card">
              <div className="plane-line"></div>
              <div className="globe-orbit"></div>
              <div className="plane">IELTS</div>
              <h2>Where would you like to study abroad?</h2>
              <div className="country-grid">
                <span>UK</span>
                <span>Australia</span>
                <span>Canada</span>
                <span>USA</span>
              </div>
            </div>
            <div className="score-card">
              <strong>7.0+</strong>
              <span>Target band roadmap</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <div className="container section-heading">
          <span className="eyebrow">Live lessons</span>
          <h2>Join focused IELTS sessions with expert guidance.</h2>
        </div>
        <div className="container lesson-grid">
          {lessonCards.map((lesson) => (
            <article className="lesson-card" key={lesson.title}>
              <span>{lesson.tag}</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.meta}</p>
              <Link to="/courses">Register</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-band">
        <div className="container stats-grid">
          <div>
            <strong>80M+</strong>
            <span>practice questions completed</span>
          </div>
          <div>
            <strong>35M+</strong>
            <span>learners supported globally</span>
          </div>
          <div>
            <strong>120+</strong>
            <span>IELTS lesson paths and mock tests</span>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container section-heading">
          <span className="eyebrow">Learning workflow</span>
          <h2>A simple structure for client-server IELTS learning.</h2>
        </div>
        <div className="container features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span>{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mocktest-section">
        <div className="container mocktest-grid">
          <div>
            <span className="eyebrow">Mock test analytics</span>
            <h2>Know exactly what to improve before the real exam.</h2>
            <p>
              The mock database supports courses, lessons, tests, questions, enrollments, and payments for a realistic IELTS learning flow.
            </p>
            <Link to="/courses" className="btn-primary-large">Start learning</Link>
          </div>
          <div className="dashboard-card">
            <div className="chart-bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="dashboard-row">
              <strong>Reading</strong>
              <span>Band 7.0</span>
            </div>
            <div className="dashboard-row">
              <strong>Listening</strong>
              <span>Band 7.5</span>
            </div>
            <div className="dashboard-row">
              <strong>Writing</strong>
              <span>Needs review</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
