import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/feature/StudentSidebar';

export default function StudentLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
      {/* Fixed Sidebar */}
      <StudentSidebar />

      {/* Main Content — offset by sidebar width */}
      <main
        style={{
          marginLeft: '240px',
          flex: 1,
          minHeight: '100vh',
          backgroundColor: '#f7f7f7',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
