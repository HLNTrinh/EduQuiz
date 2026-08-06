import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AvatarInitials from './AvatarInitials';

const roleMap = {
  student: 'Học sinh',
  teacher: 'Giáo viên',
  admin: 'Quản trị viên',
};

export default function UserMenu({ size = 36 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabel = roleMap[user?.role] || user?.role || '';

  const profilePath =
    user?.role === 'teacher' ? '/teacher/profile' : '/student/profile';

  return (
    <div className="user-menu-wrap" ref={ref} style={{ position: 'relative' }}>
      <div
        className="user-chip"
        onClick={() => setOpen(!open)}
        style={{ cursor: 'pointer' }}
      >
        <AvatarInitials user={user} size={size} />
      </div>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <AvatarInitials user={user} size={44} />
            <div className="user-menu-info">
              <strong className="user-menu-name">{user?.name || 'Người dùng'}</strong>
              <span className="user-menu-role">{roleLabel}</span>
            </div>
          </div>
<div className="user-menu-divider" />
          <button
            className="user-menu-item"
            onClick={() => {
              setOpen(false);
              navigate(profilePath);
            }}
          >
            <ProfileIcon />
            Hồ sơ
          </button>
          <button
            className="user-menu-item user-menu-logout"
            onClick={logout}
          >
            <LogoutIcon />
            Đăng xuất
          </button>
        </div>
      )}

      <style>{`
        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          z-index: 1000;
          animation: userMenuFadeIn 0.15s ease-out;
          transform-origin: top right;
        }

        @keyframes userMenuFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .user-menu-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .user-menu-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .user-menu-name {
          font-size: 14px;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-menu-role {
          font-size: 12px;
          color: #6b7280;
        }

        .user-menu-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 0 8px;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s;
        }

        .user-menu-item:hover {
          background: #f9fafb;
        }

        .user-menu-logout {
          color: #ef4444;
          border-radius: 0 0 12px 12px;
        }

        .user-menu-logout:hover {
          background: #fef2f2;
        }
      `}</style>
    </div>
  );
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
