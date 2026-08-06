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
import Avatar from '../common/Avatar';

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
            <Avatar user={currentUser} size={34} className="asm-avatar asm-avatar-text" />
          </button>

          {open && (
            <div className="asm-user-menu">
              <div className="asm-user-menu-header">
                <Avatar user={currentUser} size={40} className="asm-user-menu-avatar" />
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