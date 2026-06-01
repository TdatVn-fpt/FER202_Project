import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Guest Pages
import Home from '../pages/guest/Home';
import Login from '../pages/guest/Login';
import Register from '../pages/guest/Register';
import CourseList from '../pages/guest/CourseList';
import CourseDetail from '../pages/guest/CourseDetail';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import MyCourses from '../pages/student/MyCourses';
import Lesson from '../pages/student/Lesson';
import StudentProfile from '../pages/student/Profile';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import CourseManagement from '../pages/teacher/CourseManagement';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';

// Layouts
import MainLayout from '../layouts/MainLayout';
import StudentLayout from '../layouts/StudentLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import AdminLayout from '../layouts/AdminLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== GUEST ROUTES ===== */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Route>

      {/* ===== STUDENT ROUTES ===== */}
      <Route element={<StudentLayout />}>
        <Route path="/learning/dashboard" element={<StudentDashboard />} />
        <Route path="/learning/courses" element={<MyCourses />} />
        <Route path="/learning/lessons/:id" element={<Lesson />} />
        <Route path="/learning/profile" element={<StudentProfile />} />
      </Route>

      {/* ===== TEACHER ROUTES ===== */}
      <Route element={<TeacherLayout />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<CourseManagement />} />
      </Route>

      {/* ===== ADMIN ROUTES ===== */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}
