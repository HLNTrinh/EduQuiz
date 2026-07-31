import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { quizService, quizAttemptService } from '../services/services';
import '../styles/Result.css';

export const TeacherResultPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [teacherAttempts, setTeacherAttempts] = useState([]);
  const [teacherStats, setTeacherStats] = useState({
    averageScore: 0,
    passRate: 0,
    totalAttempts: 0,
    completedQuizzes: 0,
  });

  const [loading, setLoading] = useState(false);
  
  // Quiz list state
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizPage, setQuizPage] = useState(1);
  const [quizTotalPages, setQuizTotalPages] = useState(1);
  const [quizTotal, setQuizTotal] = useState(0);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const limit = 5;

  const loadTeacherAttempts = async (quizId) => {
    if (!quizId) {
      setTeacherAttempts([]);
      setTeacherStats({ averageScore: 0, passRate: 0, totalAttempts: 0, completedQuizzes: 0 });
      return;
    }
    try {
      setLoading(true);
      const params = { quizId };
      const res = await quizAttemptService.getTeacherAttempts(params);
      const attempts = Array.isArray(res) ? res : (res.data || []);

      setTeacherAttempts(attempts);

      // Nhóm theo học sinh, lấy điểm cao nhất của mỗi học sinh
      const studentMap = new Map();
      attempts.forEach((a) => {
        const sid = a.studentId?._id?.toString();
        if (!sid) return;
        if (!studentMap.has(sid) || (a.score || 0) > studentMap.get(sid).score) {
          studentMap.set(sid, { score: a.score || 0, isPassed: a.isPassed || false });
        }
      });
      const bestScores = Array.from(studentMap.values());

      const averageScore = bestScores.length === 0
        ? 0
        : (bestScores.reduce((sum, s) => sum + s.score, 0) / bestScores.length).toFixed(1);

      const passRate = bestScores.length === 0
        ? 0
        : Math.round((bestScores.filter((s) => s.isPassed).length * 100) / bestScores.length);

      setTeacherStats({
        averageScore,
        passRate,
        totalAttempts: attempts.length,
        completedQuizzes: bestScores.length,
      });
    } catch (err) {
      console.log(err);
      setTeacherAttempts([]);
      setTeacherStats({ averageScore: 0, passRate: 0, totalAttempts: 0, completedQuizzes: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (page = 1) => {
    try {
      setQuizLoading(true);
      // Gọi API trực tiếp để lấy cả data và pagination
      const res = await api.get('/quizzes', { params: { page, limit } });
      const list = res.data || [];
      const pagination = res.pagination;
      
      setQuizzes(list);
      if (pagination) {
        setQuizPage(pagination.page);
        setQuizTotalPages(pagination.pages);
        setQuizTotal(pagination.total);
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setQuizzes([]);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > quizTotalPages) return;
    fetchQuizzes(newPage);
  };

  const handleSelectQuiz = (quiz) => {
    if (selectedQuizId === quiz._id) {
      // Nếu click lại thì bỏ chọn
      setSelectedQuizId(null);
      setSelectedQuiz(null);
      loadTeacherAttempts(null);
      return;
    }
    setSelectedQuizId(quiz._id);
    setSelectedQuiz(quiz);
    loadTeacherAttempts(quiz._id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  // Hàm xuất file CSV
  const exportToCSV = () => {
    if (groupedStudents.length === 0) return;

    const headers = ['Mã học sinh', 'Họ tên', 'Email', 'Lớp', 'Điểm số', 'Số lần làm', 'Thời gian làm', 'Ngày nộp'];
    
    const rows = groupedStudents.map((s) => [
      s.studentId?._id?.toString().slice(0, 8).toUpperCase(),
      s.studentId?.name || '',
      s.studentId?.email || '',
      selectedQuiz?.assignedClass?.name || '',
      s.highestScore,
      s.attemptCount,
      s.bestAttempt?.timeTaken || 0,
      formatDate(s.bestAttempt?.endTime),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ket_qua_${selectedQuiz?.title || 'de_thi'}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Nhóm attempts theo học sinh, lấy điểm cao nhất và đếm số lần làm
  const groupedStudents = React.useMemo(() => {
    const map = new Map();
    teacherAttempts.forEach((attempt) => {
      const studentId = attempt.studentId?._id?.toString();
      if (!studentId) return;
      
      if (!map.has(studentId)) {
        map.set(studentId, {
          studentId: attempt.studentId,
          highestScore: attempt.score || 0,
          attemptCount: 1,
          bestAttempt: attempt,
        });
      } else {
        const existing = map.get(studentId);
        existing.attemptCount += 1;
        if ((attempt.score || 0) > existing.highestScore) {
          existing.highestScore = attempt.score || 0;
          existing.bestAttempt = attempt;
        }
      }
    });
    return Array.from(map.values());
  }, [teacherAttempts]);

  return (
    <div className="result-overview-shell">
      <aside className="result-sidebar">
        {/* LOGO SIDEBAR */}
        <div className="sidebar-logo">
          <svg
            width="170"
            height="48"
            viewBox="0 0 220 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0"
              y="5"
              width="50"
              height="50"
              rx="14"
              fill="url(#paint0_linear)"
            />
            <path
              d="M25 18L36 24L25 30L14 24L25 18Z"
              fill="white"
            />
            <path
              d="M18 28.5V33C18 35.5 21 37 25 37C29 37 32 35.5 32 33V28.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M33 25.5V32"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text
              x="65"
              y="37"
              fontFamily="Inter, sans-serif"
              fontSize="26"
              fontWeight="800"
              fill="#0F172A"
            >
              Edu
              <tspan fill="#2563EB">Quiz</tspan>
            </text>
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="0"
                y1="5"
                x2="50"
                y2="55"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </svg>
          <span className="sidebar-subtitle">
            EduQuiz-Hệ thống tri thức
          </span>
        </div>

        <nav className="result-sidebar-nav">
          <a href="#" onClick={(event) => { event.preventDefault(); navigate('/teacher/dashboard'); }}>
            <span>▦</span> Tổng quan
          </a>
          <a href="#" onClick={(event) => { event.preventDefault(); navigate('/teacher/questions'); }}>
            <span>📝</span> Ngân hàng câu hỏi
          </a>
          <a href="#" onClick={(event) => { event.preventDefault(); navigate('/teacher/exams'); }}>
            <span>📄</span> Đề thi
          </a>
          <a className="active" href="#" onClick={(event) => event.preventDefault()}>
            <span>📊</span> Kết quả
          </a>
          <a href="#" onClick={(event) => { event.preventDefault(); navigate('/teacher/members'); }}>
            <span>👥</span> Thành viên
          </a>
        </nav>

        <div className="result-sidebar-bottom">
          <a href="#" onClick={(event) => event.preventDefault()}><span>⚙️</span> Cài đặt</a>
          <a className="danger" href="#" onClick={(event) => { event.preventDefault(); logout(); }}><span>↪</span> Đăng xuất</a>
        </div>
      </aside>

      <main className="result-overview-main">
        <div className="result-container result-overview-container">
          <div className="result-header result-header--overview">
            <h1>📊 Báo cáo kết quả học sinh</h1>
            <p className="quiz-title">Tổng quan kết quả bài thi cho giáo viên</p>
          </div>

          {/* ===== Danh sách đề thi đã phát ===== */}
          <section className="overview-chart-card" style={{ padding: '15px' }}>
            <div className="panel-header">
              <div>
                <h2 className="panel-title">📋 Danh sách đề thi đã phát</h2>
                <p className="panel-subtitle">Nhấn vào một đề thi để xem thống kê chi tiết bên dưới.</p>
              </div>
              <div style={{ fontSize: '10px', color: '#97a3b5', fontWeight: 600 }}>
                Tổng: {quizTotal} đề
              </div>
            </div>

            {quizLoading ? (
              <p style={{ fontSize: '11px', color: '#97a3b5', padding: '12px 0' }}>Đang tải danh sách đề thi...</p>
            ) : quizzes.length > 0 ? (
              <>
                <div className="table-wrap">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Mã đề</th>
                        <th>Tên đề thi</th>
                        <th>Môn học</th>
                        <th>Lớp được giao</th>
                        <th>Thời gian làm bài</th>
                        <th>Thời gian giao đề</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.map((quiz) => (
                        <tr
                          key={quiz._id}
                          onClick={() => handleSelectQuiz(quiz)}
                          style={{
                            cursor: 'pointer',
                            background: selectedQuizId === quiz._id ? '#edf4ff' : '',
                            fontWeight: selectedQuizId === quiz._id ? 700 : 400,
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedQuizId !== quiz._id) e.currentTarget.style.background = '#f8faff';
                          }}
                          onMouseLeave={(e) => {
                            if (selectedQuizId !== quiz._id) e.currentTarget.style.background = '';
                          }}
                        >
                          <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '9px', color: '#53637b' }}>
                            {quiz._id ? quiz._id.slice(-8).toUpperCase() : 'N/A'}
                          </td>
                          <td style={{ fontWeight: 600 }}>{quiz.title || 'Chưa có tên'}</td>
                          <td>{quiz.subject?.name || 'N/A'}</td>
                          <td>{quiz.assignedClass?.name || 'Chưa chọn lớp'}</td>
                          <td>{quiz.duration || 0} phút</td>
                          <td>{formatDate(quiz.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e6ecf4',
                }}>
                  <button
                    onClick={() => handlePageChange(quizPage - 1)}
                    disabled={quizPage <= 1}
                    style={{
                      padding: '5px 10px',
                      border: '1px solid #d0d7e2',
                      borderRadius: '5px',
                      background: quizPage <= 1 ? '#f5f6f8' : '#fff',
                      color: quizPage <= 1 ? '#bac1cc' : '#53637b',
                      cursor: quizPage <= 1 ? 'default' : 'pointer',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    ← Trước
                  </button>

                  {Array.from({ length: quizTotalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (p === 1 || p === quizTotalPages) return true;
                      if (p >= quizPage - 1 && p <= quizPage + 1) return true;
                      return false;
                    })
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && (
                            <span style={{ fontSize: '10px', color: '#bac1cc', padding: '0 2px' }}>...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            style={{
                              width: '26px',
                              height: '26px',
                              border: p === quizPage ? 'none' : '1px solid #d0d7e2',
                              borderRadius: '5px',
                              background: p === quizPage ? '#2867df' : '#fff',
                              color: p === quizPage ? '#fff' : '#53637b',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(quizPage + 1)}
                    disabled={quizPage >= quizTotalPages}
                    style={{
                      padding: '5px 10px',
                      border: '1px solid #d0d7e2',
                      borderRadius: '5px',
                      background: quizPage >= quizTotalPages ? '#f5f6f8' : '#fff',
                      color: quizPage >= quizTotalPages ? '#bac1cc' : '#53637b',
                      cursor: quizPage >= quizTotalPages ? 'default' : 'pointer',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    Sau →
                  </button>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '11px', color: '#97a3b5', padding: '12px 0' }}>Chưa có đề thi nào được phát.</p>
            )}
          </section>

          {/* ===== Hiển thị khi chưa chọn đề ===== */}
          {!selectedQuizId && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              border: '1px dashed #d0d7e2',
              borderRadius: '9px',
              background: '#fafbff',
            }}>
              <p style={{ fontSize: '13px', color: '#97a3b5', fontWeight: 600 }}>
                👆 Vui lòng chọn một đề thi ở trên để xem thống kê chi tiết
              </p>
            </div>
          )}

          {/* ===== Thống kê cho đề thi được chọn ===== */}
          {selectedQuizId && (
            <>
              <section className="overview-cards-grid">
                <div className="overview-card overview-card--primary">
                  <p className="overview-card-title">Điểm trung bình</p>
                  <p className="overview-card-value">{teacherStats.averageScore}</p>
                  <p className="overview-card-note">Điểm trung bình của đề thi "{selectedQuiz?.title}".</p>
                </div>
                <div className="overview-card">
                  <p className="overview-card-title">Tỷ lệ đạt</p>
                  <p className="overview-card-value">{teacherStats.passRate}%</p>
                  <p className="overview-card-note">Phần học sinh vượt ngưỡng đạt tối thiểu.</p>
                </div>
                <div className="overview-card">
                  <p className="overview-card-title">Số lượt nộp</p>
                  <p className="overview-card-value">{teacherStats.totalAttempts}</p>
                  <p className="overview-card-note">Tổng lượt học sinh đã hoàn thành bài thi.</p>
                </div>
                <div className="overview-card">
                  <p className="overview-card-title">Học sinh đã làm</p>
                  <p className="overview-card-value">{teacherStats.completedQuizzes}</p>
                  <p className="overview-card-note">Số học sinh đã tham gia làm đề thi này.</p>
                </div>
              </section>

              {/* ===== Kết quả chi tiết học sinh ===== */}
              <section className="recent-results-panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">📋 Kết quả học sinh</h2>
                    <p className="panel-subtitle">Chi tiết kết quả làm bài của từng học sinh.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#97a3b5', fontWeight: 600 }}>
                      {groupedStudents.length} học sinh
                    </span>
                    {groupedStudents.length > 0 && (
                      <button
                        className="btn-outline btn-small"
                        type="button"
                        onClick={exportToCSV}
                        style={{ fontSize: '9px', padding: '3px 8px' }}
                      >
                        📥 Xuất CSV
                      </button>
                    )}
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Mã học sinh</th>
                        <th>Tên học sinh</th>
                        <th>Email</th>
                        <th>Lớp</th>
                        <th>Điểm số</th>
                        <th>Số lần làm</th>
                        <th>Thời gian làm bài</th>
                        <th>Thời gian nộp bài</th>
                        <th>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedStudents.length > 0 ? (
                        groupedStudents.map((student) => (
                          <tr key={student.studentId?._id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '9px', color: '#53637b' }}>
                              {student.studentId?._id ? student.studentId._id.toString().slice(0, 8).toUpperCase() : 'N/A'}
                            </td>
                            <td style={{ fontWeight: 600 }}>{student.studentId?.name || 'N/A'}</td>
                            <td>{student.studentId?.email || 'N/A'}</td>
                            <td>{selectedQuiz?.assignedClass?.name || 'N/A'}</td>
                            <td>
                              <span className={`status-chip ${student.highestScore >= (selectedQuiz?.passingScore || 50) ? 'status-chip--success' : 'status-chip--warning'}`}>
                                {student.highestScore}
                              </span>
                            </td>
                            <td>{student.attemptCount} lần</td>
                            <td>{student.bestAttempt?.timeTaken || 0} phút</td>
                            <td>{formatDate(student.bestAttempt?.endTime)}</td>
                            <td>
                              <button
                                className="btn-outline btn-small"
                                type="button"
                                style={{ fontSize: '9px', padding: '3px 8px' }}
                                onClick={() => {}}
                              >
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', color: '#97a3b5', padding: '20px' }}>
                            Chưa có học sinh nào làm bài thi này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => navigate('/teacher/dashboard')}>
              ← Về trang giáo viên
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/teacher/exams')}>
              Quản lý đề thi
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherResultPage;