import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import NotificationDropdown from '../components/teacher/NotificationDropdown';
import TeacherAvatar from '../components/teacher/TeacherAvatar';
import { classService, quizAttemptService } from '../services/services';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

// Nạp font TTF hỗ trợ tiếng Việt (cache sau lần đầu) cho jsPDF
let vnFontsCache = null;
async function getVnFonts() {
  if (vnFontsCache) return vnFontsCache;
  const toBase64 = async (url) => {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };
  const base = process.env.PUBLIC_URL || '';
  vnFontsCache = {
    regular: await toBase64(`${base}/fonts/NotoSans-Regular.ttf`),
    bold: await toBase64(`${base}/fonts/NotoSans-Bold.ttf`),
  };
  return vnFontsCache;
}

export default function TeacherClassResultPage() {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [result, setResult] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [expanded, setExpanded] = useState(null); // { studentId, subjectId }
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const list = await classService.getHomeroomClasses();
      setClasses(Array.isArray(list) ? list : []);
      if (Array.isArray(list) && list.length > 0) {
        setSelectedClassId(list[0]._id);
      }
    } catch (err) {
      showToast('Không tải được danh sách lớp.', 'error');
    } finally {
      setLoadingClasses(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const loadResults = useCallback(async (classId) => {
    if (!classId) return;
    try {
      setLoadingResults(true);
      const res = await quizAttemptService.getClassResults(classId);
      setResult(res?.data ?? res ?? null);
    } catch (err) {
      showToast(err?.message || 'Không tải được kết quả lớp.', 'error');
    } finally {
      setLoadingResults(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedClassId) loadResults(selectedClassId);
  }, [selectedClassId, loadResults]);

  const students = result?.students || [];
  // Danh sách môn (duy nhất, theo thứ tự xuất hiện)
  const subjectList = [];
  const seen = new Set();
  students.forEach((s) => {
    (s.results || []).forEach((r) => {
      if (!seen.has(r.subject)) {
        seen.add(r.subject);
        subjectList.push(r.subject);
      }
    });
  });

  const toggleExpand = (studentId, subjectId) => {
    setExpanded((prev) =>
      prev && prev.studentId === studentId && prev.subjectId === subjectId
        ? null
        : { studentId, subjectId }
    );
  };

  const exportCSV = () => {
    if (!students.length) return;
    const headers = ['Học sinh', 'Mã học sinh', 'Email', ...subjectList, 'Trung bình'];
    const rows = students.map((s) => {
      const bySubj = {};
      (s.results || []).forEach((r) => { bySubj[r.subject] = r.bestScore; });
      return [
        s.student?.name || '',
        s.student?.userCode || '',
        s.student?.email || '',
        ...subjectList.map((sub) => (bySubj[sub] !== undefined ? bySubj[sub] : '')),
        s.averageScore ?? '',
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ket_qua_lop_${result?.class?.name || 'lop'}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    if (!students.length) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Nhúng font tiếng Việt (Noto Sans) để chữ có dấu hiển thị đúng
    const fonts = await getVnFonts();
    doc.addFileToVFS('NotoSans-Regular.ttf', fonts.regular);
    doc.addFileToVFS('NotoSans-Bold.ttf', fonts.bold);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');

    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(15);
    doc.text(`Kết quả lớp ${result?.class?.name || ''}`, 14, 16);

    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, 14, 23);

    const head = [['Học sinh', 'Mã học sinh', 'Email', ...subjectList, 'Trung bình']];
    const body = students.map((s) => {
      const bySubj = {};
      (s.results || []).forEach((r) => { bySubj[r.subject] = r.bestScore; });
      return [
        s.student?.name || '',
        s.student?.userCode || '',
        s.student?.email || '',
        ...subjectList.map((sub) => (bySubj[sub] !== undefined ? String(bySubj[sub]) : '')),
        String(s.averageScore ?? ''),
      ];
    });

    autoTable(doc, {
      startY: 28,
      head,
      body,
      styles: { font: 'NotoSans', fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [59, 91, 219], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      columnStyles: { 0: { cellWidth: 55 } },
      margin: { left: 14, right: 14 },
    });

    doc.save(`ket_qua_lop_${result?.class?.name || 'lop'}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const cellStyle = {
    padding: '10px 12px', borderBottom: '1px solid #eef2f7', textAlign: 'center', fontSize: 13,
  };
  const headStyle = {
    padding: '10px 12px', textAlign: 'left', background: '#f7f9fc', color: '#53637b', fontSize: 12, fontWeight: 700,
  };

  return (
    <div className="dash-shell">
      <TeacherSidebar />
      <main className="dash-main">
        <header className="dash-header dash-header--overview">
          <div>
            <p className="overview-badge">Kết quả lớp</p>
            <p className="dash-subtitle">Xem điểm của học sinh theo từng môn (giáo viên chủ nhiệm).</p>
          </div>
          <div className="dash-header-actions">
            <NotificationDropdown />
            <TeacherAvatar user={user} logout={logout} />
          </div>
        </header>

        {toast && (
          <div style={{
            marginBottom: 14, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: toast.type === 'success' ? '#e7f7ec' : '#fdeaea',
            color: toast.type === 'success' ? '#1a7f4d' : '#b42318',
            border: `1px solid ${toast.type === 'success' ? '#b8e6c8' : '#f3b4ad'}`,
          }}>
            {toast.message}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e6ebf2', padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Chọn lớp chủ nhiệm:</label>
            <select
              style={{
                padding: '9px 12px', border: '1px solid #d0d7e2', borderRadius: 8, fontSize: 13, minWidth: 220, background: '#fff',
              }}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}{c.year ? ` (${c.year})` : ''}</option>
              ))}
            </select>
            {students.length > 0 && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={exportCSV}
                  style={{
                    padding: '9px 16px', border: '1px solid #d0d7e2', borderRadius: 8,
                    background: '#fff', color: '#53637b', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}
                >
                  📥 Xuất CSV
                </button>
                <button
                  onClick={exportPDF}
                  style={{
                    padding: '9px 16px', border: 'none', borderRadius: 8,
                    background: '#3b5bdb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}
                >
                  📄 Xuất PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {loadingClasses ? (
          <div className="loading">Đang tải...</div>
        ) : classes.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#97a3b5', background: '#fff', borderRadius: 12, border: '1px solid #e6ebf2' }}>
            Bạn không phải giáo viên chủ nhiệm lớp nào nên không xem được trang này.
          </div>
        ) : loadingResults ? (
          <div className="loading">Đang tải kết quả...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e6ebf2', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ ...headStyle, position: 'sticky', left: 0, top: 0, zIndex: 2, background: '#f7f9fc', minWidth: 120 }}>Mã học sinh</th>
                  <th style={{ ...headStyle, position: 'sticky', left: 120, top: 0, zIndex: 2, background: '#f7f9fc', minWidth: 200 }}>Họ và tên</th>
                  {subjectList.map((sub) => (
                    <th key={sub} style={{ ...headStyle, position: 'sticky', top: 0, zIndex: 1, textAlign: 'center', minWidth: 90 }}>{sub}</th>
                  ))}
                  <th style={{ ...headStyle, position: 'sticky', top: 0, zIndex: 1, textAlign: 'center', minWidth: 90 }}>Trung bình</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan={subjectList.length + 3} style={{ padding: 28, textAlign: 'center', color: '#97a3b5' }}>
                      Chưa có học sinh nào làm bài trong lớp này.
                    </td>
                  </tr>
                )}
                {students.map((s) => {
                  const bySubj = {};
                  (s.results || []).forEach((r) => { bySubj[r.subject] = r; });
                  return (
                    <React.Fragment key={s.student?._id}>
                      <tr>
                        <td style={{ ...cellStyle, position: 'sticky', left: 0, zIndex: 1, background: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>
                          {s.student?.userCode || '—'}
                        </td>
                        <td style={{ ...cellStyle, position: 'sticky', left: 120, zIndex: 1, background: '#fff' }}>
                          <div style={{ fontWeight: 600 }}>{s.student?.name || '—'}</div>
                          <div style={{ fontSize: 11, color: '#9aa7ba' }}>{s.student?.email || ''}</div>
                        </td>
                        {subjectList.map((sub) => {
                          const r = bySubj[sub];
                          return (
                            <td key={sub} style={{ ...cellStyle, cursor: r ? 'pointer' : 'default' }}
                                onClick={() => r && toggleExpand(s.student?._id, r.subjectId)}>
                              {r ? (
                                <div>
                                  <div style={{ fontWeight: 700, color: r.bestScore >= 50 ? '#1a7f4d' : '#e03131' }}>
                                    {r.bestScore}
                                  </div>
                                  <div style={{ fontSize: 10, color: '#9aa7ba' }}>TB {r.averageScore} · {r.attemptCount} đề</div>
                                </div>
                              ) : (
                                <span style={{ color: '#c0c7d1' }}>—</span>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ ...cellStyle, fontWeight: 700 }}>{s.averageScore || 0}</td>
                      </tr>
                      {expanded && expanded.studentId === s.student?._id && (
                        <tr>
                          <td colSpan={subjectList.length + 3} style={{ background: '#fafbff', padding: '6px 16px 14px' }}>
                            {(() => {
                              const r = (s.results || []).find((x) => x.subjectId === expanded.subjectId);
                              if (!r) return null;
                              return (
                                <div>
                                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>
                                    Chi tiết môn {r.subject} — {s.student?.name}
                                  </div>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                    <thead>
                                      <tr style={{ color: '#53637b' }}>
                                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Đề thi</th>
                                        <th style={{ textAlign: 'center', padding: '6px 8px' }}>Điểm</th>
                                        <th style={{ textAlign: 'center', padding: '6px 8px' }}>%</th>
                                        <th style={{ textAlign: 'center', padding: '6px 8px' }}>Đạt</th>
                                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Nộp bài</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {r.quizzes.map((q, idx) => (
                                        <tr key={idx} style={{ borderTop: '1px solid #eef2f7' }}>
                                          <td style={{ padding: '6px 8px' }}>{q.quizTitle}</td>
                                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600 }}>{q.score}</td>
                                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>{q.percentage}%</td>
                                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                            {q.isPassed ? <span style={{ color: '#1a7f4d' }}>Đạt</span> : <span style={{ color: '#e03131' }}>Không</span>}
                                          </td>
                                          <td style={{ padding: '6px 8px' }}>{formatDate(q.endTime)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
