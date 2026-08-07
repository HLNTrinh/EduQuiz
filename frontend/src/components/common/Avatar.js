import React from 'react';

const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#d946ef',
  '#0ea5e9', '#22c55e', '#eab308', '#a855f7', '#f43f5e', '#64748b'
];

// Lấy 2 chữ cái đầu và cuối của tên (VD: "Nguyễn Văn A" -> "NA")
const getInitials = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Tạo màu cố định dựa trên tên
const getColorFromName = (name = '') => {
  let hash = 0;
  const str = name || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Component Avatar dùng chung cho toàn hệ thống.
 * - Nếu user có avatar KHÁC pravatar mặc định (đã đổi avatar) -> hiển thị ảnh
 * - Nếu chưa đổi avatar (null hoặc vẫn là pravatar) -> hiển thị text avatar
 *   (hình tròn màu ngẫu nhiên cố định + chữ cái đầu & cuối của tên)
 */
export default function Avatar({ user, name, avatar, size = 40, className = '', style = {} }) {
  const displayName = user?.name || name || '';
  const displayAvatar = user?.avatar || avatar || '';

  // Avatar mặc định của hệ thống là pravatar -> coi như chưa đổi
  const isDefaultAvatar = !displayAvatar || displayAvatar.includes('pravatar.cc');

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    ...style,
  };

  // Đã đổi avatar -> hiển thị ảnh
  if (!isDefaultAvatar) {
    return (
      <img
        src={displayAvatar}
        alt={displayName}
        className={className}
        style={{
          ...baseStyle,
          objectFit: 'cover',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      />
    );
  }

  // Chưa đổi avatar -> text avatar (màu + chữ đầu/cuối)
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        background: getColorFromName(displayName),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: size > 60 ? 32 : size > 40 ? 18 : 14,
        border: '2px solid #fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      {getInitials(displayName)}
    </div>
  );
}