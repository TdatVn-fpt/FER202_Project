import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import './StudentLayout.css';

export default function StudentLayout() {
  return (
    <div className="student-layout">
      <Header />
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
