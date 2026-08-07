import React from 'react';

/**
 * AvatarInitials - Hiển thị avatar:
 * - Nếu user đã đổi avatar (khác pravatar mặc định) → hiển thị ảnh
 * - Nếu chưa đổi → text avatar: hình tròn màu ngẫu nhiên + chữ cái đầu & cuối của tên
 *
 * @param {string} name - Tên người dùng
 * @param {string} avatar - URL avatar người dùng (nếu đã đổi)
 * @param {object} user - Đối tượng user (tùy chọn, chứa name & avatar)
 * @param {number} size - Kích thước avatar (px)
 * @param {string} className - Class CSS bổ sung
 */
export default function AvatarInitials({
  name = '',
  avatar = '',
  user = null,
  size = 40,
  className = '',
}) {
  const displayName = user?.name || name || '';
  const displayAvatar = user?.avatar || avatar || '';

  // Avatar mặc định của hệ thống là pravatar → coi như chưa đổi
  const isDefaultAvatar =
    !displayAvatar || displayAvatar.includes('pravatar.cc');

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
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

  // Đã đổi avatar → hiển thị ảnh
  if (!isDefaultAvatar) {
    return (
      <img
        src={displayAvatar}
        alt={displayName || 'User'}
        className={`avatar-initials ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          userSelect: 'none',
        }}
        title={displayName || 'User'}
      />
    );
  }

  // Chưa đổi avatar → hiển thị chữ cái viết tắt
  const initials = getInitials(displayName);
  const bgColor = getColorFromName(displayName);
  const fontSize = Math.max(size * 0.38, 12);

  return (
    <div
      className={`avatar-initials ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        backgroundColor: bgColor,
        color: '#fff',
        fontWeight: 700,
        fontSize,
        lineHeight: 1,
        userSelect: 'none',
      }}
      title={displayName || 'User'}
    >
      {initials}
    </div>
  );
}