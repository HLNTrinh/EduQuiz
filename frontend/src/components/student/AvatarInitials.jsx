import React from 'react';

/**
 * AvatarInitials - Hiển thị avatar đại diện (ảnh) hoặc chữ cái viết tắt của tên
 *
 * @param {string} name - Tên người dùng
 * @param {string} avatar - URL ảnh đại diện (nếu có)
 * @param {number} size - Kích thước avatar (px)
 * @param {string} className - Class CSS bổ sung
 */
export default function AvatarInitials({ name = '', avatar = '', size = 40, className = '' }) {
  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getColorFromName = (fullName) => {
    if (!fullName) return '#6366f1';
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
      '#06b6d4', '#3b82f6', '#2563eb', '#7c3aed', '#db2777',
      '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0d9488',
    ];
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const fontSize = Math.max(size * 0.38, 12);

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  };

  // Nếu có avatar, hiển thị ảnh đại diện
  if (avatar) {
    return (
      <div className={`avatar-initials ${className}`} style={baseStyle} title={name || 'User'}>
        <img
          src={avatar}
          alt={name || 'avatar'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Không có avatar → hiển thị chữ cái viết tắt
  return (
    <div
      className={`avatar-initials ${className}`}
      style={{
        ...baseStyle,
        backgroundColor: bgColor,
        color: '#fff',
        fontWeight: 700,
        fontSize,
        lineHeight: 1,
        userSelect: 'none',
      }}
      title={name || 'User'}
    >
      {initials}
    </div>
  );
}
