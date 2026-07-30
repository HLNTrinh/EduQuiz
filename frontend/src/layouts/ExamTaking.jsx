// Trang làm bài thi - Bố cục 3 cột với danh sách câu hỏi bên trái
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { quizAttemptService } from "../services/services";
import { useAuth } from "../context/AuthContext";
import "../styles/ExamTaking.css";

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Tách chuỗi có công thức $...$ để render bằng KaTeX
const renderContent = (text) => {
  if (!text) return null;
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      return <InlineMath key={i} math={part.slice(1, -1)} />;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function ExamTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const startQuiz = useCallback(async () => {
    try {
      const res = await quizAttemptService.startQuizAttempt(quizId);
      setQuiz(res.quiz);
      setAttemptId(res.attemptId);
      setTimeLeft(res.quiz.duration * 60);
    } catch (err) {
      console.error("Failed to start quiz:", err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const handleSubmit = useCallback(async () => {
    try {
      await quizAttemptService.submitQuiz(attemptId);
      navigate(`/result/${attemptId}`);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 || !attemptId) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, attemptId, handleSubmit]);

  const question = quiz?.questions?.[currentIndex];

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const totalQuestions = quiz?.questions?.length || 0;
  const blankCount = totalQuestions - answeredCount;
  const flaggedCount = useMemo(() => Object.keys(flagged).length, [flagged]);
  const progressPct = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  const handleSelectAnswer = async (optionIndex) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question._id]: optionIndex }));
    try {
      await quizAttemptService.saveAnswer(attemptId, {
        questionId: question._id,
        selectedOptionIndex: optionIndex,
      });
    } catch (err) {
      console.error("Failed to save answer:", err);
    }
  };

  const toggleFlag = () => {
    if (!question) return;
    setFlagged((prev) => {
      const next = { ...prev };
      if (next[question._id]) delete next[question._id];
      else next[question._id] = true;
      return next;
    });
  };

  const goTo = (index) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  };

  const getQuestionStatus = (q, idx) => {
    const isCurrent = idx === currentIndex;
    const isFlagged = flagged[q._id];
    const isAnswered = answers[q._id] !== undefined;

    if (isCurrent) return "current";
    if (isFlagged) return "flagged";
    if (isAnswered) return "answered";
    return "blank";
  };

  if (loading) return <div className="exam-loading">Đang tải...</div>;
  if (!quiz || !question)
    return <div className="exam-loading">Không thể tải đề thi</div>;

  return (
    <div className="exam-take-shell">
      {/* HEADER */}
      <header className="exam-take-header">
        <div className="exam-take-brand">
          <span className="exam-take-logo">🎓</span>
          <h1>{quiz.title}</h1>
        </div>
        <div className="exam-take-header-actions">
          <div className={`exam-timer-chip ${timeLeft < 60 ? "danger" : ""}`}>
            <span className="timer-icon">⏱</span>
            {formatTime(timeLeft)}
          </div>
          <button
            className="btn-submit-exam"
            onClick={() => {
              if (window.confirm(
                blankCount > 0
                  ? `Bạn còn ${blankCount} câu chưa trả lời. Nộp bài ngay?`
                  : "Bạn có chắc chắn muốn nộp bài?"
              )) {
                handleSubmit();
              }
            }}
          >
            Nộp bài
          </button>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="exam-take-progress">
        <span>
          <strong>Tiến độ:</strong> {answeredCount}/{totalQuestions} câu
        </span>
        <span className="progress-pct">{progressPct}% Hoàn thành</span>
      </div>
      <div className="progress-track-exam">
        <div
          className="progress-fill-exam"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* BODY - 3 CỘT */}
      <div className="exam-take-body">
        {/* ===== CỘT TRÁI: Danh sách câu hỏi dạng vertical ===== */}
        <aside className="exam-leftnav">
          <div className="leftnav-header">
            <h3>Danh sách câu</h3>
          </div>
          <div className="leftnav-list">
            {quiz.questions.map((q, idx) => {
              const status = getQuestionStatus(q, idx);
              return (
                <button
                  key={q._id}
                  className={`leftnav-btn leftnav-btn--${status}`}
                  onClick={() => goTo(idx)}
                  title={`Câu ${idx + 1}${status === "answered" ? " (Đã chọn)" : ""}${status === "flagged" ? " (Xem sau)" : ""}`}
                >
                  <span className="leftnav-num">{idx + 1}</span>
                  {status === "flagged" && (
                    <span className="leftnav-flag-icon">🔖</span>
                  )}
                  {status === "answered" && (
                    <span className="leftnav-check-icon">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ===== CỘT GIỮA: Nội dung câu hỏi ===== */}
        <main className="exam-center">
          <div className="exam-question-card">
            {/* Đầu câu hỏi */}
            <div className="exam-question-top">
              <div>
                <span className="exam-question-label">
                  CÂU HỎI {currentIndex + 1} / {totalQuestions}
                </span>
                <div className="exam-question-tags">
                  {question.topic && (
                    <span className="tag-pill">{question.topic}</span>
                  )}
                  {question.difficulty && (
                    <span className="tag-pill">
                      MỨC ĐỘ: {question.difficulty}
                    </span>
                  )}
                </div>
              </div>
              <button
                className={`btn-flag ${flagged[question._id] ? "active" : ""}`}
                onClick={toggleFlag}
              >
                <span>🔖</span>
                <span className="flag-text">
                  {flagged[question._id] ? "Bỏ đánh dấu" : "Xem sau"}
                </span>
              </button>
            </div>

            {/* Nội dung câu hỏi */}
            <p className="exam-question-content">
              {renderContent(question.content)}
            </p>

            {/* Ảnh minh họa */}
            {question.image && (
              <img
                className="exam-question-image"
                src={question.image}
                alt="Minh họa câu hỏi"
              />
            )}

            {/* Các đáp án */}
            <div className="exam-options">
              {question.options.map((option, idx) => {
                const selected = answers[question._id] === idx;
                return (
                  <label
                    key={idx}
                    className={`exam-option ${selected ? "selected" : ""}`}
                    onClick={() => handleSelectAnswer(idx)}
                  >
                    <input
                      type="radio"
                      name={`q-${question._id}`}
                      checked={selected}
                      readOnly
                      className="exam-option-radio-input"
                    />
                    <span className="exam-option-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="exam-option-text">
                      {renderContent(option.text)}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Điều hướng */}
            <div className="exam-nav-row">
              <button
                className="btn-outline"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                ← Câu trước
              </button>

              <div className="exam-nav-center">
                <span className="exam-nav-progress-text">
                  {currentIndex + 1} / {totalQuestions}
                </span>
              </div>

              <button
                className="btn-primary"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === totalQuestions - 1}
              >
                Câu tiếp theo →
              </button>
            </div>
          </div>
        </main>

        {/* ===== CỘT PHẢI: Sidebar thông tin ===== */}
        <aside className="exam-sidebar">
          {/* Thống kê */}
          <div className="card exam-qlist-card">
            <h3>Thống kê</h3>
            <div className="exam-qlist-stats">
              <div className="qlist-stat">
                <span className="qlist-stat-value chosen">{answeredCount}</span>
                <span className="qlist-stat-label">ĐÃ CHỌN</span>
              </div>
              <div className="qlist-stat">
                <span className="qlist-stat-value blank">{blankCount}</span>
                <span className="qlist-stat-label">TRỐNG</span>
              </div>
              <div className="qlist-stat">
                <span className="qlist-stat-value flagged-count">
                  {flaggedCount}
                </span>
                <span className="qlist-stat-label">XEM SAU</span>
              </div>
            </div>
          </div>

          {/* Thành viên */}
          <div className="card exam-student-card">
            <img
              className="exam-student-avatar"
              src={
                user?.avatar ||
                "https://i.pravatar.cc/64?img=12"
              }
              alt=""
            />
            <div>
              <div className="exam-student-name">
                {user?.name || "Học sinh"}
              </div>
              <div className="exam-student-msv">
                MSSV: {user?.studentId || "—"}
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="exam-notice-box">
            ℹ️ Hệ thống tự động lưu đáp án sau mỗi lần chọn. Nếu gặp sự cố mạng,
            hãy giữ nguyên màn hình và liên hệ giám thị.
          </div>
        </aside>
      </div>

      {/* Nút hỗ trợ */}
      <button className="exam-support-btn">🎧 Hỗ trợ</button>
    </div>
  );
}

