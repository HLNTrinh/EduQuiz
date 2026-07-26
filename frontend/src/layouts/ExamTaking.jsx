import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAttemptService } from "../services/services";
import { useAuth } from "../context/AuthContext";
import "../styles/ExamTaking.css";

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function ExamTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [flagged, setFlagged] = useState({}); // { [questionId]: true }
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

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
  const flaggedCount = useMemo(() => Object.keys(flagged).length, [flagged]);
  const totalQuestions = quiz?.questions?.length || 0;
  const blankCount = totalQuestions - answeredCount;
  const progressPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

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

  if (loading) return <div className="exam-loading">Đang tải...</div>;
  if (!quiz || !question) return <div className="exam-loading">Không thể tải đề thi</div>;

  return (
    <div className="exam-take-shell">
      <header className="exam-take-header">
        <div className="exam-take-brand">
          <span className="exam-take-logo">🎓</span>
          <h1>{quiz.title}</h1>
        </div>
        <div className="exam-take-header-actions">
          <div className={`exam-timer-chip ${timeLeft < 60 ? "danger" : ""}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button className="btn-submit-exam" onClick={handleSubmit}>
            Nộp bài
          </button>
        </div>
      </header>

      <div className="exam-take-progress">
        <span>Tiến độ làm bài: {answeredCount}/{totalQuestions} câu</span>
        <span className="progress-pct">{progressPct}% Hoàn thành</span>
      </div>
      <div className="progress-track-exam">
        <div className="progress-fill-exam" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="exam-take-body">
        <div className="exam-question-card">
          <div className="exam-question-top">
            <div>
              <span className="exam-question-label">CÂU HỎI {currentIndex + 1}</span>
              <div className="exam-question-tags">
                {question.topic && <span className="tag-pill">{question.topic}</span>}
                {question.difficulty && (
                  <span className="tag-pill">MỨC ĐỘ: {question.difficulty}</span>
                )}
              </div>
            </div>
            <button
              className={`btn-flag ${flagged[question._id] ? "active" : ""}`}
              onClick={toggleFlag}
            >
              🔖 {flagged[question._id] ? "Bỏ đánh dấu" : "Xem sau"}
            </button>
          </div>

          <p className="exam-question-content">{question.content}</p>

          {question.image && (
            <img className="exam-question-image" src={question.image} alt="" />
          )}

          <div className="exam-options">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`exam-option ${answers[question._id] === idx ? "selected" : ""}`}
                onClick={() => handleSelectAnswer(idx)}
              >
                <span className="exam-option-radio" />
                <span>
                  {String.fromCharCode(65 + idx)}. {option.text}
                </span>
              </button>
            ))}
          </div>

          <div className="exam-nav-row">
            <button
              className="btn-outline"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              ← Câu trước
            </button>
            <button
              className="btn-primary"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === totalQuestions - 1}
            >
              Câu tiếp theo →
            </button>
          </div>
        </div>

        <aside className="exam-sidebar">
          <div className="card exam-qlist-card">
            <h3>Danh sách câu hỏi</h3>
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
                <span className="qlist-stat-value flag">🔖</span>
                <span className="qlist-stat-label">XEM SAU</span>
              </div>
            </div>

            <div className="exam-qgrid">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isFlagged = flagged[q._id];
                const isAnswered = answers[q._id] !== undefined;
                let cls = "qgrid-btn";
                if (isCurrent) cls += " current";
                else if (isFlagged) cls += " flagged";
                else if (isAnswered) cls += " answered";
                return (
                  <button key={q._id} className={cls} onClick={() => goTo(idx)}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card exam-student-card">
            <img
              className="exam-student-avatar"
              src={user?.avatar || "https://i.pravatar.cc/64?img=12"}
              alt=""
            />
            <div>
              <div className="exam-student-name">{user?.name || "Học sinh"}</div>
              <div className="exam-student-msv">MSSV: {user?.studentId || "—"}</div>
            </div>
          </div>

          <div className="exam-notice-box">
            ℹ️ Hệ thống tự động lưu đáp án sau mỗi lần chọn. Nếu gặp sự cố mạng, hãy giữ nguyên màn hình và liên hệ giám thị.
          </div>
        </aside>
      </div>

      <button className="exam-support-btn">🎧 Hỗ trợ</button>
    </div>
  );
}