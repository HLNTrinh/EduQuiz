import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionService } from '../services/authService';
import '../styles/QuestionsBank.css';

const emptyForm = {
  content: '',
  category: 'Math',
  difficulty: 'medium',
  explanation: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
};

export const QuestionManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [difficulty, setDifficulty] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('Mới nhất');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const subjects = ['Tất cả', 'Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Other'];

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestions();
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setQuestions(items);
    } catch (error) {
      setMessage(error.message || 'Không thể tải câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter((item) => {
        const title = item.content || '';
        const subject = item.category || '';
        const difficultyValue = item.difficulty || '';
        return (
          (selectedSubject === 'Tất cả' || subject === selectedSubject) &&
          (difficulty === 'Tất cả' || difficultyValue === (difficulty === 'Dễ' ? 'easy' : difficulty === 'Khó' ? 'hard' : 'medium')) &&
          (title.toLowerCase().includes(searchQuery.toLowerCase()) || (item._id || '').toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        if (sortOrder === 'Mới nhất') {
          return bTime - aTime;
        }
        return aTime - bTime;
      });
  }, [questions, searchQuery, selectedSubject, difficulty, sortOrder]);

  const handleOpenForm = (question = null) => {
    if (question) {
      setFormData({
        ...question,
        options: question.options?.map((option) => ({ ...option })) || emptyForm.options,
      });
    } else {
      setFormData(emptyForm);
    }
    setMessage('');
    setShowForm(true);
  };

  const handleOptionChange = (index, field, value) => {
    const nextOptions = [...formData.options];
    nextOptions[index] = { ...nextOptions[index], [field]: value };
    setFormData({ ...formData, options: nextOptions });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        content: formData.content.trim(),
        options: formData.options.map((option) => ({ text: option.text.trim(), isCorrect: Boolean(option.isCorrect) })),
        category: formData.category,
        difficulty: formData.difficulty,
        explanation: formData.explanation.trim(),
      };

      const response = formData._id
        ? await questionService.updateQuestion(formData._id, payload)
        : await questionService.createQuestion(payload);
      const savedQuestion = response?.data || response;
      setQuestions((prev) => {
        if (formData._id) {
          return prev.map((item) => (item._id === formData._id ? savedQuestion : item));
        }
        return [savedQuestion, ...prev];
      });
      setShowForm(false);
      setFormData(emptyForm);
      setMessage(formData._id ? 'Đã cập nhật câu hỏi thành công.' : 'Đã thêm câu hỏi mới thành công.');
    } catch (error) {
      setMessage(error.message || 'Không thể lưu câu hỏi.');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await questionService.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((item) => item._id !== questionId));
      setMessage('Đã xóa câu hỏi thành công.');
    } catch (error) {
      setMessage(error.message || 'Không thể xóa câu hỏi.');
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
{/*
        <div className="sidebar-brand">
          <div className="sidebar-logo">🎓</div>
          <div>
            <p className="sidebar-brand-name">EduQuiz</p>
            <p className="sidebar-brand-sub">GIÁO VIÊN</p>
          </div>

        </div>*/}

        <nav className="sidebar-nav">
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/dashboard'); }}>
            <span className="sidebar-icon">▦</span> Tổng quan
          </a>
          <a className="sidebar-link sidebar-link--active" href="#" onClick={(e) => e.preventDefault()}>
            <span className="sidebar-icon">🧠</span> Ngân hàng câu hỏi
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/exams'); }}>
            <span className="sidebar-icon">📄</span> Đề thi
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/results'); }}>
            <span className="sidebar-icon">📊</span> Kết quả
          </a>
          <a className="sidebar-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/teacher/members'); }}>
            <span className="sidebar-icon">👥</span> Thành viên
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
            <p className="overview-badge">Ngân hàng câu hỏi</p>
            <h1 className="dash-greeting">Ngân hàng câu hỏi</h1>
            <p className="dash-subtitle">Quản lý và tổ chức kho câu hỏi trắc nghiệm của bạn.</p>
          </div>
          <div className="overview-actions">
            <button className="btn-start" type="button" onClick={() => handleOpenForm(null)}>+ Thêm câu hỏi mới</button>
          </div>
        </header>

        {message ? <div className="notice" style={{ marginBottom: '16px' }}>{message}</div> : null}

        {showForm ? (
          <section className="question-form-panel">
            <div className="question-form-header">
              <div>
                <h3>{formData._id ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
                <p className="panel-subtitle">Nhập câu hỏi trực tiếp lên giao diện, không cần bật hộp thoại.</p>
              </div>
              <button className="btn-outline btn-small" type="button" onClick={() => setShowForm(false)}>Ẩn form</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="field-label">Nội dung câu hỏi</label>
              <textarea
                className="form-input"
                rows="4"
                value={formData.content}
                onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                required
              />

              <label className="field-label">Môn học</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
              >
                {subjects.filter((subject) => subject !== 'Tất cả').map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              <label className="field-label">Độ khó</label>
              <select
                className="form-input"
                value={formData.difficulty}
                onChange={(event) => setFormData({ ...formData, difficulty: event.target.value })}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>

              <label className="field-label">Đáp án</label>
              {formData.options.map((option, index) => (
                <div key={index} className="question-answer-row">
                  <input
                    className="form-input"
                    type="text"
                    placeholder={`Đáp án ${index + 1}`}
                    value={option.text}
                    onChange={(event) => handleOptionChange(index, 'text', event.target.value)}
                    required
                  />
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={Boolean(option.isCorrect)}
                      onChange={() => {
                        const nextOptions = formData.options.map((item, idx) => ({ ...item, isCorrect: idx === index }));
                        setFormData({ ...formData, options: nextOptions });
                      }}
                    />
                    Đúng
                  </label>
                </div>
              ))}

              <label className="field-label">Giải thích</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.explanation}
                onChange={(event) => setFormData({ ...formData, explanation: event.target.value })}
              />

              <div className="question-form-actions">
                <button className="btn-outline" type="button" onClick={() => { setFormData(emptyForm); setShowForm(false); }}>Hủy</button>
                <button className="btn-start" type="submit">{formData._id ? 'Cập nhật' : 'Lưu câu hỏi'}</button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="question-bank-toolbar question-bank-header">
          <div className="question-bank-search">
            <input
              className="search-input"
              type="text"
              placeholder="Tìm kiếm theo nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="question-page-actions">
            <div className="filter-select">
              <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Tất cả mức độ</option>
                <option> Dễ</option>
                <option> Trung bình</option>
                <option> Khó</option>
              </select>
            </div>
            <div className="filter-select">
              <select className="form-input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option>Mới nhất</option>
                <option>Cũ nhất</option>
              </select>
            </div>
          </div>
        </section>

        <section className="question-bank-toolbar question-filter-panel">
          <div className="question-filter-row">
            {subjects.map((subject) => (
              <button
                key={subject}
                className={`filter-pill ${selectedSubject === subject ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
          <div className="table-header-actions">
            <p className="table-header-note">Hiển thị 1-{filteredQuestions.length} trong số {questions.length} câu hỏi</p>
          </div>
        </section>

        <div className="question-bank-table-container">
          {loading ? (
            <p>Đang tải câu hỏi...</p>
          ) : (
            <table className="question-bank-table">
              <thead>
                <tr>
                  <th>Nội dung câu hỏi</th>
                  <th>Môn học</th>
                  <th>Độ khó</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="question-bank-row-title">
                      <div>{item.content}</div>
                      <small>{item._id}</small>
                    </td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>
                      <span className={`difficulty-pill difficulty-pill--${item.difficulty === 'easy' ? 'easy' : item.difficulty === 'hard' ? 'hard' : 'medium'}`}>
                        {item.difficulty === 'easy' ? 'Dễ' : item.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                      </span>
                    </td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      <div className="question-card-actions">
                        <button className="btn-outline btn-small" type="button" onClick={() => handleOpenForm(item)}>Sửa</button>
                        <button className="btn-outline btn-small" type="button" onClick={() => handleDelete(item._id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  );
};

export default QuestionManager;
