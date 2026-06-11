import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// ===== GUEST / PUBLIC PAGES =====
import Home from '../pages/guest/Home';
import Login from '../pages/guest/Login';
import Register from '../pages/guest/Register';
import CourseList from '../pages/guest/CourseList';
import CourseDetail from '../pages/guest/CourseDetail';
import OnlineCourses from '../pages/guest/OnlineCourses';

// ===== PLACEHOLDER PAGES (sẽ phát triển sau) =====
import StudentDashboard from '../pages/student/Dashboard';
import MyCourses from '../pages/student/MyCourses';
import Lesson from '../pages/student/Lesson';
import StudentProfile from '../pages/student/Profile';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import CourseManagement from '../pages/teacher/CourseManagement';
import CourseCreatePage from '../pages/teacher/CourseCreatePage';
import CourseEditPage from '../pages/teacher/CourseEditPage';
import LessonListPage from '../pages/teacher/LessonListPage';
import LessonCreatePage from '../pages/teacher/LessonCreatePage';
import TestListPage from '../pages/teacher/TestListPage';
import TestCreatePage from '../pages/teacher/TestCreatePage';
import QuestionBankPage from '../pages/teacher/QuestionBankPage';
import StudentTrackingPage from '../pages/teacher/StudentTrackingPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';

// ===== LAYOUTS =====
import MainLayout from '../layouts/MainLayout';
import StudentLayout from '../layouts/StudentLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import AdminLayout from '../layouts/AdminLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== GUEST / PUBLIC ROUTES (đang phát triển) ===== */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/online-courses" element={<OnlineCourses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Route>

      {/* ===== STUDENT ROUTES (placeholder - phát triển sau) ===== */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/learning/dashboard" element={<StudentDashboard />} />
          <Route path="/learning/courses" element={<MyCourses />} />
          <Route path="/learning/lessons/:id" element={<Lesson />} />
          <Route path="/learning/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* ===== TEACHER ROUTES (placeholder - phát triển sau) ===== */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<CourseManagement />} />
          <Route path="/teacher/courses/create" element={<CourseCreatePage />} />
          <Route path="/teacher/courses/:id/edit" element={<CourseEditPage />} />
          <Route path="/teacher/lessons" element={<LessonListPage />} />
          <Route path="/teacher/lessons/create" element={<LessonCreatePage />} />
          <Route path="/teacher/lessons/:id/edit" element={<LessonCreatePage />} />
          <Route path="/teacher/tests" element={<TestListPage />} />
          <Route path="/teacher/tests/create" element={<TestCreatePage />} />
          <Route path="/teacher/tests/:id/edit" element={<TestCreatePage />} />
          <Route path="/teacher/tests/:id/questions" element={<QuestionBankPage />} />
          <Route path="/teacher/students" element={<StudentTrackingPage />} />
        </Route>
      </Route>

      {/* ===== ADMIN ROUTES (placeholder - phát triển sau) ===== */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}
