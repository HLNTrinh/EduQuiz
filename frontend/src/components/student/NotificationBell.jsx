import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/services';

const NOTIF_ICONS = {
  new_quiz: '📝',
  deadline: '⏰',
  expired: '⌛',
  admin: '📢',
};

const NOTIF_COLORS = {
  new_quiz: '#4f6ef7',
  deadline: '#f59e0b',
  expired: '#ef4444',
  admin: '#8b5cf6',
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getStudentNotifications({ limit: 20 });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif) => {
    setShowDropdown(false);
    if (notif.quizId) {
      navigate(`/quiz/${notif.quizId}`);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Thông báo"
      >
        🔔
        {unreadCount > 0 && <span className="bell-dot" />}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo</h3>
            <span className="notification-count">{notifications.length} thông báo</span>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">Không có thông báo nào</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.type === 'expired' ? 'expired' : ''} ${notif.type === 'deadline' ? 'deadline' : ''} ${notif.type === 'new_quiz' ? 'new-quiz' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div
                    className="notification-icon"
                    style={{ backgroundColor: NOTIF_COLORS[notif.type] || '#6b7280' }}
                  >
                    {NOTIF_ICONS[notif.type] || '📌'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.content}</div>
                    <div className="notification-time">{formatTime(notif.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
