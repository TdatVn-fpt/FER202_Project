import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
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
