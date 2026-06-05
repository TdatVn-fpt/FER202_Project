import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const destinations = [
    { flag: 'GB', label: 'Study in UK' },
    { flag: 'AU', label: 'Study in Australia' },
    { flag: 'CA', label: 'Study in Canada' },
    { flag: 'US', label: 'Study in America' }
  ];

  const lessonCards = [
    {
      tag: 'Reading',
      title: 'Reading - Matching Headings',
      tutor: 'Sofia A.',
      time: 'Tomorrow, 09:00',
      accent: 'green'
    },
    {
      tag: 'Writing',
      title: 'Academic Writing Task 1: Comparing Two Charts',
      tutor: 'Mary T.',
      time: 'Saturday, 14:00',
      accent: 'orange'
    },
    {
      tag: 'Speaking',
      title: 'Speaking - Talking About Culture & Lifestyle',
      tutor: 'Tom S.',
      time: 'Sunday, 20:00',
      accent: 'pink'
    }
  ];

  const mockTests = [
    'IELTS Mock Test 2025 December',
    'IELTS Mock Test 2025 November',
    'IELTS Mock Test 2025 October',
    'IELTS Mock Test 2026 January'
  ];

  const features = [
    {
      number: '01',
      title: 'Placement Test',
      text: 'Start with a guided level check so guests can choose the right IELTS path.'
    },
    {
      number: '02',
      title: 'Live Lesson',
      text: 'Preview small-group classes with industry experts and scheduled practice.'
    },
    {
      number: '03',
      title: 'Intensive Course',
      text: 'Browse structured course tracks for Listening, Reading, Writing, and Speaking.'
    },
    {
      number: '04',
      title: 'Free IELTS Mock Test',
      text: 'Let visitors discover test formats before creating a learning account.'
    },
    {
      number: '05',
      title: 'Mock Test with AI',
      text: 'Highlight automated scoring, band estimates, and smart explanations.'
    },
    {
      number: '06',
      title: 'Unlock Full Services',
      text: 'Guide guests toward registration when they are ready to learn seriously.'
    }
  ];

  const countries = ['United Kingdom', 'Canada', 'Australia', 'Germany', 'Japan', 'United States'];

  return (
    <div className="home-page guest-home">
      <section className="guest-hero">
        <div className="container guest-hero-grid">
          <div className="guest-hero-media" aria-hidden="true">
            <div className="sky-card">
              <div className="sun-glow"></div>
              <div className="cloud cloud-one"></div>
              <div className="cloud cloud-two"></div>
              <div className="flight-path"></div>
              <div className="airplane">
                <span className="wing wing-left"></span>
                <span className="body"></span>
                <span className="wing wing-right"></span>
              </div>
            </div>
          </div>

          <div className="guest-hero-content">
            <span className="guest-eyebrow">IELTS Online Tests</span>
            <h1>Where would you like to study abroad?</h1>
            <p>
              Explore IELTS lessons, mock tests, and guided course paths before creating your account.
            </p>

            <div className="destination-grid">
              {destinations.map((destination) => (
                <Link to="/courses" className="destination-pill" key={destination.label}>
                  <span>{destination.flag}</span>
                  {destination.label}
                </Link>
              ))}
            </div>

            <div className="hero-actions">
              <Link to="/courses" className="guest-btn guest-btn-primary">Free consultation</Link>
              <Link to="/register" className="guest-btn guest-btn-secondary">Another country</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="live-section">
        <div className="container guest-section-heading">
          <h2>Join Our <span>Live Lessons</span> with Industry Experts</h2>
          <p>Build exam confidence with focused IELTS sessions and real teacher feedback.</p>
        </div>

        <div className="container live-grid">
          {lessonCards.map((lesson) => (
            <article className={`live-card ${lesson.accent}`} key={lesson.title}>
              <div className="lesson-photo">
                <span>{lesson.tag}</span>
              </div>
              <div className="lesson-body">
                <h3>{lesson.title}</h3>
                <div className="tutor-row">
                  <span className="avatar">{lesson.tutor.charAt(0)}</span>
                  <div>
                    <strong>{lesson.tutor}</strong>
                    <small>Certified IELTS educator</small>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Course</dt>
                    <dd>IELTS</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>{lesson.time}</dd>
                  </div>
                </dl>
                <Link to="/register" className="card-cta">Register</Link>
              </div>
            </article>
          ))}
        </div>

        <div className="section-action">
          <Link to="/courses" className="guest-btn guest-btn-dark">Explore more</Link>
        </div>
      </section>

      <section className="collection-section">
        <div className="container guest-section-heading">
          <h2>Explore Our Collection of International Standard IELTS Mock Tests</h2>
          <p>Practice with exam-style tests and review your skill gaps before the real IELTS exam.</p>
        </div>

        <div className="container collection-showcase">
          <div className="award-panel">
            <span>Top partner</span>
            <strong>IELTS Excellence Awards 2025</strong>
          </div>
          <div className="certificate-panel">
            <span>IELTS Mock Test</span>
            <h3>InterGreat Education Group</h3>
            <p>Placement, mock test, and progress analytics for serious IELTS preparation.</p>
          </div>
          <div className="stat-pill stat-top"><strong>80M+</strong><span>test attempts</span></div>
          <div className="stat-pill stat-right"><strong>35M+</strong><span>students</span></div>
          <div className="stat-pill stat-bottom"><strong>120+</strong><span>countries</span></div>
        </div>

        <div className="section-action">
          <Link to="/courses" className="guest-btn guest-btn-dark">Get free IELTS mock test</Link>
        </div>
      </section>

      <section className="mock-list-section">
        <div className="container mock-list-grid">
          {mockTests.map((test) => (
            <article className="mock-card" key={test}>
              <span className="mock-icon"></span>
              <h3>{test}</h3>
              <p>Listening · Reading · Writing</p>
            </article>
          ))}
        </div>
        <div className="section-action">
          <Link to="/courses" className="guest-btn guest-btn-dark">Explore more</Link>
        </div>
      </section>

      <section className="million-band">
        <div className="million-collage" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, index) => (
            <span key={index}></span>
          ))}
        </div>
        <strong>35,000,000</strong>
      </section>

      <section className="features-section" id="features">
        <div className="container feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span>{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <Link to="/courses">View all</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="testing-section">
        <div className="container testing-grid">
          <div className="test-browser">
            <div className="browser-top">
              <span></span><span></span><span></span>
            </div>
            <div className="test-layout">
              <div className="video-panel"></div>
              <div className="question-panel">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div className="testing-copy">
            <span className="guest-eyebrow">Mocktest Free</span>
            <h2>Authentic exam interface</h2>
            <p>
              Guests can preview the test interface, score reports, answer explanations, and AI writing feedback before joining a course.
            </p>
            <div className="testing-tabs">
              <span>Authentic exam interface</span>
              <span>Get instant results</span>
              <span>Detailed explanations</span>
              <span>AI Examiner</span>
            </div>
            <Link to="/courses" className="guest-btn guest-btn-dark">Get free IELTS mock test</Link>
          </div>
        </div>
      </section>

      <section className="global-section" id="about">
        <div className="container global-grid">
          <div>
            <span className="guest-eyebrow">Global learners</span>
            <h2>IELTS preparation for study plans around the world.</h2>
            <p>Keep the guest journey simple: discover courses, preview value, then register.</p>
          </div>
          <div className="globe-visual" aria-hidden="true">
            {countries.map((country, index) => (
              <span key={country} style={{ '--i': index }}>{country.slice(0, 2)}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
