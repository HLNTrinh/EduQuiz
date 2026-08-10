import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { quizAttemptService } from '../services/services';
import { formatTime } from '../utils/formatTime';
import '../styles/TakeQuiz.css';

export const TakeQuizPage = () => {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    try {
      await quizAttemptService.submitQuiz(attemptId);
      window.location.href = `/result/${attemptId}`;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  }, [attemptId]);

  const startQuiz = useCallback(async () => {
    try {
      const response = await quizAttemptService.startQuizAttempt(quizId);
      setQuiz(response.quiz);
      setAttemptId(response.attemptId);
      // Đếm ngược = min(thời gian làm bài, thời gian còn lại đến deadline)
      const durationSeconds = (response.quiz.duration || 0) * 60;
      let timeLeft = durationSeconds;
      if (response.quiz.deadline) {
        const deadlineSeconds = Math.floor(
          (new Date(response.quiz.deadline).getTime() - Date.now()) / 1000
        );
        if (deadlineSeconds < timeLeft) timeLeft = deadlineSeconds;
      }
      setTimeLeft(Math.max(timeLeft, 0));
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setError(err?.message || 'Không thể tải đề thi');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

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

  const handleSelectAnswer = async (optionIndex) => {
    const questionId = quiz.questions[currentQuestion]._id;
    setAnswers({ ...answers, [questionId]: optionIndex });
    try {
      await quizAttemptService.saveAnswer(attemptId, {
        questionId,
        selectedOptionIndex: optionIndex,
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

const getOptionClass = (question, index) => {
    const selectedIndex = answers[question._id];
    if (selectedIndex === index) return 'tq-option selected';
    if (selectedIndex === undefined) return 'tq-option';
    
    // Nếu không cho hiển thị đáp án: chỉ highlight đáp án đã chọn
    if (!quiz.showAnswerAfter) {
      if (index === selectedIndex) return 'tq-option selected';
      return 'tq-option';
    }
    
    // Nếu cho hiển thị đáp án: hiển thị đúng/sai
    if (index === question.options.findIndex((opt) => opt.isCorrect)) {
      return 'tq-option correct';
    }
    if (index === selectedIndex && !question.options[index].isCorrect) {
      return 'tq-option incorrect';
    }
    return 'tq-option';
  };

  if (loading) return <div className="tq-loading">Đang tải...</div>;
  if (error) return <div className="tq-error">{error}</div>;
  if (!quiz) return <div className="tq-error">Không thể tải đề thi</div>;

  const question = quiz.questions[currentQuestion];

  return (
    <div className="tq-page">
      <div className="tq-container">
        <div className="tq-body">
          {/* Khu vực trái: làm bài */}
          <section className="tq-main">
            <div className="tq-topbar">
              <span className="tq-quiz-title">{quiz.title}</span>
              <div className="tq-timer">
                <span className="tq-timer-icon">⏱</span>
                <span className={timeLeft < 60 ? 'tq-timer-value warning' : 'tq-timer-value'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="tq-progress-label">
              CÂU HỎI {currentQuestion + 1} / {quiz.questions.length}
            </div>

            <div className="tq-question">
              <p className="tq-question-content">{question.content}</p>
            </div>

            <div className="tq-options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={getOptionClass(question, index)}
                  onClick={() => handleSelectAnswer(index)}
                >
                  <span className="tq-option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="tq-option-text">{option.text}</span>
                </button>
              ))}
            </div>

            {answers[question._id] !== undefined && question.explanation && (
              <div className="tq-feedback">
                <div className="tq-feedback-row tq-feedback-explanation">
                  <span className="tq-feedback-label">Giải thích:</span>
                  <span className="tq-feedback-value">{question.explanation}</span>
                </div>
              </div>
            )}

            <div className="tq-nav">
              <button
                className="tq-btn tq-btn-prev"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                ← Câu trước
              </button>
              {currentQuestion === quiz.questions.length - 1 ? (
                <button className="tq-btn tq-btn-submit" onClick={handleSubmit}>
                  Nộp bài thi
                </button>
              ) : (
                <button
                  className="tq-btn tq-btn-next"
                  onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                >
                  Câu tiếp theo →
                </button>
              )}
            </div>
          </section>

          {/* Đường phân cách dọc */}
          <div className="tq-divider" />

          {/* Khu vực phải: Phiếu trả lời */}
          <aside className="tq-sheet">
            <h3 className="tq-sheet-title">Phiếu trả lời</h3>
            <div className="tq-sheet-grid">
              {quiz.questions.map((q, i) => {
                const isCurrent = i === currentQuestion;
                const isAnswered = answers[q._id] !== undefined;
                let cls = 'tq-cell';
                if (isCurrent) cls += ' current';
                else if (isAnswered) cls += ' answered';
                else cls += ' empty';
                return (
                  <button
                    key={q._id || i}
                    className={cls}
                    onClick={() => setCurrentQuestion(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="tq-sheet-divider" />
            <div className="tq-legend">
              <span className="tq-legend-item">
                <span className="tq-legend-dot current"></span> Đang làm
              </span>
              <span className="tq-legend-item">
                <span className="tq-legend-dot answered"></span> Đã trả lời
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};