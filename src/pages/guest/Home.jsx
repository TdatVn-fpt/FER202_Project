import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const preparationOptions = [
  {
    eyebrow: 'Course • Online',
    title: 'IELTS Coach online',
    lead: 'Get the IELTS score you need with live classes, expert teachers and a clear learning plan.',
    intro: 'Flexible learning:',
    bullets: [
      'Choose your class time and teacher',
      'Join small online group or private classes',
      'Practise with mock tests, webinars and exercises',
      'Follow a structured plan to improve your IELTS score'
    ],
    bestFor: 'Best for structured learning and expert support.'
  },
  {
    eyebrow: 'Online',
    title: 'IELTS Ready Member',
    lead: 'Free',
    intro: 'Get started with your IELTS preparation using free official practice and study tools.',
    bullets: [
      'Practise with 6 full skill-based tests',
      'Try a computer-delivered test experience',
      'Learn with videos and expert tips'
    ],
    bestFor: 'Best for building confidence before taking a course'
  },
  {
    eyebrow: 'Online',
    title: 'IELTS Ready Premium',
    lead: 'Free Included with IELTS test booking',
    intro: 'Get full access to our premium IELTS preparation toolkit - free when you book your test.',
    bullets: [
      '40 practice tests for Listening and Reading',
      'Mini-mock test with scores',
      'Practice questions, model answers and online courses',
      'Personal dashboard to track your progress'
    ],
    bestFor: 'Best for comprehensive preparation with premium resources'
  }
];

const stats = [
  { value: '90 years', label: 'of experience in teaching English language' },
  { value: '4 m', label: 'Millions of IELTS tests are taken every year' },
  { value: '12.500+', label: 'organisations and institutions recognise IELTS worldwide' },
  { value: '140', label: 'countries offer IELTS testing in official test centres' }
];

const skills = [
  {
    title: 'Listening',
    text: 'Assessment of your ability to understand spoken English, follow conversations and recognise key information and opinions.'
  },
  {
    title: 'Reading',
    text: 'Assessment of your ability to understand main ideas, details and implied meaning across different types of texts.'
  },
  {
    title: 'Writing',
    text: 'Assessment of your ability to organise ideas, respond appropriately and use a range of vocabulary and grammar accurately.'
  },
  {
    title: 'Speaking',
    text: 'Assessment of your ability to communicate clearly and fluently in a face-to-face or video call conversation.'
  }
];

export default function Home() {
  return (
    <div className="home-page bc-home">
      <section className="bc-hero">
        <div className="bc-hero-art" aria-hidden="true"></div>
        <div className="bc-container">
          <img
            className="bc-hero-image"
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85"
            alt="Student preparing for IELTS online with headphones"
          />
          <div className="bc-hero-copy">
            <h1>Prepare for IELTS with the co-creators of the test</h1>
            <p>Get the score you need with expert support, trusted resources and flexible preparation options.</p>
            <Link to="/courses" className="bc-button bc-button-primary">
              Find your IELTS preparation
            </Link>
          </div>
        </div>
      </section>

      <section className="bc-options" id="practice-tests">
        <div className="bc-container">
          <div className="bc-section-heading">
            <h2>IELTS preparation options for every goal</h2>
            <p>Choose the right preparation for your timeline and target score.</p>
            <p>Study with expert teachers, practise real test tasks, and build the skills you need to succeed.</p>
          </div>

          <div className="bc-option-grid">
            {preparationOptions.map((option) => (
              <article className="bc-option-card" key={option.title}>
                <p className="bc-option-eyebrow">{option.eyebrow}</p>
                <h3>{option.title}</h3>
                <p className="bc-option-lead">{option.lead}</p>
                <p>{option.intro}</p>
                <ul>
                  {option.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <p className="bc-option-best">{option.bestFor}</p>
                <Link to="/courses" className="bc-button bc-button-small">
                  Learn more
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bc-stats">
        <div className="bc-container">
          <h2>IELTS is the leading English test for study, work or migration abroad</h2>
          <div className="bc-stats-grid">
            {stats.map((item) => (
              <article className="bc-stat" key={item.value}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bc-skills" id="question-bank">
        <div className="bc-container bc-skills-inner">
          <div className="bc-section-heading">
            <h2>Maximise your IELTS score in all four skills</h2>
            <p>
              The IELTS test assesses your ability in listening, reading, writing and speaking.
              Prepare with targeted practice and expert support to perform at your best in each skill.
            </p>
          </div>

          <div className="bc-skill-grid">
            {skills.map((skill) => (
              <article className="bc-skill-card" key={skill.title}>
                <h3>{skill.title}</h3>
                <p>{skill.text}</p>
              </article>
            ))}
          </div>

          <p className="bc-skills-note">
            Your preparation will focus on the skills you need most, based on your level and goals.
            With expert guidance and targeted practice, you can build confidence and improve your IELTS performance.
          </p>

          <div className="bc-skill-actions">
            <Link to="/courses" className="bc-button bc-button-primary">
              Explore IELTS preparation
            </Link>
            <Link to="/register" className="bc-button bc-button-outline">
              Check your English level
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
