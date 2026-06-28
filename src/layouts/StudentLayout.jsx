import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/feature/Navbar';
import Footer from '../components/feature/Footer';
import './StudentLayout.css';

export default function StudentLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('studentLayoutTheme') || 'light');

  useEffect(() => {
    localStorage.setItem('studentLayoutTheme', theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const buttonLabel = isDark ? 'Rollback nền cũ' : 'Dùng nền student mới';

  return (
    <div className="student-layout" data-student-theme={theme}>
      <Navbar variant="student" />

      <div className="student-layout__shell">
        <main className="student-layout__main">
          <div className="student-theme-toolbar">
            <button
              type="button"
              className="btn student-theme-toggle"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-pressed={isDark}
            >
              {buttonLabel}
            </button>
          </div>
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
