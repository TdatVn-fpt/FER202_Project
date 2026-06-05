import React from 'react';
import { Outlet } from 'react-router-dom';

// TODO: AdminLayout sẽ được hoàn thiện sau bởi thành viên phụ trách
export default function AdminLayout() {
  return (
    <div className="admin-layout" style={{ minHeight: '100vh' }}>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
