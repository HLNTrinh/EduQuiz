import React, { useState, useEffect, useMemo } from 'react';
import { FiBell, FiHelpCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/authService';
import '../styles/TeacherDashBoard.css';

export const TeacherDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);
  const fetchQuizzes = async () => {
    try {
      const data = await quizService.getQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const publishedCount = quizzes.filter((quiz) => quiz.isPublished).length;
    const questionCount = quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0);
    const averageDuration = quizzes.length
      ? Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.duration || 0), 0) / quizzes.length)
      : 0;

    return {
      total: quizzes.length,
      published: publishedCount,
      questions: questionCount,
      avgDuration: averageDuration,
    };
  }, [quizzes]);

  if (loading) return <div className="loading">Đang tải...</div>;

  const recentActivities = [
    { name: 'Lê Minh Tâm', action: 'nộp bài Kiểm tra Đại số 10', meta: '2 phút trước · Điểm: 8.5' },
    { name: 'Bạn đã thêm 12 câu hỏi mới', action: 'vào ngân hàng Vật Lý', meta: '15 phút trước' },
    { name: 'Nguyễn Thùy Linh', action: 'làm bài Kiểm tra Lịch sử', meta: '45 phút trước · Điểm: 7.2' },
  ];

  const classCards = [
    { title: '10A1', subject: 'Toán học nâng cao', students: 45, room: 'Phòng B201', color: 'blue' },
    { title: '12C4', subject: 'Toán Giải Tích', students: 38, room: 'Online', color: 'peach' },
    { title: '11B2', subject: 'Hình học không gian', students: 42, room: 'Phòng A105', color: 'green' },
  ];

  return (
    <div className="dash-shell">
      {/* Thanh menu bên trái */}
     <aside className="sidebar">
      {/* LOGO SIDEBAR */}
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
          <a className="sidebar-link sidebar-link--active" href="#" onClick={(e) => e.preventDefault()}>
            <span className="sidebar-icon">▦</span> Tổng quan
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/exams'); }}>
            <span className="sidebar-icon">📄</span> Đề thi
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/questions'); }}>
            <span className="sidebar-icon">📝</span> Ngân hàng câu hỏi
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/results'); }}>
            <span className="sidebar-icon">📊</span> Kết quả
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/members'); }}>
            <span className="sidebar-icon">👥</span> Thành viên
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

      {/* Nội dung chính bên phải */}
      <main className="dash-main">
        {/* Header chào mừng */}
        <div className="navbar-welcome">

          {/* Bên trái */}
          <div className="navbar-welcome-text">
            <span className="navbar-greeting">
              Chào mừng trở lại,
            </span>

            <span className="navbar-username">
              Trần Anh Thư
            </span>
          </div>

          {/* Bên phải */}
          <div className="navbar-right">

            <button className="navbar-icon-btn" title="Thông báo">
              <FiBell size={20} />
              <span className="navbar-badge">1</span>
            </button>

            <button className="navbar-icon-btn" title="Trợ giúp">
              <FiHelpCircle size={20} />
            </button>

            <div className="navbar-avatar">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                alt={user.name}
              />
            </div>
          </div>
        </div>

        {/* Các thẻ thống kê (Stat-grid) */}

        <section className="stat-grid">

          {/* Tổng câu hỏi */}
          <div className="stat-card stat-card--questions">
            <div className="stat-card-top">
              <div className="stat-card-icon">
                📄
              </div>

              <span className="stat-card-trend">
                ↗ +12%
              </span>
            </div>

            <p className="stat-card-label">
              Tổng câu hỏi
            </p>

            <p className="stat-card-value">
              {stats.questions.toLocaleString('vi-VN')}
            </p>
          </div>


          {/* Tổng đề thi */}
          <div className="stat-card stat-card--exams">
            <div className="stat-card-top">
              <div className="stat-card-icon">
                🧾
              </div>

              <span className="stat-card-trend">
                ↗ +5
              </span>
            </div>

            <p className="stat-card-label">
              Tổng đề thi
            </p>

            <p className="stat-card-value">
              {stats.total}
            </p>
          </div>


          {/* Đề đang hoạt động */}
          <div className="stat-card stat-card--active">
            <div className="stat-card-top">
              <div className="stat-card-icon">
                ▶
              </div>

              <span className="stat-card-live">
                LIVE
              </span>
            </div>

            <p className="stat-card-label">
              Đề đang hoạt động
            </p>

            <p className="stat-card-value">
              {stats.published.toString().padStart(2, '0')}
            </p>
          </div>


          {/* Học sinh đã làm */}
          <div className="stat-card stat-card--students">
            <div className="stat-card-top">
              <div className="stat-card-icon">
                👥
              </div>

              <span className="stat-card-total">
                Tổng cộng
              </span>
            </div>

            <p className="stat-card-label">
              Học sinh đã làm
            </p>

            <p className="stat-card-value">
              {Math.max(stats.total * 15, 0).toLocaleString('vi-VN')}
            </p>
          </div>

        </section>        
        
       {/*  <section className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-icon stat-card--primary">📌</div>
            <p className="stat-card-label">TỔNG CÂU HỎI</p>
            <p className="stat-card-value">{stats.questions.toLocaleString('vi-VN')}</p>
            <p className="stat-card-note">Số câu hỏi trong ngân hàng</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon stat-card-icon--success">🧾</div>
            <p className="stat-card-label">TỔNG ĐỀ THI</p>
            <p className="stat-card-value">{stats.total}</p>
            <p className="stat-card-note">Đã tạo trong hệ thống</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon stat-card-icon--warning">🚀</div>
            <p className="stat-card-label">ĐANG HOẠT ĐỘNG</p>
            <p className="stat-card-value">{stats.published.toString().padStart(2, '0')}</p>
            <p className="stat-card-note">Sẵn sàng cho học sinh</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">👥</div>
            <p className="stat-card-label">LƯỢT LÀM BÀI</p>
            <p className="stat-card-value-sm">{Math.max(stats.total * 15, 0)}</p>
            <p className="stat-card-note">Ước tính học sinh tham gia</p>
          </div>
        </section>*/}

        {/* Phần chia cột giữa: Kết quả trung bình & Hồ sơ / Hoạt động gần đây */}
        <section className="overview-grid">
          <div className="overview-panel overview-summary-card">
            <div className="summary-card-header">
              <div>
                <h2 className="panel-title">Kết quả trung bình</h2>
                <p className="panel-subtitle">Thống kê điểm trung bình theo từng khối lớp</p>
              </div>
              <button className="btn-outline" onClick={() => navigate('/teacher/results')}>Xem chi tiết</button>
            </div>

            <div className="summary-score-row">
              <div>
                <p className="summary-score-value">7.8</p>
                <p className="summary-score-note">Điểm trung bình chung toàn trường</p>
              </div>
              <div className="summary-score-pill">+0.4 so với kỳ trước</div>
            </div>

            <div className="summary-chart-row">
              <div className="summary-chart-item">
                <p className="summary-chart-value">7.9</p>
                <p className="summary-chart-label">Khối 10</p>
              </div>
              <div className="summary-chart-item">
                <p className="summary-chart-value">7.4</p>
                <p className="summary-chart-label">Khối 11</p>
              </div>
              <div className="summary-chart-item">
                <p className="summary-chart-value">8.1</p>
                <p className="summary-chart-label">Khối 12</p>
              </div>
              <div className="summary-chart-item">
                <p className="summary-chart-value">7.6</p>
                <p className="summary-chart-label">Đề chuyên</p>
              </div>
            </div>
          </div>

          <aside className="overview-panel overview-activity-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Hoạt động gần đây</h2>
                <p className="panel-subtitle">Cập nhật nhanh về lớp và học sinh</p>
              </div>
            </div>
            <div className="activity-list">
              {recentActivities.map((item, index) => (
                <div className="activity-item" key={index}>
                  <div className="activity-item-dot" />
                  <div className="activity-item-body">
                    <p className="activity-item-title">{item.name}</p>
                    <p className="activity-item-text">{item.action}</p>
                    <p className="activity-item-meta">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* Danh sách lớp học quản lý */}
        <section className="class-card-grid" style={{ marginBottom: '24px' }}>
          {classCards.map(({ title, subject, students, room, color }) => (
            <div className={`class-card class-card--${color}`} key={title}>
              <div className="class-card-header">
                <div>
                  <p className="class-card-title">{title}</p>
                  <p className="class-card-subtitle">{subject}</p>
                </div>
                <button className="btn-outline" style={{ background: 'rgba(255,255,255,0.7)', border: 'none' }}>Chi tiết</button>
              </div>
              <div className="class-card-meta">{students} học sinh · {room}</div>
              <div className="class-card-footer">
                <div className="avatar-group">
                  <div className="avatar-small">NT</div>
                  <div className="avatar-small">LM</div>
                  <div className="avatar-small">PL</div>
                </div>
                <button className="btn-start">Vào lớp</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
