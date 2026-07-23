import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { quizAttemptService } from '../services/services';
import { formatTime } from '../utils/formatTime';
import '../styles/Quiz.css';

export const TakeQuizPage = () => {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setTimeLeft(response.quiz.duration * 60);
    } catch (error) {
      console.error('Failed to start quiz:', error);
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

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz) return <div className="error">Không thể tải đề thi</div>;

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="quiz-timer">
          <span className={timeLeft < 60 ? 'timer-warning' : ''}>
            ⏱️ {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="quiz-progress">
        <span>Câu {currentQuestion + 1}/{quiz.questions.length}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-section">
        <h2>{question.content}</h2>
        <div className="options">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option ${answers[question._id] === index ? 'selected' : ''}`}
              onClick={() => handleSelectAnswer(index)}
            >
              {String.fromCharCode(65 + index)}) {option.text}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          ← Câu trước
        </button>
        {currentQuestion === quiz.questions.length - 1 ? (
          <button onClick={handleSubmit} className="btn-submit">Nộp bài</button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
          >
            Câu sau →
          </button>
        )}
      </div>
    </div>
  );
};