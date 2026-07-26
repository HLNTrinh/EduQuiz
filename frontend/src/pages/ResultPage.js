import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAttemptService } from '../services/authService';
import '../styles/Result.css';

export const ResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacherOverview = !attemptId;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(Boolean(attemptId));
  const [error, setError] = useState(null);

  const teacherStats = useMemo(
    () => ({
      averageScore: 7.8,
      passRate: 86,
      totalAttempts: 124,
      completedQuizzes: 12,
      quizPerformance: [
        { title: 'Đại số 10', passRate: 92 },
        { title: 'Vật lý 11', passRate: 81 },
        { title: 'Tiếng Anh 12', passRate: 75 },
      ],
      topStudents: [
        { name: 'Nguyễn Nhật', score: 9.6, className: '12A1' },
        { name: 'Hoàng Anh', score: 9.4, className: '12A2' },
        { name: 'Mai Lan', score: 9.2, className: '11B3' },
      ],
      recentResults: [
        { quiz: 'Đại số 10', student: 'Phạm Tuấn', score: 8.8, status: 'Đạt' },
        { quiz: 'Vật lý 11', student: 'Hoàng Linh', score: 7.4, status: 'Đạt' },
        { quiz: 'Tiếng Anh 12', student: 'Thu Hà', score: 6.8, status: 'Không đạt' },
      ],
    }),
    []
  );

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await quizAttemptService.getAttemptResult(attemptId);
        setResult(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(err.message || 'Không thể tải kết quả');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreText = (percentage) => {
    if (percentage >= 80) return 'Xuất sắc! 🎉';
    if (percentage >= 60) return 'Khá tốt! 👏';
    return 'Cần cố gắng hơn 💪';
  };

  if (isTeacherOverview) {
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
            <a className="danger" href="#" onClick={(event) => event.preventDefault()}><span>↪</span> Đăng xuất</a>
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
                {teacherStats.recentResults.map((item, index) => (
                  <tr key={`${item.student}-${index}`}>
                    <td>{item.quiz}</td>
                    <td>{item.student}</td>
                    <td>{item.score}</td>
                    <td>
                      <span className={`status-chip ${item.status === 'Đạt' ? 'status-chip--success' : 'status-chip--warning'}`}>
                        {item.status}
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
  }

  if (loading) {
    return (
      <div className="result-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-container">
        <div className="error-message">
          <h2>❌ Lỗi</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-container">
        <div className="error-message">
          <h2>Không tìm thấy kết quả</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-container">
      {/* Header */}
      <div className="result-header">
        <h1>📊 Kết quả bài thi</h1>
        <p className="quiz-title">{result.quizId.title}</p>
      </div>

      {/* Score Section */}
      <div className="result-score-section">
        <div className="score-display">
          <div
            className="score-circle"
            style={{ borderColor: getScoreColor(result.percentage) }}
          >
            <div className="score-number">{result.percentage}%</div>
            <div className="score-out-of">({result.correctAnswers}/{result.totalQuestions})</div>
          </div>
          <div className="score-info">
            <h2 style={{ color: getScoreColor(result.percentage) }}>
              {getScoreText(result.percentage)}
            </h2>
            <div className="status-badge">
              {result.isPassed ? (
                <span className="badge badge-success">✓ Đạt yêu cầu</span>
              ) : (
                <span className="badge badge-danger">✗ Chưa đạt</span>
              )}
            </div>
            <div className="score-details">
              <div className="detail-item">
                <span className="detail-label">Điểm số:</span>
                <span className="detail-value">{result.score} điểm</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Câu đúng:</span>
                <span className="detail-value">{result.correctAnswers}/{result.totalQuestions}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Thời gian:</span>
                <span className="detail-value">{result.timeTaken} phút</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${result.percentage}%`,
              backgroundColor: getScoreColor(result.percentage),
            }}
          ></div>
        </div>
      </div>

      {/* Detailed Answers */}
      <div className="answer-review-section">
        <h3>Chi tiết câu trả lời</h3>
        <div className="answers-list">
          {result.answers.map((answer, index) => (
            <div
              key={index}
              className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="answer-header">
                <div className="question-number">
                  Câu {index + 1}
                  {answer.isCorrect ? (
                    <span className="icon-correct">✓</span>
                  ) : (
                    <span className="icon-incorrect">✗</span>
                  )}
                </div>
                <div className="answer-status">
                  {answer.isCorrect ? (
                    <span className="status correct">Đúng</span>
                  ) : (
                    <span className="status incorrect">Sai</span>
                  )}
                </div>
              </div>

              <div className="question-content">
                <p className="question-text">
                  <strong>Nội dung:</strong> {answer.questionId.content}
                </p>
                {answer.questionId.category && (
                  <p className="question-category">
                    <strong>Chủ đề:</strong> {answer.questionId.category}
                  </p>
                )}
                {answer.questionId.difficulty && (
                  <p className="question-difficulty">
                    <strong>Độ khó:</strong> <span className={`difficulty-${answer.questionId.difficulty}`}>{answer.questionId.difficulty}</span>
                  </p>
                )}
              </div>

              <div className="options-list">
                <p className="options-label"><strong>Các lựa chọn:</strong></p>
                {answer.questionId.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`option ${
                      optIndex === answer.selectedOptionIndex
                        ? answer.isCorrect
                          ? 'selected-correct'
                          : 'selected-incorrect'
                        : option.isCorrect
                        ? 'correct-answer'
                        : ''
                    }`}
                  >
                    <div className="option-label">
                      <input
                        type="radio"
                        disabled
                        checked={optIndex === answer.selectedOptionIndex}
                      />
                      <span className="option-text">{option.text}</span>
                    </div>
                    {optIndex === answer.selectedOptionIndex && answer.isCorrect && (
                      <span className="option-icon">✓ Bạn chọn (Đúng)</span>
                    )}
                    {optIndex === answer.selectedOptionIndex && !answer.isCorrect && (
                      <span className="option-icon">✗ Bạn chọn (Sai)</span>
                    )}
                    {option.isCorrect && optIndex !== answer.selectedOptionIndex && (
                      <span className="option-icon">✓ Đáp án đúng</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button
          onClick={() => navigate('/exams')}
          className="btn btn-primary"
        >
          ← Quay lại danh sách bài thi
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
