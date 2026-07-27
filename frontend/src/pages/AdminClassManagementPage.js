import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import {
  School,
  User,
  Calendar,
  Trash2,
  UserPlus,
  MoreVertical,
  Plus,
  X,
  Search,
  CheckCircle,
  Users,
} from 'lucide-react';
import {
  addStudentToClass,
  createClass,
  deleteClass,
  getClasses,
  getUsers,
  removeStudentFromClass,
  updateClass,
} from '../services/adminService';
import '../styles/AdminClassManagementContent.css';

const STATUS_LABELS = { active: 'Đang hoạt động', inactive: 'Tạm dừng' };
const USER_ROLE_LABELS = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Học sinh' };
const USER_STATUS_LABELS = { active: 'Hoạt động', inactive: 'Ngừng hoạt động', blocked: 'Đã khóa' };

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'HS';

const getShortId = (id = '') => `#${id.slice(-6).toUpperCase()}`;

export default function AdminClassManagementPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [newClassYear, setNewClassYear] = useState('2025 - 2026');
  const [studentId, setStudentId] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editClassTeacher, setEditClassTeacher] = useState('');
  const [editClassYear, setEditClassYear] = useState('');
  const [editClassStatus, setEditClassStatus] = useState('active');
  const [activeMenuStudentId, setActiveMenuStudentId] = useState(null);
  const [emailDetails, setEmailDetails] = useState(null);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const fetchClasses = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const res = await getClasses({ page: 1, limit: 100, search });
      const nextClasses = res.classes || [];
      setClasses(nextClasses);
      setSelectedClassId((currentId) =>
        nextClasses.some((item) => item._id === currentId) ? currentId : (nextClasses[0]?._id || null)
      );
    } catch (error) {
      showToast(error.message || 'Không thể tải danh sách lớp học.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchClasses(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [fetchClasses, searchQuery]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeClass = classes.find((item) => item._id === selectedClassId) || null;
  const students = activeClass?.students || [];
  const filteredStudents = students.filter((student) =>
    `${student.name || ''} ${student.email || ''}`.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const handleAddClass = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const res = await createClass({ name: newClassName, teacherName: newClassTeacher, year: newClassYear, status: 'active' });
      setShowAddClass(false);
      setNewClassName('');
      setNewClassTeacher('');
      await fetchClasses();
      setSelectedClassId(res.class?._id || null);
      showToast('Tạo lớp học thành công.');
    } catch (error) {
      showToast(error.message || 'Không thể tạo lớp học.', 'error');
    } finally { setSaving(false); }
  };

  const handleOpenEditClass = () => {
    if (!activeClass) return;
    setEditClassName(activeClass.name || '');
    setEditClassTeacher(activeClass.teacherName || activeClass.teacher?.name || '');
    setEditClassYear(activeClass.year || '');
    setEditClassStatus(activeClass.status || 'active');
    setShowEditClass(true);
  };

  const handleEditClassSubmit = async (event) => {
    event.preventDefault();
    if (!activeClass) return;
    try {
      setSaving(true);
      await updateClass(activeClass._id, { name: editClassName, teacherName: editClassTeacher, year: editClassYear, status: editClassStatus });
      setShowEditClass(false);
      await fetchClasses();
      showToast('Cập nhật lớp học thành công.');
    } catch (error) {
      showToast(error.message || 'Không thể cập nhật lớp học.', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteClass = async () => {
    if (!activeClass || !window.confirm(`Bạn có chắc muốn xoá lớp ${activeClass.name}?`)) return;
    try {
      setSaving(true);
      await deleteClass(activeClass._id);
      await fetchClasses();
      showToast('Đã xoá lớp học.');
    } catch (error) {
      showToast(error.message || 'Không thể xoá lớp học.', 'error');
    } finally { setSaving(false); }
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    if (!activeClass) return;
    try {
      setSaving(true);
      await addStudentToClass(activeClass._id, studentId.trim());
      setStudentId('');
      setShowAddStudent(false);
      await fetchClasses();
      showToast('Đã thêm học sinh vào lớp.');
    } catch (error) {
      showToast(error.message || 'Không thể thêm học sinh. Kiểm tra lại ID tài khoản.', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteStudent = async (id) => {
    if (!activeClass || !window.confirm('Bạn có chắc muốn xoá học sinh này khỏi lớp?')) return;
    try {
      setSaving(true);
      await removeStudentFromClass(activeClass._id, id);
      setActiveMenuStudentId(null);
      await fetchClasses();
      showToast('Đã xoá học sinh khỏi lớp.');
    } catch (error) {
      showToast(error.message || 'Không thể xoá học sinh khỏi lớp.', 'error');
    } finally { setSaving(false); }
  };

  const openAddStudentModal = async () => {
    try {
      setStudentsLoading(true);
      const res = await getUsers({ page: 1, limit: 100, role: 'student', status: 'active' });
      const enrolledIds = new Set((activeClass?.students || []).map((student) => student._id));
      setAvailableStudents((res.users || []).filter((student) => !enrolledIds.has(student._id)));
      setStudentId('');
      setShowAddStudent(true);
    } catch (error) {
      showToast(error.message || 'Không thể tải danh sách học sinh.', 'error');
    } finally {
      setStudentsLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="Quản lý lớp học" pageSubtitle="Theo dõi danh sách lớp, giáo viên và học sinh.">
      {toast && <div className={`toast ${toast.type}`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>{toast.message}</div>}
      <div className="dashboard-content" id="dashboard-content-area">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <button className="btn-primary" onClick={() => setShowAddClass(true)} disabled={saving}><Plus size={18} /><span>Tạo lớp học mới</span></button>
        </div>
        <div className="dashboard-grid" id="dashboard-grid-layout">
          <div className="class-list-column" id="class-list-sidebar">
            <div className="column-header"><h3 className="column-title">Danh sách lớp</h3><span className="counter-badge">{classes.length} lớp</span></div>
            <div className="table-search-box" style={{ margin: '0 16px 12px' }}><Search size={14} className="table-search-icon" /><input type="text" placeholder="Tìm lớp hoặc giáo viên..." className="table-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <div className="class-cards-container" id="class-cards-list">
              {loading ? <div className="empty-state">Đang tải dữ liệu...</div> : classes.length === 0 ? <div className="empty-state">Không tìm thấy lớp học phù hợp</div> : classes.map((item) => {
                const isSelected = item._id === selectedClassId;
                return <div key={item._id} className={`class-card ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedClassId(item._id)}>
                  {isSelected && <div className="selected-indicator"><CheckCircle size={14} className="check-icon" /></div>}
                  <h4 className="class-card-name">{item.name}</h4>
                  <div className="class-card-meta"><div className="meta-item"><User size={14} /><span>GV: {item.teacherName || item.teacher?.name || 'Chưa phân công'}</span></div><div className="meta-item"><Users size={14} /><span>{item.studentCount || 0} học sinh</span></div></div>
                </div>;
              })}
            </div>
          </div>
          <div className="class-details-column" id="class-details-panel">
            {activeClass ? <>
              <div className="active-class-hero">
                <div className="hero-main-info"><div className="hero-left-block"><div className="hero-icon-container"><Users size={28} className="hero-icon-blue" /></div><div className="hero-text-details"><div className="hero-title-badge-row"><h2 className="hero-class-name">{activeClass.name}</h2><span className={`badge-status ${activeClass.status === 'active' ? 'active' : 'paused'}`}>{STATUS_LABELS[activeClass.status] || activeClass.status}</span></div><div className="hero-meta-row"><div className="hero-meta-col"><User size={16} /><span>GV: {activeClass.teacherName || activeClass.teacher?.name || 'Chưa phân công'}</span></div><div className="hero-meta-col"><Calendar size={16} /><span>Năm học: {activeClass.year || '---'}</span></div></div></div></div><div className="hero-actions-container"><button className="btn-outline-sm" onClick={handleOpenEditClass} disabled={saving}>Sửa lớp</button><button className="btn-icon-danger" onClick={handleDeleteClass} disabled={saving}><Trash2 size={16} /></button></div></div>
                <div className="stats-dashboard-grid"><div className="stats-chip chip-blue"><span className="stats-chip-title">Tổng học sinh</span><span className="stats-chip-value">{activeClass.studentCount || 0}</span></div></div>
              </div>
              <div className="students-table-container"><div className="table-header-row"><h3 className="table-header-title">Danh sách học sinh</h3><div className="table-filter-actions"><div className="table-search-box"><Search size={14} className="table-search-icon" /><input type="text" placeholder="Tìm học sinh..." className="table-search-input" value={studentSearchQuery} onChange={(e) => setStudentSearchQuery(e.target.value)} /></div><button className="btn-primary-sm" onClick={openAddStudentModal} disabled={saving || studentsLoading}><UserPlus size={16} /><span>{studentsLoading ? 'Đang tải...' : 'Thêm học sinh'}</span></button></div></div>
                <div className="table-scroller"><table className="students-data-table"><thead><tr><th>ID tài khoản</th><th>Họ và tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th className="text-right-aligned">Thao tác</th></tr></thead><tbody>{filteredStudents.length === 0 ? <tr><td colSpan="6" className="table-empty-cell">Chưa có học sinh trong lớp này</td></tr> : filteredStudents.map((student) => <tr key={student._id}><td className="student-code-cell" title={student._id}>{getShortId(student._id)}</td><td><div className="student-profile-cell"><div className="student-avatar-initial bg-blue">{getInitials(student.name)}</div><span className="student-fullname" title={student.name}>{student.name}</span></div></td><td><button type="button" className="student-email student-email-button" title="Bấm để xem email đầy đủ" onClick={() => setEmailDetails({ name: student.name, email: student.email })}>{student.email || '---'}</button></td><td>{USER_ROLE_LABELS[student.role] || student.role || '---'}</td><td><span className={`status-pill ${student.status === 'active' ? 'online' : 'offline'}`}>{USER_STATUS_LABELS[student.status] || '---'}</span></td><td className="text-right-aligned actions-cell-container"><button className="action-menu-btn" onClick={() => setActiveMenuStudentId(activeMenuStudentId === student._id ? null : student._id)}><MoreVertical size={16} /></button>{activeMenuStudentId === student._id && <div className="student-action-dropdown"><button className="dropdown-delete-btn" onClick={() => handleDeleteStudent(student._id)}>Xoá khỏi lớp</button></div>}</td></tr>)}</tbody></table></div>
                <div className="table-footer-pagination"><p className="footer-stats-text">Hiển thị {filteredStudents.length} trên tổng số {activeClass.studentCount || 0} học sinh</p></div>
              </div>
            </> : <div className="no-class-selected-state"><School size={48} className="empty-state-icon" /><h3>Chưa có lớp học</h3><p>Hãy tạo một lớp học mới để bắt đầu quản lý.</p></div>}
          </div>
        </div>
      </div>
      {showAddClass && <ClassModal title="Tạo lớp học mới" onClose={() => setShowAddClass(false)} onSubmit={handleAddClass} saving={saving}><ClassFields name={newClassName} setName={setNewClassName} teacher={newClassTeacher} setTeacher={setNewClassTeacher} year={newClassYear} setYear={setNewClassYear} /></ClassModal>}
      {showEditClass && <ClassModal title="Sửa thông tin lớp học" onClose={() => setShowEditClass(false)} onSubmit={handleEditClassSubmit} saving={saving}><ClassFields name={editClassName} setName={setEditClassName} teacher={editClassTeacher} setTeacher={setEditClassTeacher} year={editClassYear} setYear={setEditClassYear} status={editClassStatus} setStatus={setEditClassStatus} /></ClassModal>}
      {showAddStudent && <ClassModal title="Thêm học sinh vào lớp" onClose={() => setShowAddStudent(false)} onSubmit={handleAddStudent} saving={saving}><div className="form-group"><label className="form-label">Chọn học sinh <span className="required">*</span></label><select className="form-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} required><option value="">-- Chọn tài khoản học sinh --</option>{availableStudents.map((student) => <option key={student._id} value={student._id}>{student.name} — {student.email}</option>)}</select>{availableStudents.length === 0 && <small>Không còn học sinh đang hoạt động để thêm vào lớp này.</small>}</div></ClassModal>}
      {emailDetails && <div className="modal-overlay" onClick={() => setEmailDetails(null)}><div className="modal-card email-details-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><h3 className="modal-title">Email tài khoản</h3><button className="modal-close-btn" type="button" onClick={() => setEmailDetails(null)}><X size={20} /></button></div><div className="modal-body"><strong>{emailDetails.name}</strong><span className="full-student-email">{emailDetails.email}</span></div><div className="modal-footer"><button type="button" className="btn-modal-submit" onClick={() => setEmailDetails(null)}>Đóng</button></div></div></div>}
    </AdminLayout>
  );
}

function ClassModal({ title, children, onClose, onSubmit, saving }) {
  return <div className="modal-overlay"><div className="modal-card"><div className="modal-header"><h3 className="modal-title">{title}</h3><button className="modal-close-btn" type="button" onClick={onClose}><X size={20} /></button></div><form onSubmit={onSubmit}><div className="modal-body">{children}</div><div className="modal-footer"><button type="button" className="btn-modal-cancel" onClick={onClose} disabled={saving}>Huỷ</button><button type="submit" className="btn-modal-submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></div></form></div></div>;
}

function ClassFields({ name, setName, teacher, setTeacher, year, setYear, status, setStatus }) {
  return <>
    <div className="form-group"><label className="form-label">Tên lớp học <span className="required">*</span></label><input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
    <div className="form-group"><label className="form-label">Giáo viên/Giảng viên</label><input type="text" className="form-input" value={teacher} onChange={(e) => setTeacher(e.target.value)} /></div>
    <div className="form-group"><label className="form-label">Năm học</label><input type="text" className="form-input" placeholder="Ví dụ: 2025 - 2026" value={year} onChange={(e) => setYear(e.target.value)} /></div>
    {setStatus && <div className="form-group"><label className="form-label">Trạng thái</label><select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">Đang hoạt động</option><option value="inactive">Tạm dừng</option></select></div>}
  </>;
}
