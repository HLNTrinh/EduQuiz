import React, { useState, useEffect, useMemo } from 'react';
import { FiBell, FiHelpCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizService, quizAttemptService } from '../services/services';
import { classService } from '../services/authService';
import { getNotifications } from '../services/adminService';
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import '../styles/TeacherDashBoard.css';

export const TeacherDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherAttempts, setTeacherAttempts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    averageScore: 0,
    passRate: 0,
    totalAttempts: 0,
    completedQuizzes: 0,
  });
  const [classSummaries, setClassSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications({ page: 1, limit: 10 });
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [quizzesResponse, classesResponse, attemptsResponse] = await Promise.all([
        quizService.getQuizzes({ page: 1, limit: 50 }),
        classService.getTeacherClasses(user._id),
        quizAttemptService.getTeacherAttempts({ page: 1, limit: 1000 }),
      ]);

      const quizList = Array.isArray(quizzesResponse)
        ? quizzesResponse
        : quizzesResponse?.data ?? [];

      const classesList = Array.isArray(classesResponse)
        ? classesResponse
        : classesResponse?.data ?? [];

      const attempts = Array.isArray(attemptsResponse)
        ? attemptsResponse
        : attemptsResponse?.data ?? [];

      setQuizzes(quizList);
      setClasses(classesList);
      setTeacherAttempts(attempts);

      const summary = calculateTeacherSummary(attempts);
      setSummaryStats(summary);
      setClassSummaries(calculateClassSummaries(attempts, quizList, classesList));
    } catch (error) {
      console.error('Failed to fetch teacher dashboard data:', error);
      setQuizzes([]);
      setClasses([]);
      setTeacherAttempts([]);
      setSummaryStats({ averageScore: 0, passRate: 0, totalAttempts: 0, completedQuizzes: 0 });
      setClassSummaries([]);
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
  // Function to format time ago

  const formatTimeAgo = (date) => {
    if (!date) return 'vừa xong';
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  const recentActivities = useMemo(() => {
    if (!teacherAttempts || teacherAttempts.length === 0) {
      return [];
    }

    return teacherAttempts
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map((attempt) => ({
        name: attempt.studentId?.name || 'Học sinh',
        action: `nộp bài ${attempt.quizId?.title || 'một đề thi'}`,
        meta: `${formatTimeAgo(attempt.createdAt)} · Điểm: ${attempt.score ?? 0}`,
      }));
  }, [teacherAttempts]);

  const calculateTeacherSummary = (attempts) => {
    if (!attempts || attempts.length === 0) {
      return { averageScore: 0, passRate: 0, totalAttempts: 0, completedQuizzes: 0 };
    }

    const studentMap = new Map();
    attempts.forEach((attempt) => {
      const studentId = attempt.studentId?._id?.toString();
      if (!studentId) return;
      const score = Number(attempt.score || 0);
      const existing = studentMap.get(studentId);
      if (!existing || score > existing.score) {
        studentMap.set(studentId, {
          score,
          isPassed: attempt.isPassed || false,
        });
      }
    });

    const results = Array.from(studentMap.values());
    const averageScore = results.length
      ? Number((results.reduce((sum, item) => sum + item.score, 0) / results.length).toFixed(1))
      : 0;
    const passRate = results.length
      ? Math.round((results.filter((item) => item.isPassed).length * 100) / results.length)
      : 0;

    return {
      averageScore,
      passRate,
      totalAttempts: attempts.length,
      completedQuizzes: results.length,
    };
  };

  const calculateClassSummaries = (attempts, quizzes, classes) => {
    if (!attempts || attempts.length === 0 || !classes || classes.length === 0) return [];

    const quizClassMap = new Map();
    quizzes.forEach((quiz) => {
      if (!quiz?._id) return;
      const classId = quiz.assignedClass?._id?.toString();
      if (classId) {
        quizClassMap.set(quiz._id.toString(), classId);
      }
    });

    const classNameMap = new Map();
    classes.forEach((classItem) => {
      const id = classItem._id?.toString();
      if (id) classNameMap.set(id, classItem.name || 'Lớp học');
    });

    const classStudentMap = new Map();
    attempts.forEach((attempt) => {
      const quiz = attempt.quizId;
      const quizId = quiz?._id?.toString();
      const classId = quizClassMap.get(quizId);
      if (!classId) return;

      const studentId = attempt.studentId?._id?.toString();
      if (!studentId) return;

      const score = Number(attempt.score || 0);
      const studentMap = classStudentMap.get(classId) || new Map();
      const existing = studentMap.get(studentId);
      if (!existing || score > existing.score) {
        studentMap.set(studentId, { score });
      }
      classStudentMap.set(classId, studentMap);
    });

    const summaries = Array.from(classStudentMap.entries()).map(([classId, studentMap]) => {
      const studentScores = Array.from(studentMap.values()).map((item) => item.score);
      const averageScore = studentScores.length
        ? Number((studentScores.reduce((sum, score) => sum + score, 0) / studentScores.length).toFixed(1))
        : 0;
      return {
        label: classNameMap.get(classId) || 'Lớp học',
        value: averageScore,
      };
    });

    return summaries
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  //const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];
  const chartColors = ['#2563eb'];
  const chartItems = classSummaries.length > 0
    ? classSummaries
    : Array.from({ length: 4 }, (_, index) => ({ label: 'Chưa có dữ liệu', value: 0 }));

  const classCards = classes.map((classItem) => ({
    title: classItem.name || 'Lớp chưa đặt tên',
    subject: classItem.subject?.name || 'Chưa có môn',
    students: classItem.studentCount || classItem.students?.length || 0,
    /*room: classItem.room || 'Chưa có phòng',*/
    color: 'blue',
    teacherName: classItem.teacher?.name || user?.name || 'Giáo viên',
  }));

  return (
    <div className="dash-shell">
      {/* Thanh menu bên trái */}
      <TeacherSidebar />

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
              {user?.name || 'Giáo viên'}
            </span>
          </div>

          {/* Bên phải */}
          <div className="navbar-right">
          {/* Phần bảng thông báo */}
          <div className="notification-dropdown">
            <button
              className="navbar-icon-btn"
              title="Thông báo"
              onClick={() => setIsNotificationPanelOpen((prev) => !prev)}
            >
              <FiBell size={20} />
              {notifications.length > 0 && (
                <span className="navbar-badge">
                  {notifications.length > 99 ? "99+" : notifications.length}
                </span>
              )}
            </button>

            {isNotificationPanelOpen && (
              <div className="notification-popup">
                <div className="notification-popup-header">
                  <h3>Thông báo</h3>
                  <span>{notifications.length} thông báo</span>
                </div>

                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    Chưa có thông báo
                  </div>
                ) : (
                  <div className="notification-popup-list">
                    {notifications.map((item) => (
                      <div className="notification-popup-item" key={item._id}>
                        <div className="notification-icon">
                          📢
                        </div>

                        <div className="notification-content">
                          <h4>{item.title}</h4>

                          <p>{item.content}</p>

                          <span>
                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
{/*
{isNotificationPanelOpen && (
          <section className="notification-panel">
            <div className="notification-panel-header">
              <div>
                <h2>Thông báo</h2>
                <p className="notification-panel-subtitle">Các thông báo mới nhất từ quản trị viên</p>
              </div>
              <span className="notification-count">
                {notifications.length} thông báo
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="notification-empty">Chưa có thông báo mới</div>
            ) : (
              <div className="notification-list">
                {notifications.map((item) => (
                  <div className="notification-item" key={item._id}>
                    <div className="notification-item-content">
                      <div className="notification-item-title">
                        {item.title}
                        {item.pinned && <span className="notification-item-badge">Ghim</span>}
                      </div>
                      <p>{item.content}</p>
                      <div className="notification-item-meta">
                        {new Date(item.createdAt).toLocaleString('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        */}

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
              {(summaryStats.completedQuizzes || 0).toLocaleString('vi-VN')}
            </p>
          </div>

        </section>        

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
                <p className="summary-score-value">
                  {summaryStats.averageScore || 0}
                </p>
                <p className="summary-score-note">
                  Điểm trung bình chung theo học sinh
                </p>
              </div>
              <div className="summary-score-pill">
                {summaryStats.passRate}% học sinh đạt
              </div>
            </div>

            <div className="summary-chart-bar">
              <div className="summary-bar-container">
                {chartItems.map((item, index) => {
                  const maxValue = Math.max(...chartItems.map((i) => Number(i.value || 0)), 1);
                  const heightPercent =
                    maxValue > 0 ? (Number(item.value || 0) / maxValue) * 100 : 0;

                  return (
                    <div className="summary-bar-column" key={index}>
                      <div className="summary-bar-track">
                        <div
                          className="summary-bar-fill"
                          style={{
                            height: `${Math.max(heightPercent, 10)}%`,
                            background: chartColors[index % chartColors.length],
                          }}
                        >
                          <span className="summary-bar-value">
                            {item.value}
                          </span>
                        </div>
                      </div>

                      <span className="summary-bar-caption">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
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
                <button className="btn-start" onClick={() => navigate("/teacher/members")}>Vào lớp </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
