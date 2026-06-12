import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/feature/Navbar';
import Footer from '../components/feature/Footer';

export default function StudentLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
      <Navbar variant="student" />

      <div style={{ display: 'flex', flex: 1, width: '100%' }}>
        {/* Main Content */}
        <main
          style={{
            flex: 1,
            backgroundColor: '#f7f7f7',
            paddingBottom: '60px'
          }}
        >
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
