import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <ul>
          <li>
            <Link to="/learning/dashboard" className="sidebar-link">
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/learning/courses" className="sidebar-link">
              📚 My Courses
            </Link>
          </li>
          <li>
            <Link to="/learning/profile" className="sidebar-link">
              👤 Profile
            </Link>
          </li>
          <li>
            <a href="#settings" className="sidebar-link">
              ⚙️ Settings
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
