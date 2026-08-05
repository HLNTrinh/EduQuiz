import React, { useState, useEffect, useMemo } from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import { FaBell } from "react-icons/fa6";
import {
  FiFileText,
  FiClipboard,
  FiPlay,
  FiUsers
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizService, quizAttemptService } from '../services/services';
import { classService } from '../services/authService';
import { getNotifications } from '../services/adminService';
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import TeacherAvatar from "../components/teacher/TeacherAvatar";
import NotificationDropdown from "../components/teacher/NotificationDropdown";
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
        name: attempt.studentId?.name || "Học sinh",
        quiz: attempt.quizId?.title || "Đề thi",
        score: Number(attempt.score || 0),
        time: formatTimeAgo(attempt.createdAt),

        avatar:
          (attempt.studentId?.name || "HS")
            .split(" ")
            .map(w => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
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

  const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];
  //const chartColors = ['#2563eb'];
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
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <h1 className="dashboard-title">
              Chào mừng trở lại, {user?.name || "Giáo viên"}! 🌞
            </h1>

            <p className="dashboard-subtitle">
              Chúc bạn một ngày làm việc hiệu quả.
            </p>
          </div>

          <div className="dashboard-header-right">
            {/*}
            <div className="notification-dropdown-wrapper">
              <button
                className={`navbar-icon-btn ${
                  isNotificationPanelOpen ? "navbar-icon-btn-active" : ""
                }`}
                onClick={() => setIsNotificationPanelOpen(prev => !prev)}
              >
                <FaBell size={18} />

                {notifications.length > 0 && (
                  <span className="navbar-badge">
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotificationPanelOpen && (
              <div className="notification-popup-panel">
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
            <TeacherAvatar user={user} logout={logout} />
            */}
            <NotificationDropdown notifications={notifications} />
            <TeacherAvatar user={user} logout={logout} />
          </div>
        </header>



        

        {/* Các thẻ thống kê (Stat-grid) */}

        <section className="stat-grid">

          {/* Tổng câu hỏi */}
          <div className="stat-card stat-card--questions">
            <div className="stat-card-top">
              <div className="stat-card-icon">
                <FiFileText size={20} /> 
              </div>
            </div>

            <p className="stat-card-value">
              {stats.questions.toLocaleString("vi-VN")}
            </p>

            <p className="stat-card-label">
              Tổng câu hỏi
            </p>

            <span className="stat-card-badge">
              +12%
            </span>
          </div>


          {/* Tổng đề thi */}
          <div className="stat-card stat-card--exams">
              <div className="stat-card-icon">
                  <FiClipboard size={20} />
              </div>

              <div className="stat-card-value">
                  {stats.total}
              </div>

              <div className="stat-card-label">
                  Tổng đề thi
              </div>

              <div className="stat-card-badge">
                  +5
              </div>
          </div>


          {/* Đề đang hoạt động */}
          <div className="stat-card stat-card--active">
              <div className="stat-card-icon">
                  <FiPlay size={20} />
              </div>

              <div className="stat-card-value">
                  {stats.published.toString().padStart(2, "0")}
              </div>

              <div className="stat-card-label">
                  Đề đang hoạt động
              </div>

              <div className="stat-card-live">
                  LIVE
              </div>
          </div>


          {/* Học sinh đã làm */}
          <div className="stat-card stat-card--students">
              <div className="stat-card-icon">
                  <FiUsers size={20} />
              </div>

              <div className="stat-card-value">
                  {(summaryStats.completedQuizzes || 0).toLocaleString("vi-VN")}
              </div>

              <div className="stat-card-label">
                  Học sinh đã làm
              </div>

              <div className="stat-card-total">
                  Tổng cộng
              </div>
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
            
            <div className="summary-chart">
              {/* Đường kẻ ngang */}
              <div className="summary-chart-grid">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="summary-bar-container">
                {chartItems.map((item, index) => {
                  const maxValue = Math.max(
                    ...chartItems.map(i => Number(i.value || 0)),
                    1
                  );

                 const heightPercent =
                  maxValue > 0
                    ? (Number(item.value || 0) / maxValue) * 100
                    : 0;

                  return (
                    <div className="summary-bar-column" key={index}>
                        <div
                          className="summary-bar-fill"
                          style={{
                            height: `${Math.max(heightPercent, 10)}%`,
                            background: "linear-gradient(180deg, #66A8FF 0%, #2563EB 100%)",
                          }}
                        >
                        <span className="summary-bar-value">
                          {item.value.toFixed(1)}
                        </span>
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

                  <div className="activity-avatar">
                    {item.avatar}
                  </div>

                  <div className="activity-content">

                    <div className="activity-top">

                      <span className="activity-name">
                        {item.name}
                      </span>

                      <span className="activity-time">
                        {item.time}
                      </span>

                    </div>

                    <div className="activity-text">
                      Nộp bài thi:
                      <strong> {item.quiz}</strong>
                    </div>

                    <span
                      className={
                        item.score >= 8
                          ? "activity-score success"
                          : "activity-score warning"
                      }
                    >
                      Điểm: {item.score}
                    </span>

                  </div>

                </div>
              ))}

              <button className="activity-more">
                Xem tất cả hoạt động
              </button>
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
