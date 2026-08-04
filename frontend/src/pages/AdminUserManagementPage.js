import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminUserManagement.css';
import { 
  Search, 
  UserPlus, 
  Eye, 
  EyeOff,
  Edit, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ArrowUpRight, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  getUsers,
  createUser,
  updateUser,
  toggleLockUser,
} from '../services/adminService';

export default function AdminUserManagementPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'active',
    phone: '',
    password: ''
  });

  const showToast = (message) => {
    setToast(message);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch users từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      };
      const res = await getUsers(params);
      setUsers(res.users || []);
      setTotalUsers(res.total || 0);
    } catch (error) {
      showToast('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi filter/page thay đổi
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset về trang 1 khi đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter]);

  // Map role từ API (en) sang UI (vi)
  const mapRoleToUI = (role) => {
    const map = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Học sinh' };
    return map[role] || role;
  };

  const mapRoleToAPI = (roleUI) => {
    const map = { 'Quản trị viên': 'admin', 'Giáo viên': 'teacher', 'Học sinh': 'student' };
    return map[roleUI] || roleUI;
  };

  const mapStatusToUI = (status) => {
    const map = { active: 'Hoạt động', blocked: 'Đã khóa', inactive: 'Ngưng hoạt động' };
    return map[status] || status;
  };

  const mapStatusToAPI = (statusUI) => {
    const map = { 'Hoạt động': 'active', 'Đã khóa': 'blocked' };
    return map[statusUI] || statusUI;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Vui lòng điền đầy đủ Họ tên và Email!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password || '123456',
        role: mapRoleToAPI(formData.role),
        phone: formData.phone || '',
      };
      const res = await createUser(payload);
      showToast(`Đã thêm thành công người dùng ${res.user.name}!`);
      setIsAddModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      showToast(error.message || 'Lỗi khi thêm người dùng');
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: mapRoleToUI(user.role),
      status: mapStatusToUI(user.status),
      phone: user.phone || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  // Save Edit User
  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Vui lòng điền đầy đủ Họ tên và Email!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: mapRoleToAPI(formData.role),
        status: mapStatusToAPI(formData.status),
        phone: formData.phone || '',
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      await updateUser(selectedUser._id, payload);
      showToast(`Đã cập nhật thông tin người dùng ${formData.name}!`);
      setIsEditModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      showToast(error.message || 'Lỗi khi cập nhật người dùng');
    }
  };

  // Toggle Lock/Unlock User
  const handleToggleLock = async (user) => {
    // Không cho phép admin khóa chính mình
    if (currentAdmin?._id === user._id) {
      showToast('Bạn không thể khóa tài khoản của chính mình!', 'error');
      return;
    }
    try {
      const res = await toggleLockUser(user._id);
      showToast(res.message || `Đã thay đổi trạng thái của ${user.name}`);
      fetchUsers();
    } catch (error) {
      showToast(error.message || 'Lỗi khi thay đổi trạng thái');
    }
  };

  // Open Detail Modal
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'student',
      status: 'active',
      phone: '',
      password: ''
    });
    setSelectedUser(null);
  };

  // Pagination
  const totalPages = Math.ceil(totalUsers / itemsPerPage) || 1;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalUsers);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
    showToast('Đã đặt lại các bộ lọc tìm kiếm');
  };

  // Helper: lấy chữ cái đầu cho avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Helper: tạo màu ngẫu nhiên nhưng cố định dựa trên tên người dùng
  const getColorFromName = (name) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', 
      '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#d946ef',
      '#0ea5e9', '#22c55e', '#eab308', '#a855f7', '#f43f5e', '#64748b'
    ];
    let hash = 0;
    const str = name || '';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <AdminLayout pageTitle="Quản lý người dùng" pageSubtitle="Xem, tìm kiếm và quản lý phân quyền cho tất cả thành viên trong hệ thống.">
      {/* Header */}
      <div className="page-intro-section">
        <button className="add-user-primary-btn" onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
          <UserPlus size={18} />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="dashboard-top-grid">
        <div className="filters-container-card">
          <div className="filters-row">
            <div className="filter-group search-detail">
              <label className="filter-label">Tìm kiếm chi tiết</label>
              <div className="filter-input-wrapper">
                <Search className="filter-search-icon" />
                <input 
                  type="text" 
                  placeholder="Tên, email hoặc ID..." 
                  className="filter-text-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Vai trò</label>
              <select 
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học sinh</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Trạng thái</label>
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="blocked">Đã khóa</option>
              </select>
            </div>

            {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button className="clear-filters-btn" title="Đặt lại bộ lọc" onClick={clearAllFilters}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="stats-info-card">
          <div>
            <p className="stats-card-label">Tổng người dùng</p>
            <h3 className="stats-card-value">{totalUsers}</h3>
          </div>
          <div className="stats-card-trend">
            <ArrowUpRight size={13} />
            <span>Dữ liệu hệ thống</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-data-card">
        <div className="table-responsive-container">
          <table className="users-list-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên & Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-light)' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id || index}>
                    <td className="user-id-cell">#{user._id?.slice(-6)?.toUpperCase() || '---'}</td>
                    <td>
                      <div className="user-profile-cell">
                        <div className="table-user-avatar-text" style={{ background: getColorFromName(user.name) }}>
                          {getInitial(user.name)}
                        </div>
                        <div className="user-profile-info">
                          <p className="user-full-name">{user.name}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-role ${
                        user.role === 'admin' ? 'admin' : 
                        user.role === 'teacher' ? 'teacher' : 'student'
                      }`}>
                        {mapRoleToUI(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-indicator ${user.status === 'active' ? 'active' : 'locked'}`}>
                        <span className={`status-dot ${user.status === 'active' ? 'active' : 'locked'}`}></span>
                        {mapStatusToUI(user.status)}
                      </span>
                    </td>
                    <td className="date-text">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-group">
                        <button className="table-action-btn view" title="Xem chi tiết"
                          onClick={() => openDetailModal(user)}>
                          <Eye size={16} />
                        </button>
                        <button className="table-action-btn edit" title="Chỉnh sửa"
                          onClick={() => openEditModal(user)}>
                          <Edit size={16} />
                        </button>
                        <button 
                          className={`table-action-btn ${user.status === 'active' ? 'lock' : 'unlock'}`} 
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          onClick={() => handleToggleLock(user)}>
                          {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-light)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={28} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy người dùng nào phù hợp</p>
                      <p style={{ margin: 0, fontSize: '13px' }}>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-section-bar">
          <p className="pagination-stats">
            Hiển thị <span>{totalUsers === 0 ? 0 : indexOfFirstItem + 1} - {indexOfLastItem}</span> trong số <span>{totalUsers}</span> người dùng
          </p>
          <div className="pagination-buttons">
            <button className="page-arrow-btn" onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}>
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button key={pageNum}
                className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}>
                {pageNum}
              </button>
            ))}

            <button className="page-arrow-btn" onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-user-modal-header">
              <h3>Thêm người dùng mới</h3>
              <button className="close-modal-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="modal-form">
                  <div className="form-field">
                    <label className="form-label">Họ và tên *</label>
                    <input type="text" name="name" value={formData.name}
                      onChange={handleInputChange} placeholder="Nhập họ và tên" 
                      className="admin-user-form-input" required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Địa chỉ Email *</label>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleInputChange} placeholder="Nhập địa chỉ email" 
                      className="admin-user-form-input" required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" name="phone" value={formData.phone}
                      onChange={handleInputChange} placeholder="Nhập số điện thoại" 
                      className="admin-user-form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Vai trò</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Mật khẩu</label>
                    <input type="password" name="password" value={formData.password}
                      onChange={handleInputChange} className="admin-user-form-input"
                      placeholder="Nhập mật khẩu (mặc định: 123456)" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-user-modal-header">
              <h3>Chỉnh sửa tài khoản</h3>
              <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="modal-body">
                <div className="modal-form">
                  <div className="form-field">
                    <label className="form-label">Họ và tên *</label>
                    <input type="text" name="name" value={formData.name}
                      onChange={handleInputChange} placeholder="Nhập họ và tên" 
                      className="admin-user-form-input" required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Địa chỉ Email *</label>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleInputChange} placeholder="Nhập địa chỉ email" 
                      className="admin-user-form-input" required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" name="phone" value={formData.phone}
                      onChange={handleInputChange} placeholder="Nhập số điện thoại" 
                      className="admin-user-form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Vai trò</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Mật khẩu hiện tại</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                      <input type={showCurrentPassword ? 'text' : 'password'}
                        className="admin-user-form-input" value={showCurrentPassword ? (selectedUser?.password || selectedUser?._id) : '●●●●●●●●'}
                        style={{ flex: 1 }} disabled />
                      <button type="button" className="btn-icon-eye"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Mật khẩu mới</label>
                    <input type="password" name="password" value={formData.password}
                      onChange={handleInputChange} placeholder="Để trống nếu không đổi" 
                      className="admin-user-form-input" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="modal-overlay-backdrop" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-content-card detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-user-modal-header">
              <h3>Chi tiết người dùng</h3>
              <button className="close-modal-btn" onClick={() => setIsDetailModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-profile-header">
                <div className="detail-avatar-large-text" style={{ background: getColorFromName(selectedUser.name) }}>
                  {getInitial(selectedUser.name)}
                </div>
                <h4>{selectedUser.name}</h4>
                <p>{selectedUser.email}</p>
                <span className={`badge-role ${
                  selectedUser.role === 'admin' ? 'admin' : 
                  selectedUser.role === 'teacher' ? 'teacher' : 'student'
                }`}>
                  {mapRoleToUI(selectedUser.role)}
                </span>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Mã số tài khoản:</span>
                  <span className="info-value">#{selectedUser._id?.slice(-6)?.toUpperCase() || '---'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{selectedUser.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Trạng thái:</span>
                  <span className={`status-indicator ${selectedUser.status === 'active' ? 'active' : 'locked'}`}>
                    <span className={`status-dot ${selectedUser.status === 'active' ? 'active' : 'locked'}`}></span>
                    {mapStatusToUI(selectedUser.status)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày đăng ký:</span>
                  <span className="info-value">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : '---'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setIsDetailModalOpen(false)}>Đóng lại</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle size={16} />
          <span>{toast}</span>
        </div>
      )}
    </AdminLayout>
  );
}
