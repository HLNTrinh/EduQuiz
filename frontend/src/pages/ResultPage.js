import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAttemptService } from '../services/services';
import { formatDuration } from '../utils/formatTime';
import '../styles/Result.css';

export const ResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
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

  const scrollToQuestion = (index) => {
    setActiveQuestionIndex(index);
    const el = document.getElementById(`result-question-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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
                <span className="detail-value">
  {formatDuration(new Date(result.endTime) - new Date(result.startTime))}
</span>
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

      {/* Question Overview Grid */}
      <div className="result-qgrid-section">
        <div className="qgrid-header">
          <h3>📋 Tổng quan câu hỏi</h3>
          <div className="qgrid-legend">
            <span><span className="dot-q correct"></span> Đúng ({result.correctAnswers})</span>
            <span><span className="dot-q incorrect"></span> Sai ({result.totalQuestions - result.correctAnswers})</span>
          </div>
        </div>
        <div className="result-qgrid">
          {result.answers.map((answer, index) => (
            <button
              key={index}
              className={`qgrid-result-btn ${answer.isCorrect ? 'correct' : 'incorrect'} ${activeQuestionIndex === index ? 'active' : ''}`}
              onClick={() => scrollToQuestion(index)}
              title={`Câu ${index + 1}: ${answer.isCorrect ? 'Đúng' : 'Sai'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Answers */}
      <div className="answer-review-section">
        <h3>📝 Chi tiết câu trả lời</h3>
        <div className="answers-list">
          {result.answers.map((answer, index) => (
            <div
              key={index}
              id={`result-question-${index}`}
              className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="answer-header">
                <div className="question-number">
                  <span>Câu {index + 1}</span>
                  {answer.isCorrect ? (
                    <span className="icon-correct">✓</span>
                  ) : (
                    <span className="icon-incorrect">✗</span>
                  )}
                </div>
                <div className="answer-status">
                  {answer.isCorrect ? (
                    <span className="status correct">✅ Đúng</span>
                  ) : (
                    <span className="status incorrect">❌ Sai</span>
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
                {answer.questionId.options.map((option, optIndex) => {
                  const isSelected = optIndex === answer.selectedOptionIndex;
                  const isCorrectAnswer = option.isCorrect;
                  
                  let optionClass = 'option';
                  let iconText = '';
                  
                  if (isSelected && answer.isCorrect) {
                    optionClass += ' selected-correct';
                    iconText = '✅ Bạn chọn (Đúng)';
                  } else if (isSelected && !answer.isCorrect) {
                    optionClass += ' selected-incorrect';
                    iconText = '❌ Bạn chọn (Sai)';
                  } else if (isCorrectAnswer && !isSelected) {
                    optionClass += ' correct-answer';
                    iconText = '✅ Đáp án đúng';
                  }
                  
                  return (
                    <div
                      key={optIndex}
                      className={optionClass}
                    >
                      <div className="option-label">
                        <input
                          type="radio"
                          disabled
                          checked={isSelected}
                        />
                        <span className="option-text">{option.text}</span>
                      </div>
                      {iconText && (
                        <span className="option-icon">{iconText}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button
          onClick={() => navigate('/student/exams')}
          className="btn btn-primary"
        >
          ← Quay lại danh sách bài thi
        </button>
        {/* <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          Về trang chủ
        </button> */}
      </div>
    </div>
  );
};

export default ResultPage;