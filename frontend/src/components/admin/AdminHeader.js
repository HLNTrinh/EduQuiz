import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaQuestionCircle,
  FaSignOutAlt,
  FaSun,
  FaCloudSun,
  FaMoon
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#6366f1', '#f97316'
];

// Xác định buổi trong ngày dựa trên giờ thực tế
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return { text: 'Chào buổi sáng', icon: <FaSun /> };
  if (hour >= 11 && hour < 13) return { text: 'Chào buổi trưa', icon: <FaSun /> };
  if (hour >= 13 && hour < 18) return { text: 'Chào buổi chiều', icon: <FaCloudSun /> };
  return { text: 'Chào buổi tối', icon: <FaMoon /> };
};

export default function AdminHeader({ searchQuery, setSearchQuery, showToastMessage }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth() || {};
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', close);

    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Lấy thông tin user từ AuthContext hoặc localStorage/sessionStorage
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
  const greeting = getGreeting();

  // Lấy chữ cái đầu tiên của từ cuối cùng trong tên (Ví dụ: "Duy" -> "D")
  const getInitialLetter = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ').filter(Boolean);
    const lastWord = parts[parts.length - 1];
    return lastWord ? lastWord[0].toUpperCase() : 'A';
  };

  // Tạo màu nền cố định/ngẫu nhiên theo tên
  const getAvatarBgColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const initialLetter = getInitialLetter(adminName);
  const bgColor = getAvatarBgColor(adminName);

  const handleLogout = () => {
    if (logout) logout();
  };

  return (
    <header className="asm-header">
      <div className="asm-greeting">
        <span className="asm-greeting-icon">{greeting.icon}</span>
        <span className="asm-greeting-text">{greeting.text}, {adminName}!</span>
      </div>

      <div className="asm-header-right">
        <button className="asm-icon-btn" onClick={() => navigate('/admin/notifications')}>
          <FaBell />
          <span className="asm-badge" />
        </button>
        <button className="asm-icon-btn" onClick={() => showToastMessage('Mở trang trợ giúp & Hướng dẫn.')}>
          <FaQuestionCircle />
        </button>
        <div className="asm-v-divider" />

        <div className="asm-user-profile" ref={ref}>
          <div className="asm-user-info">
            <p className="asm-user-name">{adminName}</p>
          </div>
          <button
            className="asm-avatar-btn"
            onClick={() => setOpen(!open)}
          >
            <div
              className="asm-avatar asm-avatar-text"
              style={{ backgroundColor: bgColor }}
            >
              {initialLetter}
            </div>
          </button>

          {open && (
            <div className="asm-user-menu">
              <div className="asm-user-menu-header">
                <div
                  className="asm-user-menu-avatar"
                  style={{ backgroundColor: bgColor }}
                >
                  {initialLetter}
                </div>
                <div>
                  <h3>{adminName}</h3>
                  <span>Quản trị viên</span>
                </div>
              </div>

              <button
                className="asm-menu-item logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}