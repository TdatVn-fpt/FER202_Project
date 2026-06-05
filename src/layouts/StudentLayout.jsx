import React from 'react';
import { Outlet } from 'react-router-dom';

// TODO: StudentLayout sẽ được hoàn thiện sau bởi thành viên phụ trách
export default function StudentLayout() {
  return (
    <div className="student-layout" style={{ minHeight: '100vh' }}>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
