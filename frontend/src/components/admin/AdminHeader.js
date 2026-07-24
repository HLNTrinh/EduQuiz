import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaBell,
  FaQuestionCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#6366f1', '#f97316'
];

export default function AdminHeader({ searchQuery, setSearchQuery, showToastMessage }) {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

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

  return (
    <header className="asm-header">
      <div className="asm-search-container">
        <FaSearch className="asm-search-icon" />
        <input
          type="text"
          className="asm-search-input"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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

        <div className="asm-user-profile">
          <div className="asm-user-info">
            <p className="asm-user-name">{adminName}</p>
          </div>
          <div
            className="asm-avatar asm-avatar-text"
            style={{ backgroundColor: bgColor }}
          >
            {initialLetter}
          </div>
        </div>
      </div>
    </header>
  );
}
