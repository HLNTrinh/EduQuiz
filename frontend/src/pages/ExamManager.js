import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionService, quizService } from '../services/authService';
import '../styles/Exam.css';

const toLocalDatetimeInput = (date) => {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
};

const buildInitialForm = () => ({
  title: '',
  description: '',
  duration: '45',
  maxAttempts: '1',
  startDate: toLocalDatetimeInput(new Date()),
  endDate: toLocalDatetimeInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  showAnswerAfter: false,
  passingScore: '50',
});

export const ExamManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState(buildInitialForm());
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    content: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    category: 'Other',
    difficulty: 'medium',
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionResponse, quizResponse] = await Promise.all([
        questionService.getQuestions().catch(() => []),
        quizService.getQuizzes().catch(() => []),
      ]);
      setQuestions(Array.isArray(questionResponse) ? questionResponse : []);
      setQuizzes(Array.isArray(quizResponse) ? quizResponse : []);
    } catch (error) {
      setMessage('Không thể tải dữ liệu đề thi và câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return questions.filter((item) => {
      const text = `${item.content || ''} ${item.category || ''} ${item.difficulty || ''}`.toLowerCase();
      return text.includes(query);
    });
  }, [questions, searchQuery]);

  const totalPoints = useMemo(() => selectedQuestions.length * 10, [selectedQuestions.length]);

  const handleAddQuestion = (question) => {
    if (selectedQuestions.some((item) => item._id === question._id)) return;
    setSelectedQuestions([...selectedQuestions, { ...question, score: 10 }]);
  };

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter((item) => item._id !== questionId));
  };

  const resetQuestionEditor = () => {
    setEditingQuestionId(null);
    setNewQuestion({
      content: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      category: 'Other',
      difficulty: 'medium',
    });
    setShowQuestionForm(false);
    setMessage('');
  };

  const openQuestionEditor = (question = null) => {
    if (question) {
      setEditingQuestionId(question._id);
      setNewQuestion({
        content: question.content || '',
        options: (question.options || []).map((o) => o.text || '') || ['', '', '', ''],
        correctIndex: (question.options || []).findIndex((o) => o.isCorrect) >= 0 ? (question.options || []).findIndex((o) => o.isCorrect) : 0,
        category: question.category || 'Other',
        difficulty: question.difficulty || 'medium',
      });
    } else {
      setEditingQuestionId(null);
      setNewQuestion({
        content: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        category: 'Other',
        difficulty: 'medium',
      });
    }
    setShowQuestionForm(true);
    setMessage('');
  };

  const handleSaveQuestion = async () => {
    if (!newQuestion.content.trim()) {
      setMessage('Nhập nội dung câu hỏi.');
      return;
    }
    if (newQuestion.options.some((o) => !o.trim())) {
      setMessage('Nhập đầy đủ 4 đáp án.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        content: newQuestion.content.trim(),
        options: newQuestion.options.map((text, idx) => ({ text: text.trim(), isCorrect: idx === newQuestion.correctIndex })),
        category: newQuestion.category,
        difficulty: newQuestion.difficulty,
      };

      const response = editingQuestionId
        ? await questionService.updateQuestion(editingQuestionId, payload)
        : await questionService.createQuestion(payload);
      const savedQuestion = response?.data || response;

      setQuestions((prev) => {
        if (editingQuestionId) {
          return prev.map((item) => (item._id === savedQuestion._id ? savedQuestion : item));
        }
        return [savedQuestion, ...prev];
      });

      if (editingQuestionId) {
        setSelectedQuestions((prev) => prev.map((item) => (item._id === savedQuestion._id ? { ...item, ...savedQuestion } : item)));
        setMessage('Đã cập nhật câu hỏi thành công.');
      } else {
        setSelectedQuestions((prev) => [...prev, { ...savedQuestion, score: 10 }]);
        setMessage('Đã tạo câu hỏi mới và chọn vào đề thi.');
      }

      resetQuestionEditor();
    } catch (err) {
      setMessage(err?.message || 'Không thể lưu câu hỏi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    if (!formData.title.trim()) {
      setMessage('Vui lòng nhập tên đề thi.');
      return;
    }

    if (!selectedQuestions.length) {
      setMessage('Vui lòng chọn ít nhất một câu hỏi cho đề thi.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        questions: selectedQuestions.map((question, index) => ({
          questionId: question._id,
          order: index + 1,
        })),
        duration: Number(formData.duration || 45),
        maxAttempts: Number(formData.maxAttempts || 1),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        showAnswerAfter: Boolean(formData.showAnswerAfter),
        totalPoints,
        passingScore: Number(formData.passingScore || 50),
      };

      const response = formData._id
        ? await quizService.updateQuiz(formData._id, payload)
        : await quizService.createQuiz(payload);
      const createdQuiz = response?.data || response;
      setQuizzes((prev) => {
        if (formData._id) {
          return prev.map((q) => (q._id === formData._id ? createdQuiz : q));
        }
        return [createdQuiz, ...prev];
      });
      setSelectedQuestions([]);
      setFormData(buildInitialForm());
      setMessage(response?.message || 'Tạo đề thi thành công.');
      return createdQuiz;
    } catch (error) {
      setMessage(error.message || 'Không thể tạo đề thi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditQuiz = async (quiz) => {
    try {
      setLoading(true);
      const response = await quizService.getQuiz(quiz._id || quiz.id);
      const q = response?.data || response;
      // populate form
      setFormData({
        _id: q._id || q.id,
        title: q.title || '',
        description: q.description || '',
        duration: q.duration?.toString() || '45',
        maxAttempts: q.maxAttempts?.toString() || '1',
        startDate: q.startDate ? toLocalDatetimeInput(q.startDate) : toLocalDatetimeInput(new Date()),
        endDate: q.endDate ? toLocalDatetimeInput(q.endDate) : toLocalDatetimeInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        showAnswerAfter: Boolean(q.showAnswerAfter),
        passingScore: q.passingScore?.toString() || '50',
      });

      // map questions to full objects from questions list
      const selected = (q.questions || []).map((it) => {
        const matched = questions.find((qq) => String(qq._id) === String(it.questionId));
        return matched ? { ...matched, score: 10 } : { _id: it.questionId, score: 10 };
      });

      setSelectedQuestions(selected);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage(error.message || 'Không thể tải đề thi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đề thi này?')) return;
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => (q._id || q.id) !== quizId));
      setMessage('Đã xóa đề thi.');
    } catch (error) {
      setMessage(error.message || 'Không thể xóa đề thi.');
    }
  };

  const handlePublishQuiz = async (quizId) => {
    try {
      await quizService.publishQuiz(quizId);
      // refresh list
      await loadData();
      setMessage('Đã công bố đề thi.');
    } catch (error) {
      setMessage(error.message || 'Không thể công bố đề thi.');
    }
  };

  return (
    <div className="dash-shell">
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
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/dashboard'); }}>
            <span className="sidebar-icon">▦</span> Tổng quan
          </a>
          <a className="sidebar-link sidebar-link--active" href="#" onClick={(e) => e.preventDefault()}>
            <span className="sidebar-icon">📄</span> Đề thi
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/questions'); }}>
            <span className="sidebar-icon">📝</span> Ngân hàng câu hỏi
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/members'); }}>
            <span className="sidebar-icon">👥</span> Thành viên
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/results'); }}>
            <span className="sidebar-icon">📊</span> Kết quả
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

      <main className="dash-main">
        <header className="dash-header dash-header--overview">
          <div>
            <p className="overview-badge">Tạo đề thi mới</p>
            <h1 className="dash-greeting">Tạo đề thi</h1>
            <p className="dash-subtitle">Thiết lập đề kiểm tra, chọn câu hỏi và xuất bản cho học sinh.</p>
          </div>
          <div className="overview-actions">
            {/*}
            <button className="btn-outline" type="button" onClick={() => {
              // create new quiz: reset form and selected questions
              setFormData(buildInitialForm());
              setSelectedQuestions([]);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}>Tạo đề thi</button>
            */}
            <button className="btn-outline" type="button" onClick={() => loadData()}>Lưu bản nháp</button>
            <button className="btn-start" type="button" onClick={async () => {
              try {
                const created = await handleSubmit({ preventDefault: () => {} });
                const id = created?._id || created?.id || formData._id;
                if (id) await handlePublishQuiz(id);
              } catch (e) {
                // ignore
              }
            }}>Xuất bản & Giao bài</button>
          </div>
        </header>

        {message ? <div className="notice">{message}</div> : null}

        <form id="exam-form" onSubmit={handleSubmit}>
          <section className="exam-form-grid">
            <div className="exam-form-card">
              <label className="field-label">Tên đề thi</label>
              <input
                className="form-input"
                type="text"
                placeholder="Kiểm tra Toán Cao cấp - Chương 1"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              />
            </div>
            <div className="exam-form-card">
              <label className="field-label">Mô tả</label>
              <input
                className="form-input"
                type="text"
                placeholder="Ghi chú cho học sinh"
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              />
            </div>
            <div className="exam-form-card">
              <label className="field-label">Thời gian làm bài (phút)</label>
              <input
                className="form-input"
                type="number"
                min="10"
                max="180"
                value={formData.duration}
                onChange={(event) => setFormData({ ...formData, duration: event.target.value })}
              />
            </div>
            <div className="exam-form-card exam-form-card--toggle">
              <label className="field-label">Hiển đáp án</label>
              <div className="toggle-container">
                <span>Không</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.showAnswerAfter}
                    onChange={(event) => setFormData({ ...formData, showAnswerAfter: event.target.checked })}
                  />
                  <span className="toggle-slider" />
                </label>
                <span>Có</span>
              </div>
            </div>
            <div className="exam-form-card">
              <label className="field-label">Số lần làm</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="5"
                value={formData.maxAttempts}
                onChange={(event) => setFormData({ ...formData, maxAttempts: event.target.value })}
              />
            </div>
            <div className="exam-form-card">
              <label className="field-label">Điểm đạt</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="100"
                value={formData.passingScore}
                onChange={(event) => setFormData({ ...formData, passingScore: event.target.value })}
              />
            </div>
            <div className="exam-form-card">
              <label className="field-label">Bắt đầu</label>
              <input
                className="form-input"
                type="datetime-local"
                value={formData.startDate}
                onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
              />
            </div>
            <div className="exam-form-card">
              <label className="field-label">Kết thúc</label>
              <input
                className="form-input"
                type="datetime-local"
                value={formData.endDate}
                onChange={(event) => setFormData({ ...formData, endDate: event.target.value })}
              />
            </div>
            <div className="exam-form-card exam-form-card--summary">
              <p className="summary-label">Trạng thái</p>
              <div className="summary-pill summary-pill--draft">Bản nháp</div>
              <div className="summary-stats">
                <div>
                  <p className="summary-number">{selectedQuestions.length}</p>
                  <p className="summary-text">Câu hỏi đã chọn</p>
                </div>
                <div>
                  <p className="summary-number">{totalPoints.toFixed(1)}</p>
                  <p className="summary-text">Tổng điểm</p>
                </div>
              </div>
            </div>
          </section>
        </form>

        <section className="exam-content-grid">
          <div className="exam-panel exam-panel--left">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Ngân hàng câu hỏi</h2>
                <p className="panel-subtitle">Chọn câu hỏi phù hợp để thêm vào đề thi.</p>
              </div>
              <div className="panel-actions">
                <div className="panel-badge">{questions.length.toLocaleString()} câu</div>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn-outline btn-small" type="button" onClick={() => openQuestionEditor(null)}>Thêm câu hỏi</button>
              </div>
            </div>

            {showQuestionForm && (
              <div className="question-editor-panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">{editingQuestionId ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}</h3>
                    <p className="panel-subtitle">Nhập câu hỏi trực tiếp trên giao diện, sau đó lưu hoặc chọn vào đề thi.</p>
                  </div>
                  <button className="btn-outline btn-small" type="button" onClick={resetQuestionEditor}>Đóng</button>
                </div>

                <label className="field-label">Nội dung câu hỏi</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                />

                <div className="question-option-grid">
                  {[0, 1, 2, 3].map((i) => (
                    <label key={i} className="question-option-row">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={newQuestion.correctIndex === i}
                        onChange={() => setNewQuestion({ ...newQuestion, correctIndex: i })}
                      />
                      <input
                        className="form-input"
                        placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                        value={newQuestion.options[i]}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          options: newQuestion.options.map((option, idx) => (idx === i ? e.target.value : option)),
                        })}
                      />
                    </label>
                  ))}
                </div>

                <div className="question-editor-meta">
                  <select
                    className="form-input"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  >
                    <option>Math</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>History</option>
                    <option>Geography</option>
                    <option>English</option>
                    <option>Other</option>
                  </select>
                  <select
                    className="form-input"
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>

                <div className="question-editor-actions">
                  <button className="btn-outline" type="button" onClick={resetQuestionEditor}>Hủy</button>
                  <button className="btn-start" type="button" onClick={handleSaveQuestion} disabled={submitting}>
                    {editingQuestionId ? 'Cập nhật câu hỏi' : 'Lưu và chọn câu hỏi'}
                  </button>
                </div>
              </div>
            )}

            <div className="question-list">
              {loading ? (
                <p>Đang tải câu hỏi...</p>
              ) : filteredQuestions.length ? (
                filteredQuestions.map((item) => (
                  <div key={item._id} className="question-item">
                    <div>
                      <p className="question-label">{item.category || 'Câu hỏi'}</p>
                      <p className="question-title">{item.content}</p>
                      <div className="question-meta">
                        <span>{item.category}</span>
                        <span>{item.difficulty === 'easy' ? 'Dễ' : item.difficulty === 'hard' ? 'Khó' : 'Trung bình'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn-outline btn-small" onClick={() => handleAddQuestion(item)}>Thêm</button>
                      <button type="button" className="btn-outline btn-small" onClick={() => openQuestionEditor(item)}>Chỉnh sửa</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có câu hỏi nào trong ngân hàng của bạn.</p>
              )}
            </div>
          </div>

          <div className="exam-panel exam-panel--right">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Nội dung đề thi</h2>
                <p className="panel-subtitle">Cấu trúc đề thi và điểm số từng câu.</p>
              </div>
              <div className="panel-actions" style={{ alignItems: 'center' }}>
                <div className="right-stats">
                  <div className="stat-pill">{selectedQuestions.length} / 20 câu</div>
                  <div className="stat-pill stat-pill--blue">{totalPoints.toFixed(1)} điểm</div>
                </div>
                <div className="panel-actions-buttons">
                  <button
                    className="btn-outline btn-small"
                    type="button"
                    onClick={() => setSelectedQuestions((prev) => {
                      const shuffled = [...prev].sort(() => Math.random() - 0.5);
                      return shuffled;
                    })}
                  >
                    Trộn câu hỏi
                  </button>
                  <button className="btn-outline btn-small" type="button">Nhập file</button>
                </div>
              </div>
            </div>
            <div className="exam-summary-card">
              {selectedQuestions.length ? (
                selectedQuestions.map((item, index) => (
                  <div className="exam-summary-row" key={item._id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="question-title">{item.content}</p>
                      <p className="question-detail">Điểm: {item.score}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button type="button" className="btn-outline btn-small" onClick={() => handleRemoveQuestion(item._id)}>Xóa</button>
                        <button type="button" className="btn-outline btn-small" onClick={() => openQuestionEditor(item)}>Chỉnh sửa</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa chọn câu hỏi nào.</p>
              )}
            </div>
          </div>
        </section>

        <section className="recent-exams-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Danh sách đề thi gần đây</h2>
              <p className="panel-subtitle">Quản lý nhanh các đề thi đang có.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Tên đề thi</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Số câu</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((item) => (
                  <tr key={item._id || item.id}>
                    <td>{item.title}</td>
                    <td>{item.description || 'Không có mô tả'}</td>
                    <td>
                      <span className={`status-chip ${item.isPublished ? 'status-chip--success' : 'status-chip--draft'}`}>
                        {item.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td>{item.questions?.length || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-outline btn-small" type="button" onClick={() => handleEditQuiz(item)}>Sửa</button>
                        {!item.isPublished && (
                          <button className="btn-outline btn-small" type="button" onClick={() => handlePublishQuiz(item._id || item.id)}>Công bố</button>
                        )}
                        <button className="btn-outline btn-small" type="button" onClick={() => handleDeleteQuiz(item._id || item.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ExamManager;
