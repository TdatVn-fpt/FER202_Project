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
    { tag: 'Reading', title: 'Reading - Matching Headings', tutor: 'Sofia A.', time: 'Tomorrow, 09:00', accent: 'green' },
    { tag: 'Writing', title: 'Academic Writing Task 1: Comparing Two Charts', tutor: 'Mary T.', time: 'Saturday, 14:00', accent: 'orange' },
    { tag: 'Speaking', title: 'Speaking - Talking About Culture & Lifestyle', tutor: 'Tom S.', time: 'Sunday, 20:00', accent: 'pink' }
  ];

  const mockTests = [
    'IELTS Mock Test 2025 December',
    'IELTS Mock Test 2025 November',
    'IELTS Mock Test 2025 October',
    'IELTS Mock Test 2026 January'
  ];

  const features = [
    { number: '01', title: 'Placement Test', text: 'Start with a guided level check so guests can choose the right IELTS path.' },
    { number: '02', title: 'Live Lesson', text: 'Preview small-group classes with industry experts and scheduled practice.' },
    { number: '03', title: 'Intensive Course', text: 'Browse structured course tracks for Listening, Reading, Writing, and Speaking.' },
    { number: '04', title: 'Free IELTS Mock Test', text: 'Let visitors discover test formats before creating a learning account.' },
    { number: '05', title: 'Mock Test with AI', text: 'Highlight automated scoring, band estimates, and smart explanations.' },
    { number: '06', title: 'Unlock Full Services', text: 'Guide guests toward registration when they are ready to learn seriously.' }
  ];

  return (
    <div className="home-page guest-home">
      {/* HERO SECTION */}
      <section className="guest-hero py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 order-lg-1" aria-hidden="true">
              <div className="sky-card shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
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

            <div className="col-lg-6 order-lg-0">
              <span className="badge bg-light text-primary border border-primary rounded-pill px-3 py-2 mb-3 fs-6">IELTS Online Tests</span>
              <h1 className="display-4 fw-bold text-dark mb-4">Where would you like to study abroad?</h1>
              <p className="lead text-secondary mb-4">
                Explore IELTS lessons, mock tests, and guided course paths before creating your account.
              </p>

              <div className="row g-2 mb-4" style={{ maxWidth: '520px' }}>
                {destinations.map((destination) => (
                  <div className="col-6" key={destination.label}>
                    <Link to="/courses" className="btn btn-outline-secondary w-100 d-flex align-items-center text-start p-2 rounded-pill shadow-sm bg-white" style={{ minHeight: '52px' }}>
                      <span className="badge bg-light text-primary me-2 px-2 py-1">{destination.flag}</span>
                      <span className="fw-semibold text-dark">{destination.label}</span>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-3 flex-wrap">
                <Link to="/courses" className="btn btn-primary btn-lg rounded-pill px-4">Free consultation</Link>
                <Link to="/register" className="btn btn-light border btn-lg rounded-pill px-4">Another country</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE LESSONS SECTION */}
      <section className="live-section py-5 bg-white">
        <div className="container text-center mb-5">
          <h2 className="display-5 fw-normal text-dark mb-3">Join Our <span className="text-primary fw-bold">Live Lessons</span> with Industry Experts</h2>
          <p className="text-secondary fs-5">Build exam confidence with focused IELTS sessions and real teacher feedback.</p>
        </div>

        <div className="container">
          <div className="row g-4">
            {lessonCards.map((lesson) => (
              <div className="col-md-6 col-lg-4" key={lesson.title}>
                <div className={`card h-100 border-0 shadow-sm rounded-4 live-card ${lesson.accent}`}>
                  <div className="lesson-photo rounded-top-4 position-relative p-3">
                    <span className="badge bg-dark rounded-pill py-2 px-3">{lesson.tag}</span>
                  </div>
                  <div className="card-body p-4 d-flex flex-column">
                    <h5 className="card-title fw-bold mb-3" style={{ minHeight: '48px' }}>{lesson.title}</h5>
                    <div className="d-flex align-items-center mb-4">
                      <div className="avatar me-3 bg-light text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', fontSize: '18px' }}>
                        {lesson.tutor.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{lesson.tutor}</div>
                        <small className="text-muted">Certified IELTS educator</small>
                      </div>
                    </div>
                    <div className="row mb-4 mt-auto">
                      <div className="col-6">
                        <small className="text-muted d-block">Course</small>
                        <strong className="text-dark">IELTS</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Time</small>
                        <strong className="text-dark">{lesson.time}</strong>
                      </div>
                    </div>
                    <Link to="/register" className="btn btn-primary w-100 rounded-pill py-2 fw-semibold">Register</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/courses" className="btn btn-dark rounded-pill px-4 py-2">Explore more</Link>
        </div>
      </section>

      {/* COLLECTION SECTION */}
      <section className="collection-section py-5">
        <div className="container text-center mb-5">
          <h2 className="display-5 fw-normal text-dark mb-3">Explore Our Collection of International Standard IELTS Mock Tests</h2>
          <p className="text-secondary fs-5">Practice with exam-style tests and review your skill gaps before the real IELTS exam.</p>
        </div>

        <div className="container">
          <div className="collection-showcase row g-4 align-items-center rounded-4 shadow-sm p-4 p-md-5 mx-0">
            <div className="col-lg-5">
              <div className="award-panel p-4 rounded-4 text-white shadow d-flex flex-column justify-content-end mb-4 mx-auto" style={{ minHeight: '280px', maxWidth: '350px' }}>
                <span className="text-uppercase small mb-2 d-block">Top partner</span>
                <strong className="fs-3 lh-sm">IELTS Excellence Awards 2025</strong>
              </div>
            </div>
            <div className="col-lg-7 text-center py-4">
              <span className="text-primary fw-bold text-uppercase small d-block mb-3">IELTS Mock Test</span>
              <h3 className="display-6 text-dark mb-3">InterGreat Education Group</h3>
              <p className="text-secondary mx-auto" style={{ maxWidth: '420px' }}>Placement, mock test, and progress analytics for serious IELTS preparation.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/courses" className="btn btn-dark rounded-pill px-4 py-2">Get free IELTS mock test</Link>
        </div>
      </section>

      {/* MOCK LIST SECTION */}
      <section className="mock-list-section py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            {mockTests.map((test) => (
              <div className="col-md-6 col-lg-3" key={test}>
                <div className="card h-100 p-4 border shadow-sm rounded-4 text-start">
                  <div className="mock-icon bg-light rounded-circle mb-3" style={{ width: '46px', height: '46px' }}></div>
                  <h5 className="fw-bold text-dark mb-2">{test}</h5>
                  <p className="text-muted small mb-0">Listening · Reading · Writing</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-5">
          <Link to="/courses" className="btn btn-dark rounded-pill px-4 py-2">Explore more</Link>
        </div>
      </section>

      {/* MILLION BAND */}
      <section className="million-band position-relative py-5 overflow-hidden bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '360px' }}>
        <div className="million-collage" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, index) => (
            <span key={index}></span>
          ))}
        </div>
        <strong className="position-relative z-1 text-dark opacity-75 fw-medium" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>35,000,000</strong>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section py-5 bg-white" id="features">
        <div className="container">
          <div className="row g-4">
            {features.map((feature) => (
              <div className="col-md-6 col-lg-4" key={feature.number}>
                <div className="card h-100 p-4 border border-light bg-light rounded-4">
                  <span className="text-primary fs-5 fw-bold mb-3 font-monospace">{feature.number}</span>
                  <h4 className="fw-bold text-dark mb-3">{feature.title}</h4>
                  <p className="text-secondary mb-4">{feature.text}</p>
                  <div className="mt-auto text-end">
                    <Link to="/courses" className="btn btn-outline-dark btn-sm rounded-pill px-3">View all</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTING SECTION */}
      <section className="testing-section py-5 pb-lg-5" style={{ backgroundColor: '#eafcff' }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7">
              <div className="test-browser bg-white border rounded-4 shadow-lg overflow-hidden">
                <div className="browser-top d-flex gap-2 p-3 border-bottom bg-light">
                  <span className="bg-danger rounded-circle" style={{ width: '12px', height: '12px' }}></span>
                  <span className="bg-warning rounded-circle" style={{ width: '12px', height: '12px' }}></span>
                  <span className="bg-success rounded-circle" style={{ width: '12px', height: '12px' }}></span>
                </div>
                <div className="test-layout row g-4 p-4 mx-0">
                  <div className="col-md-7">
                    <div className="video-panel rounded-3 h-100 w-100" style={{ background: 'linear-gradient(135deg, #8fdfff, #0052ff)', minHeight: '260px' }}></div>
                  </div>
                  <div className="col-md-5 d-flex flex-column gap-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="bg-light rounded-3 w-100" style={{ height: '52px' }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <span className="badge bg-light text-primary border border-primary rounded-pill px-3 py-2 mb-3 fs-6">Mocktest Free</span>
              <h2 className="display-6 fw-bold mb-4">Authentic exam interface</h2>
              <p className="text-secondary lead mb-4">
                Guests can preview the test interface, score reports, answer explanations, and AI writing feedback before joining a course.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge bg-white text-dark border p-2 fs-6">Authentic exam interface</span>
                <span className="badge bg-white text-dark border p-2 fs-6">Get instant results</span>
                <span className="badge bg-white text-dark border p-2 fs-6">Detailed explanations</span>
                <span className="badge bg-white text-dark border p-2 fs-6">AI Examiner</span>
              </div>
              <Link to="/courses" className="btn btn-dark btn-lg rounded-pill px-4 py-2">Get free IELTS mock test</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
