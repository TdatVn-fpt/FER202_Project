import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './OnlineCourses.css';

const courseGroups = {
  kids: [
    {
      eyebrow: 'Course  In person',
      title: 'Learning with Timmy (2-6 years)',
      intro: 'Fun English learning for young children:',
      bullets: ['Play-based learning', 'Songs, stories and movement', 'Safe and supportive environment', 'Build early confidence in English'],
      note: 'Best for children starting their English journey.'
    },
    {
      eyebrow: 'Course  In person',
      title: 'Primary Plus English (6-11 years)',
      intro: 'Build strong English skills from an early age:',
      bullets: ['Speaking, listening, reading and writing', 'Fun classroom activities', 'Clear learning pathway and progression', 'Regular feedback for parents'],
      note: 'Best for primary learners who need structure and confidence.',
      popular: true
    },
    {
      eyebrow: 'Course  Online',
      title: 'Secondary Plus English',
      intro: 'Develop real-life English for teens:',
      bullets: ['Interactive lessons', 'Project-based learning', 'Exam-ready skills', 'Confidence for school and life'],
      note: 'Best for teens who want practical English skills.'
    }
  ],
  adults: [
    {
      eyebrow: 'Course  Online',
      title: 'English Self-Study',
      intro: 'Learn on your own, at your pace, with a structured self-study course.',
      bullets: ['Interactive online exercises', 'Clear learning path', 'Track your progress', 'Earn digital badges and certificates'],
      note: 'Best for independent learners who prefer to study alone.'
    },
    {
      eyebrow: 'Course  Online',
      title: 'Flexible English online course',
      intro: 'Our most popular course, with live, teacher-led classes and a clear learning plan.',
      bullets: ['Choose your time, teacher and topic', 'Join online group or private classes 24/7', 'Webinars, exercises and AI speaking practice', 'Follow a structured course for steady progress'],
      note: 'Best for learners who want flexibility and live teacher support.',
      popular: true
    },
    {
      eyebrow: 'Online',
      title: 'Private English tutor',
      intro: 'Improve your English with ad hoc one-to-one private lessons - no course, no long-term commitment.',
      bullets: ['Choose your tutor and your time', 'Focus only on what you need', 'Bring your own topics and questions', 'Personalised tutoring without a fixed plan'],
      note: 'Perfect if you are busy and need quick, focused support.'
    }
  ],
  organisations: [
    {
      eyebrow: 'In person  Online',
      title: 'English for business',
      intro: 'Improve communication skills across your organisation:',
      bullets: ['Workplace English for global teams', 'Business English and professional skills training', 'Flexible delivery: online or face-to-face', 'Tailored programmes aligned to business goals'],
      note: 'Designed for companies that want confident, high-performing teams.'
    },
    {
      eyebrow: 'In person  Online',
      title: 'English for Government',
      intro: 'Support national education and workforce development:',
      bullets: ['Large-scale English language programmes', 'Customisable communication skills training', 'Targeted coaching from specialists', 'English assessment to identify needs'],
      note: 'Best for public organisations and education partners.'
    },
    {
      eyebrow: 'In person  Online',
      title: 'English for Higher Education',
      intro: 'Strengthen English skills across your institution:',
      bullets: ['Training for academic staff and students', 'IELTS and international pathway preparation', 'Specialist courses for lectures and research', 'Academic English programmes for success'],
      note: 'Ideal for universities and colleges supporting international growth.'
    }
  ]
};

const benefits = [
  {
    title: 'Learn with professional teachers',
    text: 'Our specialist teachers are approved, experienced and ready to help you learn with confidence.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85'
  },
  {
    title: 'Practice content',
    text: 'Engage with expertly designed online activities to improve your language skills.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=85'
  },
  {
    title: 'Easy-to-use platform',
    text: 'Use your learning platform to see progress clearly and continue learning at your own pace.',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=85'
  },
  {
    title: 'Get certified results',
    text: 'Achieve digital badges and certificates to help track and celebrate your progress.',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=85'
  }
];

const faqs = [
  'Who is LearnEnglish for?',
  'Can I use LearnEnglish for free?',
  'Can I sign up for a free LearnEnglish account?',
  'How do I study with LearnEnglish?',
  'Can I take a test to check my English level?',
  'Can I find learning materials for my English level?',
  'Can I improve my speaking and pronunciation on LearnEnglish?',
  'Can I track my progress on LearnEnglish?',
  'Is LearnEnglish a course?',
  'Do you offer online classes and courses?'
];

export default function OnlineCourses() {
  const [activeGroup, setActiveGroup] = useState('adults');
  const groups = [
    { id: 'kids', label: 'Kids and Teens' },
    { id: 'adults', label: 'Adults' },
    { id: 'organisations', label: 'Organisations' }
  ];

  return (
    <div className="online-page">
      <section className="online-hero">
        <div className="online-container online-hero-inner">
          <div className="online-hero-art" aria-hidden="true"></div>
          <img
            className="online-hero-image"
            src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1300&q=85"
            alt="Learner taking an online English class"
          />
          <div className="online-hero-copy">
            <h1>Online courses</h1>
            <p>
              Learn English with an online course specially created by the British Council,
              the world's English teaching experts.
            </p>
          </div>
        </div>
      </section>

      <section className="online-courses-overview">
        <div className="online-container">
          <div className="online-section-heading">
            <h2>Our Courses</h2>
            <p>Choose the perfect English course solution for your needs</p>
          </div>

          <div className="online-tabs" role="tablist" aria-label="Course audiences">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                className={activeGroup === group.id ? 'active' : ''}
                onClick={() => setActiveGroup(group.id)}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        <div className="online-course-band">
          <div className="online-container">
            <div className="online-card-grid">
              {courseGroups[activeGroup].map((course) => (
                <article className="online-course-card" key={course.title}>
                  {course.popular && <span className="online-popular">Most popular</span>}
                  <p className="online-card-eyebrow">{course.eyebrow}</p>
                  <h3>{course.title}</h3>
                  <p>{course.intro}</p>
                  <ul>
                    {course.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                  <p className="online-course-note">{course.note}</p>
                  <Link to="/register" className="online-learn-button">Learn more</Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="online-benefits">
        <div className="online-container">
          <div className="online-section-heading">
            <h2>Why learn with us?</h2>
            <p>Whatever your age, ability or ambition, we have a course to suit you</p>
          </div>

          <div className="online-benefit-list">
            {benefits.map((benefit) => (
              <article className="online-benefit" key={benefit.title}>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
                <img src={benefit.image} alt="" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="online-quiz">
        <div className="online-container">
          <h2>Take our learning-style quiz to find the course that suits you the best</h2>
          <Link to="/register">Take the quiz</Link>
        </div>
      </section>

      <section className="online-faq">
        <div className="online-container">
          <h2>Answers to popular questions</h2>
          <div className="online-faq-list">
            {faqs.map((question) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>Explore our courses and free resources to find the option that matches your goals.</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
