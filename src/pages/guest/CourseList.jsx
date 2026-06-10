import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './CourseList.css';

export default function CourseList() {
  const fallbackResources = useMemo(() => ([
    {
      id: 'resource-001',
      title: 'The language clinic: Live Q&A session',
      type: 'Learning hub',
      level: 'B1 Intermediate',
      skill: 'Listening',
      date: '10 Jun 2026',
      rating: 4,
      reviews: 79,
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
      description: 'Join our live event and ask our expert educator your questions about the English language and learning English.'
    },
    {
      id: 'resource-002',
      title: "Learn with the world's English experts",
      type: 'Promotion',
      level: 'C1 Advanced',
      skill: 'Speaking',
      date: '10 Jun 2026',
      rating: 4.5,
      reviews: 68,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
      description: 'We help you gain confidence and improve your speaking, pronunciation and vocabulary.'
    },
    {
      id: 'resource-003',
      title: 'Grammar lesson: Chat GPT and AI',
      type: 'Grammar',
      level: 'B1 Intermediate',
      skill: 'Grammar',
      date: '11 Jun 2026',
      rating: 4,
      reviews: 112,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
      description: 'Watch a recording of our live event to support learners studying grammar, and talk about Chat GPT and AI.'
    },
    {
      id: 'resource-004',
      title: "Summer quiz: We're all going on a summer holiday!",
      type: 'General English',
      level: 'B1 Intermediate',
      skill: 'Vocabulary',
      date: '23 Jul 2026',
      rating: 3.8,
      reviews: 103,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      description: 'Watch a recording of our live event to support learners studying grammar and vocabulary with this fun summer quiz.'
    },
    {
      id: 'resource-005',
      title: "Vocabulary lesson: Let's get away from it all",
      type: 'Vocabulary',
      level: 'B1 Intermediate',
      skill: 'Vocabulary',
      date: '01 Jul 2026',
      rating: 4,
      reviews: 115,
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
      description: 'Watch a recording of our live event to support learners studying vocabulary, travelling and using useful holiday language.'
    },
    {
      id: 'resource-006',
      title: 'Home sweet home',
      type: 'Community discussions',
      level: 'B1 Intermediate',
      skill: 'Speaking',
      date: '30 May 2026',
      rating: 4.7,
      reviews: 37,
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
      description: 'There is no place like home! In this topic, write and talk about our homes.'
    },
    {
      id: 'resource-007',
      title: 'Tell us about your home',
      type: 'Community discussions',
      level: 'B2 Upper intermediate',
      skill: 'Writing',
      date: '20 May 2026',
      rating: 4.6,
      reviews: 76,
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
      description: "What's your home like? Practice describing your home by writing a comment or leaving a voice message."
    },
    {
      id: 'resource-008',
      title: 'My dream home',
      type: 'Community discussions',
      level: 'B1 Intermediate',
      skill: 'Writing',
      date: '20 May 2026',
      rating: 4.5,
      reviews: 41,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      description: 'What would your dream home be like? Read our ideas and then add your own.'
    },
    {
      id: 'resource-009',
      title: 'Vocabulary about homes',
      type: 'Vocabulary',
      level: 'B1 Intermediate',
      skill: 'Vocabulary',
      date: '20 May 2026',
      rating: 5,
      reviews: 19,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
      description: 'Practice vocabulary for parts of a house or flat with useful learning activities.'
    },
    {
      id: 'resource-010',
      title: 'House or home?',
      type: 'Grammar',
      level: 'C1 Advanced',
      skill: 'Grammar',
      date: '20 May 2026',
      rating: 4.5,
      reviews: 36,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
      description: 'Do you know when to use house and when to use home? Learn the difference in context.'
    },
    {
      id: 'resource-011',
      title: 'Reflection - home sweet home',
      type: 'Community discussions',
      level: 'B1 Intermediate',
      skill: 'Writing',
      date: '4 May 2026',
      rating: 4.5,
      reviews: 60,
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
      description: 'Did you like this topic? What did you learn? Share your reflection with other learners.'
    },
    {
      id: 'resource-012',
      title: 'Tea or coffee?',
      type: 'Community discussions',
      level: 'B1 Intermediate',
      skill: 'Speaking',
      date: '29 Apr 2026',
      rating: 4,
      reviews: 61,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
      description: 'All around the world, millions of cups of tea and coffee are drunk every day.'
    }
  ]), []);

  const [resources, setResources] = useState(fallbackResources);
  const [visibleCount, setVisibleCount] = useState(12);
  const [filters, setFilters] = useState({
    level: '',
    skill: '',
    type: '',
    topic: ''
  });

  useEffect(() => {
    let ignore = false;

    fetch('http://localhost:3001/freeResources')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load resources');
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setResources(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setResources(fallbackResources);
        }
      });

    return () => {
      ignore = true;
    };
  }, [fallbackResources]);

  const filteredResources = resources.filter((resource) => (
    Object.entries(filters).every(([key, value]) => {
      if (!value) {
        return true;
      }

      const sourceValue = key === 'topic'
        ? `${resource.title} ${resource.description}`
        : resource[key];

      return sourceValue?.toLowerCase().includes(value.toLowerCase());
    })
  ));

  const resourcesToShow = filteredResources.slice(0, visibleCount);
  const categoryTabs = ['Learning hub', 'Listening', 'Reading', 'Writing', 'Speaking', 'Grammar', 'Vocabulary', 'Business English', 'General English'];
  const levelOptions = ['A1 Beginner', 'A2 Pre-intermediate', 'B1 Intermediate', 'B2 Upper intermediate', 'C1 Advanced'];
  const skillOptions = ['Listening', 'Reading', 'Writing', 'Speaking', 'Grammar', 'Vocabulary'];
  const typeOptions = ['Learning hub', 'Community discussions', 'Grammar', 'Vocabulary', 'Promotion', 'General English'];

  const renderStars = (rating) => (
    Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < Math.round(rating) ? 'active' : ''}>*</span>
    ))
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setVisibleCount(12);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="free-resources-page">
      <section className="resources-hero">
        <div className="resources-hero-band" aria-hidden="true"></div>
        <div className="resources-container resources-hero-inner">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85"
            alt="Learner using a tablet"
            className="resources-hero-image"
          />
        </div>
      </section>

      <section className="resources-main">
        <div className="resources-container">
          <div className="resources-intro">
            <h1>Personalised resources for you</h1>
            <p>Register to unlock the full resource library and save your favourite materials for easy access any time.</p>
            <Link to="/register" className="resources-register-button">Register now</Link>
          </div>

          <div className="resources-tabs" aria-label="Resource categories">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={filters.type === tab ? 'active' : ''}
                onClick={() => {
                  setVisibleCount(12);
                  setFilters((current) => ({ ...current, type: current.type === tab ? '' : tab }));
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <form className="resources-filters">
            <label>
              <span>Level</span>
              <select name="level" value={filters.level} onChange={handleFilterChange}>
                <option value="">-Any-</option>
                {levelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>

            <label>
              <span>Skill</span>
              <select name="skill" value={filters.skill} onChange={handleFilterChange}>
                <option value="">-Any-</option>
                {skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
              </select>
            </label>

            <label>
              <span>Type</span>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">-Any-</option>
                {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label>
              <span>Topics</span>
              <select name="topic" value={filters.topic} onChange={handleFilterChange}>
                <option value="">-Any-</option>
                <option value="home">Homes</option>
                <option value="grammar">Grammar</option>
                <option value="holiday">Travel and holidays</option>
                <option value="coffee">Food and drink</option>
              </select>
            </label>
          </form>

          <button type="button" className="find-level-button">Find your level</button>

          <div className="resource-grid">
            {resourcesToShow.map((resource) => (
              <article className="resource-card" key={resource.id}>
                <div className="resource-image-wrap">
                  {resource.type === 'Promotion' && <span className="resource-badge">Promotion</span>}
                  <img src={resource.image} alt="" />
                </div>
                <div className="resource-card-body">
                  <Link to="/courses" className="resource-title">{resource.title}</Link>
                  <p className="resource-description">{resource.description}</p>
                  <p className="resource-meta">{resource.type}</p>
                  <p className="resource-level">Level: <strong>{resource.level}</strong></p>
                  <p className="resource-skill">{resource.skill}</p>
                  <div className="resource-rating" aria-label={`${resource.rating} out of 5 stars`}>
                    {renderStars(resource.rating)}
                  </div>
                  <p className="resource-average">Average: {resource.rating} <span>({resource.reviews} votes)</span></p>
                  <p className="resource-date">{resource.date}</p>
                </div>
              </article>
            ))}
          </div>

          {resourcesToShow.length === 0 && (
            <p className="resources-empty">No resources match these filters.</p>
          )}

          {visibleCount < filteredResources.length && (
            <div className="resources-load-wrap">
              <button type="button" className="resources-load-button" onClick={() => setVisibleCount((count) => count + 4)}>
                Load more
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="online-courses-strip">
        <div className="resources-container">
          <h2>Online courses</h2>
          <div className="online-course-grid">
            <Link to="/courses">
              <span className="course-icon">L</span>
              <strong>Live classes</strong>
              <small>Group and one-to-one classes with expert teachers.</small>
            </Link>
            <Link to="/courses">
              <span className="course-icon">S</span>
              <strong>Self-study</strong>
              <small>Learn English in your own time, at your own pace.</small>
            </Link>
            <Link to="/courses">
              <span className="course-icon">P</span>
              <strong>Personal tutoring</strong>
              <small>One-to-one sessions focused on a personal plan.</small>
            </Link>
            <Link to="/courses">
              <span className="course-icon">I</span>
              <strong>IELTS preparation</strong>
              <small>Get the score you need with private and group classes.</small>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
