import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, getDashboardPathByRole, logout } from '../../services/authService';
import './Navbar.css';

export default function Navbar({ variant = 'default' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);
  const dashboardPath = getDashboardPathByRole(currentUser?.role);

  React.useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());

    window.addEventListener('auth:user-changed', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('auth:user-changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const renderMegaMenu = ({ title, description, buttonText, buttonTo, items, image, imageAlt }) => (
    <div className="mega-menu">
      <div className="mega-menu-content">
        <div className="mega-menu-left">
          <h2><Link to={buttonTo} onClick={closeMenu}>{title}</Link></h2>
          {description && <p>{description}</p>}
          <Link to={buttonTo} className="explore-btn" onClick={closeMenu}>{buttonText}</Link>
        </div>
        <div className="mega-menu-center">
          <h3>In this section</h3>
          <ul>
            {items.map((item) => (
              <li key={item.label}>
                <Link to={item.to} onClick={closeMenu}>
                  {item.label}{item.arrow && <span>&gt;</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mega-menu-right">
          <img className="mega-menu-image" src={image} alt={imageAlt} />
        </div>
      </div>
    </div>
  );

  const onlineCoursesMenu = {
    title: 'Online courses',
    description: "Learn English with an online course specially created by the British Council, the world's English teaching experts.",
    buttonText: 'Explore all courses',
    buttonTo: currentUser ? '/learning/courses' : '/online-courses',
    image: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'Learner joining an online English class',
    items: [
      { label: 'Live classes', to: currentUser ? '/learning/courses' : '/online-courses' },
      { label: 'Personal tutoring', to: currentUser ? '/learning/courses' : '/online-courses' },
      { label: 'Self-Study course', to: currentUser ? '/learning/courses' : '/online-courses' },
      { label: 'Learning-style quiz', to: currentUser ? '/learning/courses' : '/online-courses' }
    ]
  };

  const ieltsPreparationMenu = {
    title: 'IELTS preparation',
    description: '',
    buttonText: 'Find your IELTS preparation',
    buttonTo: '/courses',
    image: 'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'Student preparing for IELTS online',
    items: [
      { label: 'IELTS Coach', to: '/courses' }
    ]
  };

  const levelTestMenu = {
    title: 'Level test',
    description: 'Find out more about the different CEFR English levels and take a free level test.',
    buttonText: 'Take level test',
    buttonTo: dashboardPath,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=85',
    imageAlt: 'English learners in a classroom',
    items: [
      { label: 'Take free level test', to: dashboardPath },
      { label: 'Understand your English level', to: dashboardPath, arrow: true },
      { label: 'Improve your English level', to: '/courses' }
    ]
  };

  return (
    <nav className="site-navbar" aria-label="Main navigation">
      <div className="site-navbar-container">
        <Link to="/" className="site-navbar-brand" aria-label="IELTS Master home" onClick={closeMenu}>
          <span className="site-navbar-logo-text">
            IELTS<br />MASTER
          </span>
        </Link>

        <button
          className="site-hamburger-menu"
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
        </button>

        <ul className={`site-nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {variant === 'student' ? (
            <>
              <li className="nav-item">
                <NavLink to="/learning/dashboard" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/learning/my-courses" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  My Courses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/learning/courses" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  Course Catalog
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/learning/history" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  Learning History
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item-dropdown">
                <NavLink to="/courses" className={({ isActive }) => `site-nav-link free-resources-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  Free resources <span className="nav-chevron"></span>
                </NavLink>
                <div className="mega-menu">
                  <div className="mega-menu-content">
                    <div className="mega-menu-left">
                      <h2><Link to="/courses" onClick={closeMenu}>Free resources</Link></h2>
                      <p>Find learning materials at your English level.</p>
                      <Link to="/courses" className="explore-btn" onClick={closeMenu}>Explore all free resources</Link>
                    </div>
                    <div className="mega-menu-center">
                      <h3>In this section</h3>
                      <ul>
                        <li><Link to="/learning-hub" onClick={closeMenu}>Learning hub <span>&gt;</span></Link></li>
                        <li><Link to="/listening" onClick={closeMenu}>Listening <span>&gt;</span></Link></li>
                        <li><Link to="/reading" onClick={closeMenu}>Reading <span>&gt;</span></Link></li>
                        <li><Link to="/writing" onClick={closeMenu}>Writing <span>&gt;</span></Link></li>
                        <li><Link to="/speaking" onClick={closeMenu}>Speaking <span>&gt;</span></Link></li>
                        <li><Link to="/grammar" onClick={closeMenu}>Grammar <span>&gt;</span></Link></li>
                        <li><Link to="/vocabulary" onClick={closeMenu}>Vocabulary <span>&gt;</span></Link></li>
                        <li><Link to="/business-english" onClick={closeMenu}>Business English <span>&gt;</span></Link></li>
                        <li><Link to="/general-english" onClick={closeMenu}>General English <span>&gt;</span></Link></li>
                      </ul>
                    </div>
                    <div className="mega-menu-right">
                      <img
                        className="mega-menu-image"
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85"
                        alt="Student learning English online"
                      />
                    </div>
                  </div>
                </div>
              </li>
              <li className="nav-item-dropdown">
                <Link to={currentUser ? '/learning/courses' : '/online-courses'} className="site-nav-link" onClick={closeMenu}>
                  Online courses <span className="nav-chevron"></span>
                </Link>
                {renderMegaMenu(onlineCoursesMenu)}
              </li>
              <li className="nav-item-dropdown">
                <Link to="/courses" className="site-nav-link" onClick={closeMenu}>
                  IELTS preparation <span className="nav-chevron"></span>
                </Link>
                {renderMegaMenu(ieltsPreparationMenu)}
              </li>
              <li className="nav-item-dropdown">
                <Link to={dashboardPath} className="site-nav-link" onClick={closeMenu}>
                  Level test <span className="nav-chevron"></span>
                </Link>
                {renderMegaMenu(levelTestMenu)}
              </li>
            </>
          )}
        </ul>

        <div className="site-nav-ctas">
          {currentUser ? (
            <>
              <button className="site-search-button" aria-label="Search" onClick={() => {}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Search</span>
              </button>
              
              <div className="site-user-dropdown-container">
                <button type="button" className="site-user-dropdown-btn">
                  {currentUser.name}
                  <span className="nav-chevron" style={{ marginTop: '-2px' }}></span>
                </button>
                <div className="site-user-dropdown-menu">
                  {variant !== 'student' && (
                    <Link to={dashboardPath} className="site-user-dropdown-item" onClick={closeMenu}>
                      My Dashboard
                    </Link>
                  )}
                  <Link to="/learning/profile" className="site-user-dropdown-item" onClick={closeMenu}>
                    My Profile
                  </Link>
                  <div className="site-user-dropdown-divider"></div>
                  <button type="button" className="site-user-dropdown-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button className="site-search-button" aria-label="Search" onClick={() => {}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Search</span>
              </button>
              <Link to="/login" className="site-login-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Log in</span>
              </Link>
              <Link to="/register" className="site-signup-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
