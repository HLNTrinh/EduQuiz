import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import {
  FaGraduationCap,
  FaUsers,
  FaBookOpen,
  FaSchool,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaPaperPlane,
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaClock,
  FaEye,
  FaUser,
  FaBars,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaThLarge,
  FaBell,
  FaQuestionCircle,
  FaPlus
} from 'react-icons/fa';
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  togglePinNotification,
} from '../services/adminService';
import '../styles/AdminNotificationManagement.css';

export default function AdminNotificationManagementPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // all, pinned, draft
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [pinHome, setPinHome] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // Success toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Fetch notifications từ API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications({ search: searchQuery, tab: filterTab });
      setNotifications(res.notifications || []);
    } catch (error) {
      triggerToast(error.message || 'Lỗi tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      triggerToast('Vui lòng điền đầy đủ tiêu đề và nội dung!');
      return;
    }

    try {
      if (editingId) {
        await updateNotification(editingId, {
          title,
          content,
          pinned: pinHome,
        });
        triggerToast('Cập nhật thông báo thành công!');
        setEditingId(null);
      } else {
        await createNotification({
          title,
          content,
          pinned: pinHome,
        });
        triggerToast('Đã gửi thông báo mới thành công!');
      }

      // Reset Form
      setTitle('');
      setContent('');
      setSendEmail(false);
      setPinHome(false);
      setPushNotification(true);
      fetchNotifications();
    } catch (error) {
      triggerToast(error.message || 'Lỗi khi lưu thông báo');
    }
  };

  const handleEdit = (notif) => {
    setEditingId(notif._id || notif.id);
    setTitle(notif.title);
    setContent(notif.content);
    setPinHome(notif.pinned || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      triggerToast('Đã xóa thông báo thành công!');
      if (editingId === id) {
        setEditingId(null);
        setTitle('');
        setContent('');
        setPinHome(false);
      }
      fetchNotifications();
    } catch (error) {
      triggerToast(error.message || 'Lỗi khi xóa thông báo');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await togglePinNotification(id);
      triggerToast(res.message || 'Đã thay đổi trạng thái ghim!');
      fetchNotifications();
    } catch (error) {
      triggerToast(error.message || 'Không thể thay đổi trạng thái ghim');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSendEmail(false);
    setPinHome(false);
    setPushNotification(true);
    triggerToast('Đã hủy thao tác soạn thảo');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${mins} - ${date}/${month}/${year}`;
  };

  return (
    <AdminLayout pageTitle="Quản lý Thông báo" pageSubtitle="Gửi thông tin cập nhật và quản lý danh sách thông báo trên toàn hệ thống.">
      {/* Workspace Body */}
      <main className="page-body">
        {/* Create Notification Panel */}
        <section className="management-panel">
          <div className="panel-header">
            <h3>
              <span className="panel-header-icon"><FaBullhorn /></span>
              {editingId !== null ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
            </h3>
            <span className="header-tag">Gửi toàn hệ thống</span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleCreateOrUpdate}>
              <div className="form-group">
                <label className="form-label">Tiêu đề thông báo</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề ngắn gọn (VD: Lịch nghỉ lễ Quốc khánh 2/9)"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung chi tiết</label>
                <textarea
                  placeholder="Nhập nội dung thông báo cho người dùng..."
                  className="form-input form-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="form-footer">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                    />
                    <span>Gửi qua Email</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={pinHome}
                      onChange={(e) => setPinHome(e.target.checked)}
                    />
                    <span>Ghim lên đầu trang chủ</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={pushNotification}
                      onChange={(e) => setPushNotification(e.target.checked)}
                    />
                    <span>Thông báo đẩy (Push Notification)</span>
                  </label>
                </div>

                <button type="submit" className="submit-btn">
                  <span className="btn-icon"><FaPaperPlane /></span>
                  <span>{editingId !== null ? 'Cập nhật ngay' : 'Gửi thông báo ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* List Section */}
        <section className="management-panel">
          <div className="panel-header">
            <h3>
              <span className="panel-header-icon"><FaBullhorn /></span>
              Danh sách thông báo đã gửi
            </h3>
            <div className="filter-wrapper">
              <div className="filter-pills">
                <button
                  className={`filter-pill ${filterTab === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterTab('all')}
                >
                  Tất cả
                </button>
                <button
                  className={`filter-pill ${filterTab === 'pinned' ? 'active' : ''}`}
                  onClick={() => setFilterTab('pinned')}
                >
                  Đã ghim
                </button>
                <button
                  className={`filter-pill ${filterTab === 'draft' ? 'active' : ''}`}
                  onClick={() => setFilterTab('draft')}
                >
                  Bản nháp
                </button>
              </div>
              <a href="#view-all" className="view-all-link" onClick={(e) => { e.preventDefault(); triggerToast('Đang tải toàn bộ dữ liệu thông báo...'); }}>
                Xem tất cả &rarr;
              </a>
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', fontSize: '14px' }}>
                Đang tải dữ liệu thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', fontSize: '14px' }}>
                Không tìm thấy thông báo phù hợp.
              </div>
            ) : (
              notifications.map(notif => {
                const notifId = notif._id || notif.id;
                const isPinned = notif.pinned || notif.status === 'pinned';
                const statusLabel = isPinned ? 'Đã ghim' : 'Thành công';
                const senderName = notif.sender?.name || notif.senderName || 'Quản trị viên';

                return (
                  <div key={notifId} className="notification-item">
                    <div className="item-left">
                      <div className={`item-status-icon ${isPinned ? 'pinned' : 'success'}`}>
                        {isPinned ? <FaBullhorn /> : <FaCheckCircle />}
                      </div>
                      <div className="item-details">
                        <div className="item-title-row">
                          <h4 className="item-title">{notif.title}</h4>
                          <span className={`status-badge ${isPinned ? 'pinned' : 'success'}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="item-content">{notif.content}</p>
                        <div className="item-meta">
                          <div className="meta-group">
                            <span className="meta-icon"><FaClock /></span>
                            <span>{formatTime(notif.createdAt || notif.time)}</span>
                          </div>
                          <div className="meta-group">
                            <span className="meta-icon"><FaEye /></span>
                            <span>{notif.views || 0} lượt xem</span>
                          </div>
                          <div className="meta-group">
                            <span className="meta-icon"><FaUser /></span>
                            <span>Bởi: {senderName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className="action-btn"
                        title={isPinned ? 'Bỏ ghim' : 'Ghim bài'}
                        onClick={() => handleTogglePin(notifId)}
                      >
                        <FaBullhorn style={{ color: isPinned ? '#f59e0b' : '#94a3b8' }} />
                      </button>
                      <button
                        className="action-btn"
                        title="Chỉnh sửa"
                        onClick={() => handleEdit(notif)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn"
                        title="Xóa"
                        onClick={() => handleDelete(notifId)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={() => triggerToast('Hệ thống đã tải tất cả thông báo hiện có.')}
            >
              Tải thêm thông báo cũ hơn
            </button>
          </div>
        </section>

        {/* Bottom Action bar */}
        <div className="page-footer-bar">
          <p className="footer-notice">
            * Các thông báo ghim sẽ tự động hiển thị nổi bật trên Dashboard của học sinh và giáo viên.
          </p>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={handleCancelEdit}>
              Hủy soạn thảo
            </button>
            <button className="save-config-btn" onClick={() => triggerToast('Đã lưu cấu hình thông báo lên hệ thống!')}>
              <span className="btn-icon"><FaSave /></span>
              Lưu cấu hình thông báo
            </button>
          </div>
        </div>
      </main>

      {/* Floating alert toast */}
      {showToast && (
        <div className="alert-toast">
          <FaCheckCircle style={{ fontSize: '18px' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </AdminLayout>
  );
}