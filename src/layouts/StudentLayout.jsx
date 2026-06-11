import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';

export default function StudentLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="student-layout" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* ── Top Navigation Bar ── */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#0052ff' }}>
        <div className="container-fluid px-4">
          {/* Brand */}
          <NavLink className="navbar-brand fw-bold" to="/learning/courses">
            🎓 IELTS Master
          </NavLink>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#studentNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links */}
          <div className="collapse navbar-collapse" id="studentNav">
            <ul className="navbar-nav me-auto gap-1">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link px-3 rounded ${isActive ? 'active fw-semibold bg-white bg-opacity-25' : ''}`
                  }
                  to="/learning/courses"
                >
                  📚 Course Catalog
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link px-3 rounded ${isActive ? 'active fw-semibold bg-white bg-opacity-25' : ''}`
                  }
                  to="/learning/my-courses"
                >
                  🎯 My Courses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link px-3 rounded ${isActive ? 'active fw-semibold bg-white bg-opacity-25' : ''}`
                  }
                  to="/learning/dashboard"
                >
                  📊 Dashboard
                </NavLink>
              </li>
            </ul>

            {/* User Info + Logout */}
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              {user && (
                <li className="nav-item">
                  <span className="navbar-text text-white small">
                    👤 {user.fullName || user.name || user.email}
                  </span>
                </li>
              )}
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm rounded-pill px-3"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
