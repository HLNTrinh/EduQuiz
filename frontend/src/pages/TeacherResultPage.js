import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAttemptService } from '../services/services';
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
    quizPerformance: [],
    topStudents: [],
    recentResults: [],
  });

  const [loading, setLoading] = useState(false);

  const loadTeacherAttempts = async () => {
    try {
      setLoading(true);

      const res = await quizAttemptService.getTeacherAttempts();
      const attempts = res.data || [];

      setTeacherAttempts(attempts);

      const averageScore =
        attempts.length === 0
          ? 0
          : (
              attempts.reduce((sum, a) => sum + a.score, 0) /
              attempts.length
            ).toFixed(1);

      const passRate =
        attempts.length === 0
          ? 0
          : Math.round(
              (attempts.filter((a) => a.isPassed).length * 100) /
                attempts.length
            );

      setTeacherStats({
        averageScore,
        passRate,
        totalAttempts: attempts.length,
        completedQuizzes: [...new Set(attempts.map((a) => a.quizId._id))].length,
        quizPerformance: [],
        topStudents: [],
        recentResults: [],
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherAttempts();
  }, []);

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

          <section className="overview-cards-grid">
            <div className="overview-card overview-card--primary">
              <p className="overview-card-title">Điểm trung bình</p>
              <p className="overview-card-value">{teacherStats.averageScore}</p>
              <p className="overview-card-note">Điểm trung bình trên toàn bộ bài thi.</p>
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
              <p className="overview-card-title">Bài thi đã hoàn thành</p>
              <p className="overview-card-value">{teacherStats.completedQuizzes}</p>
              <p className="overview-card-note">Số bài thi giáo viên đã tạo và đóng.</p>
            </div>
          </section>

          <section className="overview-content-grid">
            <div className="overview-chart-card">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Hiệu suất đề thi</h2>
                  <p className="panel-subtitle">Tỷ lệ đạt theo từng đề thi gần đây.</p>
                </div>
              </div>
              <div className="score-chart">
                {teacherStats.quizPerformance.map((row) => (
                  <div className="chart-row" key={row.title}>
                    <div className="chart-label">{row.title}</div>
                    <div className="chart-bar">
                      <div
                        className="chart-fill"
                        style={{ width: `${row.passRate}%` }}
                      />
                    </div>
                    <div className="chart-value">{row.passRate}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-list-card">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Học sinh đứng đầu</h2>
                  <p className="panel-subtitle">Thống kê điểm cao nhất hiện tại.</p>
                </div>
              </div>
              {/*Học sinh đứng đầu*/}
              <ul className="top-students-list">
                {teacherStats.topStudents.map((student) => (
                  <li className="top-student-item" key={student.name}>
                    <div>
                      <p className="student-name">{student.name}</p>
                      <p className="student-meta">Lớp {student.className}</p>
                    </div>
                    <span className="student-score">{student.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="recent-results-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Kết quả mới nhất</h2>
                <p className="panel-subtitle">Bảng tổng hợp điểm vừa nộp.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Bài thi</th>
                    <th>Học sinh</th>
                    <th>Điểm</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherAttempts.map((item)=>(
                    <tr key={item._id}>
                      <td>{item.quizId.title}</td>
                      <td>{item.studentId.name}</td>
                      <td>{item.score}</td>
                      <td>
                        <span className={ item.isPassed ? "status-chip status-chip--success" : "status-chip status-chip--warning"}> 
                          {item.isPassed ? "Đạt" : "Không đạt"} 
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

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