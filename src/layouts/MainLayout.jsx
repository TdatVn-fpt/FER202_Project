import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
