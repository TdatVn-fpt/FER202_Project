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

// ===== STUDENT PAGES (feature-course-learning) =====
import CourseListPage from '../pages/student/CourseListPage';
import CourseDetailPage from '../pages/student/CourseDetailPage';
import LessonPage from '../pages/student/LessonPage';
import MyCoursesPage from '../pages/student/MyCoursesPage';
import StudentDashboard from '../pages/student/Dashboard';
import StudentProfile from '../pages/student/Profile';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import CourseManagement from '../pages/teacher/CourseManagement';
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

      {/* ===== STUDENT ROUTES (feature-course-learning) ===== */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/learning/dashboard" element={<StudentDashboard />} />
          {/* My Courses — danh sách khóa đang học */}
          <Route path="/learning/my-courses" element={<MyCoursesPage />} />
          {/* Course Catalog for students */}
          <Route path="/learning/courses" element={<CourseListPage />} />
          {/* Course Detail + Enroll */}
          <Route path="/learning/courses/:id" element={<CourseDetailPage />} />
          {/* Lesson Player */}
          <Route path="/learning/courses/:courseId/lessons" element={<LessonPage />} />
          <Route path="/learning/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/learning/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* ===== TEACHER ROUTES (placeholder - phát triển sau) ===== */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<CourseManagement />} />
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
