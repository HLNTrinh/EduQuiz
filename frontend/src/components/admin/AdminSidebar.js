import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaBookOpen, 
  FaChalkboardTeacher, 
  FaBell, 
  FaCog, 
  FaSignOutAlt 
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ isSidebarOpen, setIsSidebarOpen, showToastMessage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Các mục chính (phần trên)
  const mainNavItems = [
    { id: 'dashboard', name: 'Tổng quan', icon: <MdDashboard />, path: '/admin/dashboard' },
    { id: 'users', name: 'Quản lý người dùng', icon: <FaUsers />, path: '/admin/users' },
    { id: 'subjects', name: 'Môn học', icon: <FaBookOpen />, path: '/admin/subject' },
    { id: 'classes', name: 'Lớp học', icon: <FaChalkboardTeacher />, path: '/admin/class' },
    { id: 'notifications', name: 'Thông báo', icon: <FaBell />, path: '/admin/notifications' },
  ];

  // Mục cài đặt (phần dưới, trên nút đăng xuất)
  const settingsItem = { id: 'settings', name: 'Cài đặt', icon: <FaCog />, path: '/admin/settings' };

  // Xác định item active dựa trên đường dẫn hiện tại
  const getActiveId = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/users')) return 'users';
    if (path.includes('/subject')) return 'subjects';
    if (path.includes('/class')) return 'classes';
    if (path.includes('/notifications')) return 'notifications';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsSidebarOpen(false);
  };

  return (
    <aside className={`asm-sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="asm-logo-section">
        <div className="asm-logo-icon-box">
          <FaGraduationCap />
        </div>
        <div className="asm-logo-text">
          <span className="asm-logo-title">EduQuiz</span>
          <span className="asm-logo-subtitle">Hệ thống quản lý thi</span>
        </div>
      </div>

      {/* Navigation chính - phần trên */}
      <nav className="asm-nav">
        {mainNavItems.map((item) => (
          <div 
            key={item.id}
            className={`asm-nav-item ${getActiveId() === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item)}
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        ))}
      </nav>

      {/* Divider ngăn cách */}
      <div className="asm-divider" />

      {/* Mục Cài đặt - ở dưới cùng */}
      <div className="asm-settings-section">
        <div 
          className={`asm-nav-item ${getActiveId() === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavigation(settingsItem)}
        >
          {settingsItem.icon}
          <span>{settingsItem.name}</span>
        </div>
      </div>

      {/* Nút Đăng xuất */}
      <div className="asm-logout-item" onClick={() => {
        logout();
      }}>
        <FaSignOutAlt className="asm-logout-icon" />
        <span>Đăng xuất</span>
      </div>
    </aside>
  );
}