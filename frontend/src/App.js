import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage, RegisterPage } from "./pages/AuthPages";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboardPage from "./layouts/StudentDashboardPage";
import ExamList from "./layouts/ExamList";
import Results from "./layouts/Results";
import Profile from "./layouts/Profile";
//Trang giáo viên
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { ExamManager } from "./pages/ExamManager";
import { QuestionManager } from "./pages/QuestionManager";
import { MembersPage } from "./pages/MembersPage";
import { ResultPage } from "./pages/ResultPage";
import { TakeQuizPage } from "./pages/TakeQuizPage";

import "./App.css";

// Trang admin
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import AdminSubjectManagementPage from "./pages/AdminSubjectManagementPage";
import AdminClassManagementPage from "./pages/AdminClassManagementPage";
import AdminNotificationManagementPage from "./pages/AdminNotificationManagementPage";
import AdminSettingManagementPage from "./pages/AdminSettingManagementPage";
import EduQuizPage from "./pages/EduQuizPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>;

  return (
    <Routes>
      {!user ? (
        <>
          {/* ===== Public routes ===== */}
          <Route path="/" element={<EduQuizPage />} />
          <Route path="/home" element={<EduQuizPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* ================= STUDENT ================= */}
          {user.role === "student" && (
            <>
              <Route path="/student" element={<StudentLayout />}>
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="exams" element={<ExamList />} />
                <Route path="results" element={<Results />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="/quiz/:quizId" element={<TakeQuizPage />} />
            </>
          )}

          {/* ================= TEACHER ================= */}
          {user.role === "teacher" && (
            <>
              <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
              <Route path="/teacher/exams" element={<ExamManager />} />
              <Route path="/teacher/questions" element={<QuestionManager />} />
              <Route path="/teacher/members" element={<MembersPage />} />
              <Route path="/teacher/results" element={<ResultPage />} />
            </>
          )}

          {/* ================= ADMIN ================= */}
          {user.role === "admin" && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUserManagementPage />} />
              <Route path="/admin/subject" element={<AdminSubjectManagementPage />} />
              <Route path="/admin/subjects" element={<AdminSubjectManagementPage />} />
              <Route path="/admin/class" element={<AdminClassManagementPage />} />
              <Route path="/admin/notifications" element={<AdminNotificationManagementPage />}/>
              <Route path="/admin/settings"  element={<AdminSettingManagementPage />} />
            </>
          )}

          {/* Route mặc định sau khi đăng nhập */}
          <Route path="*" element={<Navigate to={`/${user.role}/dashboard`} replace />}
          />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}