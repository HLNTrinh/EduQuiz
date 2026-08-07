import React, { useState, useEffect, useMemo } from 'react';
import { FaBars, FaGraduationCap, FaCheckCircle } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import '../../styles/AdminSettingManagement.css';

export default function AdminLayout({ children, pageTitle, pageSubtitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { user } = useAuth() || {};

  const currentUser = useMemo(() => {
    if (user) return user;
    try {
      const local = localStorage.getItem('user');
      const session = sessionStorage.getItem('user');
      return JSON.parse(local || session || '{}');
    } catch {
      return {};
    }
  }, [user]);

  const adminName = currentUser?.name || 'Quản trị viên';

  // Auto-hide toast notification after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <div className="asm-wrapper">
      {/* Mobile Header bar */}
      <div className="asm-mobile-header">
        <button className="asm-hamburger" onClick={() => setIsSidebarOpen(true)}>
          <FaBars />
        </button>
        <div className="asm-mobile-brand">
          <div className="asm-logo-icon-box asm-logo-icon-box-small">
            <FaGraduationCap />
          </div>
          <span className="asm-mobile-brand-text">EduQuiz</span>
        </div>
        <Avatar user={currentUser} size={32} className="asm-mobile-avatar-text" />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="asm-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        showToastMessage={showToastMessage}
      />

      {/* Main Container */}
      <div className="asm-main">
        <AdminHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showToastMessage={showToastMessage}
        />

        {/* Nội dung trang */}
        <main className="asm-content">
          {pageTitle && (
            <header className="asm-page-header">
              <h1 className="asm-page-title">{pageTitle}</h1>
              {pageSubtitle && <p className="asm-page-subtitle">{pageSubtitle}</p>}
            </header>
          )}
          {children}
        </main>
      </div>

      {/* Dynamic Success Toast Message */}
      {showToast && (
        <div className="asm-toast">
          <FaCheckCircle className="asm-toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}