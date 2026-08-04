import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { 
  MdMenuBook, 
  MdSearch, 
  MdHelpOutline, 
  MdAddCircle, 
  MdLibraryBooks, 
  MdCheckCircle, 
  MdPending, 
  MdFilterList, 
  MdVisibility, 
  MdEdit, 
  MdDelete, 
  MdChevronLeft, 
  MdChevronRight, 
  MdClose,
  MdSchool
} from 'react-icons/md';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../services/adminService';
import '../styles/AdminSubjectManagement.css';

export default function AdminSubjectManagementPage() {
  // State managers
  const [subjects, setSubjects] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pausedCount, setPausedCount] = useState(0);
  const [deptCount, setDeptCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modal Control States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Form State
  const [modalType, setModalType] = useState('add');
  const [currentSubject, setCurrentSubject] = useState(null);
  const [formValues, setFormValues] = useState({
    code: '',
    name: '',
    department: 'Khoa học tự nhiên',
    status: 'active'
  });

  // Notification Toast States
  const [toast, setToast] = useState(null);

  // Auto-hide Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Lấy danh sách departments từ subjects (dùng cho combobox)
  const departmentOptions = [...new Set(subjects.map(s => s.department))].sort();

  // Fetch subjects từ API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        department: selectedDept,
      };
      const res = await getSubjects(params);
      setSubjects(res.subjects || []);
      setTotalItems(res.total || 0);
      setActiveCount(res.activeCount || 0);
      setPausedCount(res.pausedCount || 0);
      setDeptCount(res.deptCount || 0);
    } catch (error) {
      showToast('Lỗi tải danh sách môn học', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [currentPage, selectedDept]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchSubjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDept]);

  // Tính toán phân trang
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Map status
  const mapStatusToUI = (status) => {
    const map = { active: 'Đang hoạt động', inactive: 'Tạm dừng' };
    return map[status] || status;
  };

  const mapStatusToAPI = (statusUI) => {
    const map = { 'Đang hoạt động': 'active', 'Tạm dừng': 'inactive' };
    return map[statusUI] || statusUI;
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open Modal
  const openAddModal = () => {
    setModalType('add');
    setFormValues({
      code: '',
      name: '',
      department: 'Khoa học tự nhiên',
      status: 'active'
    });
    setShowAddEditModal(true);
  };

  const openEditModal = (subject) => {
    setModalType('edit');
    setCurrentSubject(subject);
    setFormValues({
      code: subject.code,
      name: subject.name,
      department: subject.department,
      status: subject.status
    });
    setShowAddEditModal(true);
  };

  const openDeleteModal = (subject) => {
    setCurrentSubject(subject);
    setShowDeleteModal(true);
  };

  const openViewModal = (subject) => {
    setCurrentSubject(subject);
    setShowViewModal(true);
  };

  // Submit operations
  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!formValues.code.trim() || !formValues.name.trim()) {
      showToast('Vui lòng điền đầy đủ mã môn và tên môn học!', 'error');
      return;
    }

    try {
      if (modalType === 'add') {
        await createSubject({
          code: formValues.code,
          name: formValues.name,
          department: formValues.department,
          status: formValues.status,
        });
        showToast(`Đã thêm môn học "${formValues.name}" thành công!`, 'success');
      } else {
        await updateSubject(currentSubject._id, {
          code: formValues.code,
          name: formValues.name,
          department: formValues.department,
          status: formValues.status,
        });
        showToast(`Cập nhật môn học "${formValues.name}" thành công!`, 'success');
      }
      setShowAddEditModal(false);
      fetchSubjects();
    } catch (error) {
      showToast(error.message || 'Lỗi khi lưu môn học', 'error');
    }
  };

  const handleDeleteSubject = async () => {
    try {
      await deleteSubject(currentSubject._id);
      showToast(`Đã xóa môn học "${currentSubject.name}" khỏi hệ thống!`, 'info');
      setShowDeleteModal(false);
      fetchSubjects();
    } catch (error) {
      showToast(error.message || 'Lỗi khi xóa môn học', 'error');
    }
  };

  // Stat summary
  const totalCount = totalItems;

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className="toast-container" id="toastContainer">
          <div className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' && <MdCheckCircle />}
              {toast.type === 'error' && <MdClose />}
              {toast.type === 'info' && <MdPending />}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="page-view">
        {/* Stats */}
        <div className="bento-stats" id="bentoStats">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <MdLibraryBooks />
            </div>
            <div className="stat-info">
              <p>Tổng môn học</p>
              <h3>{loading ? '...' : (totalCount < 10 ? `0${totalCount}` : totalCount)}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <MdCheckCircle />
            </div>
            <div className="stat-info">
              <p>Đang hoạt động</p>
              <h3>{loading ? '...' : (activeCount < 10 ? `0${activeCount}` : activeCount)}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper orange">
              <MdPending />
            </div>
            <div className="stat-info">
              <p>Tạm dừng</p>
              <h3>{loading ? '...' : (pausedCount < 10 ? `0${pausedCount}` : pausedCount)}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper purple">
              <MdSchool />
            </div>
            <div className="stat-info">
              <p>Số khoa/ngành</p>
              <h3>{loading ? '...' : (deptCount < 10 ? `0${deptCount}` : deptCount)}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container" id="filtersContainer">
          <div className="filter-search-box">
            <MdSearch className="filter-search-icon" />
            <input 
              type="text" 
              placeholder="Tìm mã hoặc tên môn học..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-right">
             <select 
               className="custom-select" 
               value={selectedDept}
               onChange={(e) => setSelectedDept(e.target.value)}
             >
               <option value="all">Tất cả khoa/ngành</option>
               {departmentOptions.map((dept, idx) => (
                 <option key={idx} value={dept}>{dept}</option>
               ))}
             </select>

            <button className="btn-primary" onClick={openAddModal} id="btnAddSubject">
              <MdAddCircle className="btn-primary-icon" />
              <span>Thêm môn học mới</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-card" id="tableCard">
          <div className="table-responsive">
            <table className="subjects-table">
              <thead>
                <tr>
                  <th>Mã môn học</th>
                  <th>Tên môn học</th>
                  <th>Khoa/Ngành</th>
                  <th>Số lượng đề thi</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <tr key={subject._id}>
                      <td>
                        <span className="subject-code-badge">{subject.code}</span>
                      </td>
                      <td>
                        <div className="subject-name-cell">
                          <span className="subject-name">{subject.name}</span>
                          <span className="subject-update-time">
                            Cập nhật: {subject.updatedAt ? new Date(subject.updatedAt).toLocaleDateString('vi-VN') : '---'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="dept-text">{subject.department}</span>
                      </td>
                      <td>
                        <div className="exams-count-badge">
                          <span className="exams-count-num">
                            {(subject.quizCount || 0) < 10 ? `0${subject.quizCount || 0}` : subject.quizCount}
                          </span>
                          <span className="exams-set-label">Bộ đề</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${subject.status === 'active' ? 'active' : 'paused'}`}>
                          <span className="status-dot"></span>
                          {mapStatusToUI(subject.status)}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell-wrapper">
                          <button className="action-icon-btn view" title="Xem chi tiết"
                            onClick={() => openViewModal(subject)}>
                            <MdVisibility />
                          </button>
                          <button className="action-icon-btn edit" title="Chỉnh sửa"
                            onClick={() => openEditModal(subject)}>
                            <MdEdit />
                          </button>
                          <button className="action-icon-btn delete" title="Xóa"
                            onClick={() => openDeleteModal(subject)}>
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Không tìm thấy môn học nào phù hợp với bộ lọc tìm kiếm!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="pagination-section">
              <p className="pagination-text">
                Hiển thị <span className="pagination-highlight">{startIndex + 1} - {endIndex}</span> trên tổng số <span className="pagination-highlight">{totalItems}</span> môn học
              </p>
              <div className="pagination-controls">
                <button className="pagination-nav-btn" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  title="Trang trước">
                  <MdChevronLeft />
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} 
                      className={`page-number-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  ))}
                </div>

                <button className="pagination-nav-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  title="Trang sau">
                  <MdChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="decorative-empty-state">
          <div className="empty-icon-circle">
            <MdSchool />
          </div>
          <h3>Tối ưu hóa quản lý đào tạo</h3>
          <p>
            Hệ thống giúp bạn dễ dàng tổ chức nội dung học tập và thi cử theo các chuyên mục khoa học, tăng cường hiệu suất quản lý cho bộ phận học vụ.
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddEditModal && (
        <div className="admin-subject-modal-overlay">
          <div className="modal-container">
            <div className="admin-subject-modal-header">
              <h3>{modalType === 'add' ? 'Thêm môn học mới' : 'Chỉnh sửa thông tin môn học'}</h3>
              <button className="admin-subject-modal-close-btn" onClick={() => setShowAddEditModal(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleSaveSubject}>
              <div className="modal-body">
                <div className="modal-form">
                  <div className="form-group">
                    <label htmlFor="code">Mã môn học</label>
                    <input type="text" id="code" name="code" placeholder="VD: MATH101, PHYS102"
                      value={formValues.code} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="name">Tên môn học</label>
                    <input type="text" id="name" name="name" placeholder="Nhập tên môn học..."
                      value={formValues.name} onChange={handleInputChange} required />
                  </div>
                   <div className="form-group">
                     <label htmlFor="department">Khoa / Ngành đào tạo</label>
                     <div className="department-input-wrapper">
                       <input 
                         type="text" 
                         id="department" 
                         name="department" 
                         placeholder="Chọn hoặc nhập tên khoa/ngành mới..."
                         value={formValues.department} 
                         onChange={handleInputChange}
                         list="department-list"
                         autoComplete="off"
                         required
                       />
                       <datalist id="department-list">
                         {departmentOptions.map((dept, idx) => (
                           <option key={idx} value={dept} />
                         ))}
                       </datalist>
                     </div>
                   </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status">Trạng thái hoạt động</label>
                      <select id="status" name="status" value={formValues.status} onChange={handleInputChange}>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAddEditModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-submit">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentSubject && (
        <div className="admin-subject-modal-overlay">
          <div className="modal-container">
            <div className="admin-subject-modal-header">
              <h3>Chi tiết môn học</h3>
              <button className="admin-subject-modal-close-btn" onClick={() => setShowViewModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className="modal-body">
              <div className="view-details-grid">
                <div className="view-detail-item">
                  <span className="view-detail-label">Mã môn học</span>
                  <span className="view-detail-value code">{currentSubject.code}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Tên môn học</span>
                  <span className="view-detail-value">{currentSubject.name}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Khoa / Ngành</span>
                  <span className="view-detail-value">{currentSubject.department}</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Số lượng đề thi</span>
                  <span className="view-detail-value">{currentSubject.quizCount || 0} bộ đề</span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Trạng thái</span>
                  <span className="view-detail-value">
                    <span className={`status-badge ${currentSubject.status === 'active' ? 'active' : 'paused'}`}>
                      <span className="status-dot"></span>
                      {mapStatusToUI(currentSubject.status)}
                    </span>
                  </span>
                </div>
                <div className="view-detail-item">
                  <span className="view-detail-label">Cập nhật lần cuối</span>
                  <span className="view-detail-value">
                    {currentSubject.updatedAt ? new Date(currentSubject.updatedAt).toLocaleDateString('vi-VN') : '---'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-submit" onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && currentSubject && (
        <div className="admin-subject-modal-overlay">
          <div className="modal-container">
            <div className="admin-subject-modal-header">
              <h3>Xác nhận xóa môn học</h3>
              <button className="admin-subject-modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: '1.6' }}>
                Bạn có chắc chắn muốn xóa môn học <strong>{currentSubject.name} ({currentSubject.code})</strong> không? 
                Hành động này không thể hoàn tác và tất cả các bộ đề thuộc môn học này cũng sẽ bị gỡ bỏ khỏi hệ thống.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button type="button" className="btn-danger" onClick={handleDeleteSubject}>Đồng ý xóa</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}