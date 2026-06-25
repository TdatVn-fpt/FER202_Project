import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { logout, getCurrentUser } from '../services/authService';

export default function TeacherLayout() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      
      {/* Sidebar - Cố định ở bên trái */}
      <div className="bg-dark text-white p-3 d-flex flex-column shadow" style={{ width: '260px', zIndex: 1000 }}>
        <div className="text-center py-3 border-bottom border-secondary mb-4">
          <h4 className="fw-bold mb-0 text-primary">IELTS Center</h4>
          <span className="text-muted small fw-medium">Teacher Portal</span>
        </div>

        {/* Thông tin giáo viên đăng nhập */}
        <div className="d-flex align-items-center gap-2 px-2 mb-4 bg-secondary-subtle bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-20">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: '40px', height: '40px' }}>
            {currentUser?.fullName?.charAt(0) || 'T'}
          </div>
          <div className="overflow-hidden">
            <h6 className="mb-0 text-white text-truncate fw-semibold">{currentUser?.fullName || 'IELTS Instructor'}</h6>
            <span className="text-muted small">Giáo viên</span>
          </div>
        </div>

        {/* Danh sách link điều hướng */}
        <nav className="nav flex-column nav-pills flex-grow-1 gap-2">
          <NavLink 
            to="/teacher/dashboard" 
            className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded-3 text-white transition-all ${isActive ? 'bg-primary active' : 'hover-bg-secondary'}`}
          >
            <i className="bi bi-speedometer2"></i> Dashboard
          </NavLink>
          <NavLink 
            to="/teacher/courses" 
            className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded-3 text-white transition-all ${isActive ? 'bg-primary active' : 'hover-bg-secondary'}`}
          >
            <i className="bi bi-book"></i> Quản lý Khóa học
          </NavLink>
          <NavLink 
            to="/teacher/lessons" 
            className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded-3 text-white transition-all ${isActive ? 'bg-primary active' : 'hover-bg-secondary'}`}
          >
            <i className="bi bi-journal-text"></i> Quản lý Bài học
          </NavLink>
          <NavLink 
            to="/teacher/tests" 
            className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded-3 text-white transition-all ${isActive ? 'bg-primary active' : 'hover-bg-secondary'}`}
          >
            <i className="bi bi-patch-question"></i> Quản lý Đề thi
          </NavLink>
          <NavLink 
            to="/teacher/students" 
            className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded-3 text-white transition-all ${isActive ? 'bg-primary active' : 'hover-bg-secondary'}`}
          >
            <i className="bi bi-people"></i> Quản lý Học viên
          </NavLink>
          <NavLink 
            to="/teacher/flashcards" 
            className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded-3 text-white transition-all ${isActive ? 'bg-primary active' : 'hover-bg-secondary'}`}
          >
            <i className="bi bi-card-text"></i> Quản lý Flashcard
          </NavLink>
        </nav>

        {/* Nút đăng xuất ở dưới cùng */}
        <div className="pt-3 border-top border-secondary">
          <Button 
            variant="outline-danger" 
            onClick={handleLogout}
            className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-semibold border-0 hover-bg-danger text-danger"
          >
            <i className="bi bi-box-arrow-right"></i> Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Content Area - Tràn lấp không gian còn lại */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center shadow-sm">
          <span className="text-secondary small fw-medium">
            Học kỳ: Summer 2026 | FPT University
          </span>
          <span className="badge bg-success text-success-50 bg-opacity-10 border border-success border-opacity-25 rounded-pill px-3 py-2">
            Mock Server Connected
          </span>
        </header>

        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
