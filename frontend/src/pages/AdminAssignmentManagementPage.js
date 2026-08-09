import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import {
  FaUserTie,
  FaChalkboardTeacher,
  FaBookOpen,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getTeachers,
  getSubjects,
  getClasses,
} from '../services/adminService';

const STATUS_LABELS = { active: 'Đang hoạt động', inactive: 'Tạm dừng' };

export default function AdminAssignmentManagementPage() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // add | edit
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ teacher: '', subject: '', class: '', schoolYear: '', status: 'active' });

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAssignments({ page: 1, limit: 100, search: searchQuery || '' });
      setAssignments(res.assignments || []);
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách phân công.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showToast]);

  const fetchOptions = useCallback(async () => {
    try {
      const [tRes, sRes, cRes] = await Promise.all([
        getTeachers({ page: 1, limit: 100 }),
        getSubjects({ page: 1, limit: 100 }),
        getClasses({ page: 1, limit: 100 }),
      ]);
      setTeachers(tRes.users || []);
      setSubjects(sRes.subjects || []);
      setClasses(cRes.classes || []);
    } catch (err) {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const openAddModal = () => {
    setModalType('add');
    setCurrent(null);
    setForm({ teacher: '', subject: '', class: '', schoolYear: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (assignment) => {
    setModalType('edit');
    setCurrent(assignment);
    setForm({
      teacher: assignment.teacher?._id || '',
      subject: assignment.subject?._id || '',
      class: assignment.class?._id || '',
      schoolYear: assignment.schoolYear || '',
      status: assignment.status || 'active',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.teacher || !form.subject || !form.class) {
      showToast('Vui lòng chọn đầy đủ giáo viên, môn học và lớp học.', 'error');
      return;
    }
    try {
      if (modalType === 'add') {
        await createAssignment(form);
        showToast('Thêm phân công thành công.');
      } else {
        await updateAssignment(current._id, form);
        showToast('Cập nhật phân công thành công.');
      }
      setShowModal(false);
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Lưu không thành công.', 'error');
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Xóa phân công "${assignment.teacher?.name} - ${assignment.subject?.name} - ${assignment.class?.name}"?`)) return;
    try {
      await deleteAssignment(assignment._id);
      showToast('Xóa phân công thành công.');
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Xóa không thành công.', 'error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #d0d7e2', borderRadius: 8,
    fontSize: 13, background: '#fff', color: '#1c2433', outline: 'none',
  };

  return (
    <AdminLayout pageTitle="Phân công giảng dạy" pageSubtitle="Quản lý giáo viên - môn học - lớp học">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <FaSearch style={{ position: 'absolute', left: 12, top: 11, color: '#9aa7ba' }} />
            <input
              style={{ ...inputStyle, paddingLeft: 34 }}
              placeholder="Tìm theo giáo viên, môn học, lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FaPlus /> Thêm phân công
          </button>
        </div>

        {toast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 14px',
            borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: toast.type === 'success' ? '#e7f7ec' : '#fdeaea',
            color: toast.type === 'success' ? '#1a7f4d' : '#b42318',
            border: `1px solid ${toast.type === 'success' ? '#b8e6c8' : '#f3b4ad'}`,
          }}>
            {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{toast.message}</span>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e6ebf2', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f7f9fc', color: '#53637b', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Giáo viên</th>
                <th style={{ padding: '12px 14px' }}>Môn học</th>
                <th style={{ padding: '12px 14px' }}>Lớp học</th>
                <th style={{ padding: '12px 14px' }}>Năm học</th>
                <th style={{ padding: '12px 14px' }}>Trạng thái</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && assignments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 28, textAlign: 'center', color: '#97a3b5' }}>
                    Chưa có phân công nào. Nhấn "Thêm phân công" để bắt đầu.
                  </td>
                </tr>
              )}
              {assignments.map((a) => (
                <tr key={a._id} style={{ borderTop: '1px solid #eef2f7' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaUserTie style={{ color: '#3b5bdb' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.teacher?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: '#9aa7ba' }}>{a.teacher?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaBookOpen style={{ color: '#f59f00' }} />
                      <span>{a.subject?.name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaChalkboardTeacher style={{ color: '#12b886' }} />
                      <span>{a.class?.name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{a.schoolYear || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: a.status === 'active' ? '#e7f7ec' : '#f1f3f5',
                      color: a.status === 'active' ? '#1a7f4d' : '#868e96',
                    }}>
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openEditModal(a)} style={iconBtn('#3b5bdb')}><FaEdit /></button>
                    <button onClick={() => handleDelete(a)} style={iconBtn('#e03131')}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: '#1c2433' }}>
                {modalType === 'add' ? 'Thêm phân công' : 'Sửa phân công'}
              </h3>
              <button onClick={() => setShowModal(false)} style={iconBtn('#868e96')}><FaTimes /></button>
            </div>

            <form onSubmit={handleSave}>
              <div style={fieldWrap}>
                <label style={label}>Giáo viên <span style={{ color: '#e03131' }}>*</span></label>
                <select style={inputStyle} value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">-- Chọn giáo viên --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} — {t.email}</option>
                  ))}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={label}>Môn học <span style={{ color: '#e03131' }}>*</span></label>
                <select style={inputStyle} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={label}>Lớp học <span style={{ color: '#e03131' }}>*</span></label>
                <select style={inputStyle} value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={label}>Năm học</label>
                <input style={inputStyle} placeholder="Ví dụ: 2025 - 2026" value={form.schoolYear}
                  onChange={(e) => setForm({ ...form, schoolYear: e.target.value })} />
              </div>
              <div style={fieldWrap}>
                <label style={label}>Trạng thái</label>
                <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #d0d7e2', background: '#fff', color: '#53637b', cursor: 'pointer', fontSize: 13 }}>
                  Huỷ
                </button>
                <button type="submit"
                  style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {modalType === 'add' ? 'Thêm' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function iconBtn(color) {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, marginLeft: 4, borderRadius: 6, border: 'none',
    background: '#f1f3f5', color, cursor: 'pointer', fontSize: 12,
  };
}

const modalOverlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(15,23,42,0.5)', zIndex: 1000,
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60,
};

const modalCard = {
  background: '#fff', borderRadius: 14, padding: '22px 24px', width: 440, maxWidth: '92vw',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const fieldWrap = { marginBottom: 14 };
const label = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#1c2433' };
