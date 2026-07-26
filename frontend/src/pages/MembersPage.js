import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Members.css';

export const MembersPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const classes = [
    { id: '12A1', title: 'Lớp 12A1', subject: 'Toán học cơ bản', students: 45, progress: 85 },
    { id: '12A2', title: 'Lớp 12A2', subject: 'Toán học nâng cao', students: 42, progress: 92 },
    { id: '11B3', title: 'Lớp 11B3', subject: 'Hình học', students: 48, progress: 78 },
  ];

  const students = [
    { id: 'STU00241', name: 'Hoàng Anh', email: 'hoanganh.stu@school.edu.vn', status: 'Đang học' },
    { id: 'STU00242', name: 'Mai Lan', email: 'mailan.stu@school.edu.vn', status: 'Đang học' },
    { id: 'STU00243', name: 'Phạm Tuấn', email: 'phamtuan.stu@school.edu.vn', status: 'Nghỉ phép' },
    { id: 'STU00244', name: 'Bảo Trân', email: 'baotran.stu@school.edu.vn', status: 'Đang học' },
  ];

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();
    return students.filter((student) =>
      student.id.toLowerCase().includes(query) ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.status.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <div className="dash-shell">
      <aside className="sidebar">
      <div className="sidebar-logo">

        <svg
          width="170"
          height="48"
          viewBox="0 0 220 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Icon */}
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

          {/* Tên EduQuiz */}
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

          {/* Gradient */}
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

        <nav className="sidebar-nav">
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/dashboard'); }}>
            <span className="sidebar-icon">▦</span> Tổng quan
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/exams'); }}>
            <span className="sidebar-icon">📄</span> Quản lý đề thi
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/questions'); }}>
            <span className="sidebar-icon">📝</span> Ngân hàng câu hỏi
          </a>
          <a className="sidebar-link sidebar-link--active" href="#" onClick={(e) => e.preventDefault()}>
            <span className="sidebar-icon">👥</span> Thành viên
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/results'); }}>
            <span className="sidebar-icon">📊</span> Kết quả
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/settings'); }}>
            <span className="sidebar-icon">⚙️</span> Cài đặt
          </a>
          <a className="sidebar-link sidebar-link--danger" href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
            <span className="sidebar-icon">↪</span> Đăng xuất
          </a>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-header dash-header--overview">
          <div>
            <p className="overview-badge">Quản lý thành viên</p>
            <h1 className="dash-greeting">Chào buổi sáng, Thầy {user?.name ?? 'An'}!</h1>
            <p className="dash-subtitle">Hôm nay hãy kiểm tra danh sách lớp học và thành viên trong lớp.</p>
          </div>
          <div className="overview-actions">
            <button className="btn-outline" onClick={() => navigate('/teacher/exams')}>Tạo kiểm tra mới</button>
            <button className="btn-start" onClick={() => navigate('/teacher/questions')}>Thêm câu hỏi</button>
          </div>
        </header>

        <section className="members-hero-card">
          <div>
            <p className="overview-badge">Danh sách lớp phụ trách</p>
            <h2>Lớp học đang quản lý</h2>
            <p>Hiện tại bạn đang phụ trách {classes.length} lớp với tổng số {classes.reduce((sum, item) => sum + item.students, 0)} học sinh.</p>
          </div>
          <div className="hero-stat">
            <div className="stat-card stat-card--primary" style={{ padding: '20px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)' }}>
              <p className="stat-card-label" style={{ color: 'rgba(255,255,255,0.88)' }}>Lớp đang quản lý</p>
              <p className="stat-card-value" style={{ color: 'white' }}>{classes.length}</p>
            </div>
            <div className="stat-card" style={{ padding: '20px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <p className="stat-card-label" style={{ color: 'rgba(255,255,255,0.88)' }}>Học sinh hiện tại</p>
              <p className="stat-card-value" style={{ color: 'white' }}>{classes.reduce((sum, item) => sum + item.students, 0)}</p>
            </div>
          </div>
        </section>

        <section className="members-card-section">
          <div className="members-section-heading">
            <div>
              <h2 className="panel-title">Danh sách lớp</h2>
              <p className="panel-subtitle">Xem nhanh lớp học và số lượng học sinh</p>
            </div>
            <button className="btn-outline" onClick={() => navigate('/teacher/exams')}>Xem tất cả lớp</button>
          </div>

          <div className="members-card-grid">
            {classes.map((item) => (
              <div className="members-card" key={item.id}>
                <div className="class-card-header">
                  <div>
                    <p className="class-card-title">{item.title}</p>
                    <p className="class-card-subtitle">Môn: {item.subject}</p>
                  </div>
                  <button className="btn-outline" onClick={() => navigate('/teacher/members')}>Xem học sinh</button>
                </div>
                <p className="class-card-meta">{item.students} học sinh</p>
                <div className="summary-score-row" style={{ background: 'rgba(47, 111, 235, 0.08)', padding: '16px', borderRadius: '20px' }}>
                  <div>
                    <p className="summary-score-value" style={{ color: '#1f4ec5' }}>{item.progress}%</p>
                    <p className="summary-score-note">Tiến độ hoàn thành</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="members-table-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Danh sách học sinh: Lớp 12A2</h2>
              <p className="panel-subtitle">Hiển thị thông tin cơ bản của tất cả học sinh trong lớp.</p>
            </div>
            <div className="members-search-group">
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn-outline">Bộ lọc</button>
            </div>
          </div>

          <table className="members-table">
            <thead>
              <tr>
                <th>Mã học sinh</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <span className={`status-pill ${student.status === 'Đang học' ? 'status-pill--active' : 'status-pill--inactive'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-outline" onClick={() => alert(`Xem ${student.name}`)}>Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="members-table-footer">
            <span>Hiển thị 1-4 trong số {filteredStudents.length} học sinh</span>
            <div>
              <button className="btn-outline">1</button>
              <button className="btn-outline">2</button>
              <button className="btn-outline">3</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
