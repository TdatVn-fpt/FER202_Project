import React from 'react';
import { Outlet } from 'react-router-dom';

// TODO: TeacherLayout sẽ được hoàn thiện sau bởi thành viên phụ trách
export default function TeacherLayout() {
  return (
    <div className="teacher-layout" style={{ minHeight: '100vh' }}>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
