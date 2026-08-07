import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiXCircle,} from "react-icons/fi";
import { FiX } from "react-icons/fi";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionService, subjectService } from '../services/authService';
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import '../styles/QuestionsBank.css';
import { RxCross2 } from "react-icons/rx";

const emptyForm = {
  content: '',
  category: '',
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [message, setMessage] = useState('');
  const [toast, setToast] = useState({
    show: false,
    text: "",
    type: "success",
  });
  const showToast = (text, type = "success") => {
    setToast({
      show: true,
      text,
      type,
    });

    setTimeout(() => {
      setToast(prev => ({
        ...prev,
        show: false,
      }));
    }, 3500);
  };

  const [subjectList, setSubjectList] = useState([]);
  const [subjects, setSubjects] = useState([]);

  /* phân trang ngân hàng câu hỏi */
  const QUESTIONS_PER_PAGE = 50;
  const [questionPage, setQuestionPage] = useState(1); 

  const tabs = useMemo(() => {
    return ['Tất cả', ...subjectList.map((s) => s._id)];
  }, [subjectList]);

  const loadSubjects = async () => {
    try {
      const res = await subjectService.getSubjects();
      const list = Array.isArray(res) ? res : [];
      setSubjectList(list);
    } catch (error) {
      // silent
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestions();
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setQuestions(items);
    } catch (error) {
     //setMessage(error.message || 'Không thể tải câu hỏi.');
      showToast(error.message || 'Không thể tải câu hỏi.', 'error');
    } finally {
      setLoading(false);
    }
  };
/*Gọi API lấy danh sách môn học -> Lưu vào state subjects, state ở <select>*/
  const loadCategories = async () => {
    try {
      const response = await questionService.getCategories();

      const categories = Array.isArray(response)
        ? response
        : [];

      setSubjects([
        "Tất cả",
        ...categories
      ]);

    } catch (error) {
      console.log("Lỗi lấy môn học:", error);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadQuestions();
    loadCategories();
  }, []);
  /* Khi searchQuery thay đổi, reset questionPage về 1 */
  useEffect(() => {
    setQuestionPage(1);
  }, [searchQuery]);

  const getSubjectName = (id) => {
    const found = subjectList.find((s) => s._id === id);
    return found ? found.name : id || 'Khác';
  };

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

  const totalQuestionPages = Math.ceil(
  filteredQuestions.length / QUESTIONS_PER_PAGE
);
  /* Lấy danh sách câu hỏi theo trang hiện tại */
  const paginatedQuestions = useMemo(() => {
    const start = (questionPage - 1) * QUESTIONS_PER_PAGE;
    return filteredQuestions.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [filteredQuestions, questionPage]);

  const handleOpenForm = (question = null) => {
    setShowEditModal(false);

    if (question) {
      setFormData({
        ...question,
        explanation: question.explanation || '',
        options: question.options?.map((option) => ({
          text: option.text || '',
          isCorrect: Boolean(option.isCorrect),
        })) || emptyForm.options,
      });
    } else {
      setFormData({
        ...emptyForm,
        category: subjects.length > 1 ? subjects[1] : '',
      });
    }
   //setMessage('');
    setToast(prev => ({ ...prev, show: false }));
    setShowForm(true);
  };

  const handleOpenEditModal = (question) => {
    setShowForm(false);
    setFormData({
      ...question,
      explanation: question.explanation || '',
      options: question.options?.map((option) => ({
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect),
      })) || emptyForm.options,
    });

    //setMessage('');
    setToast(prev => ({ ...prev, show: false }));
    setShowEditModal(true);
  };
  const handleOptionChange = (index, field, value) => {
    const nextOptions = [...formData.options];
    nextOptions[index] = { ...nextOptions[index], [field]: value };
    setFormData({ ...formData, options: nextOptions });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const content = (formData.content || '').trim();
    const options = (formData.options || []).map((option) => ({ text: (option.text || '').trim(), isCorrect: Boolean(option.isCorrect) }));
    const correctCount = options.filter((option) => option.isCorrect).length;

    if (!content) {
      //setMessage('Vui lòng nhập nội dung câu hỏi.');
      showToast('Vui lòng nhập nội dung câu hỏi.', 'error');
      return;
    }

    if (options.length !== 4 || options.some((option) => !option.text)) {
      //setMessage('Vui lòng nhập đủ 4 đáp án.' );
      showToast('Vui lòng nhập đủ 4 đáp án.', 'error');
      return;
    }

    if (correctCount !== 1) {
      //setMessage('Vui lòng chọn đúng một đáp án.');
      showToast('Vui lòng chọn đúng một đáp án.', 'error)');
      return;
    }

    try {
      const payload = {
        content,
        options,
        category: formData.category,
        difficulty: formData.difficulty,
        explanation: (formData.explanation || '').trim(),
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

      if (formData._id) {
        setShowEditModal(false);
      } else {
        setShowForm(false);
      }

      setFormData({
        ...emptyForm,
        category: subjects.length > 1 ? subjects[1] : '',
      });
      //setMessage(formData._id ? 'Đã cập nhật câu hỏi thành công.' : 'Đã thêm câu hỏi mới thành công.');
      showToast(formData._id ? 'Đã cập nhật câu hỏi thành công.' : 'Đã thêm câu hỏi mới thành công.', 'success');

    } catch (error) {
      //setMessage(error.message || 'Không thể lưu câu hỏi.');
      showToast(error.message || 'Không thể lưu câu hỏi.', 'error');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await questionService.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((item) => item._id !== questionId));
      //setMessage('Đã xóa câu hỏi thành công.');
      showToast('Đã xóa câu hỏi thành công.', 'success');
    } catch (error) {
      //setMessage(error.message || 'Không thể xóa câu hỏi.');
      showToast(error.message || 'Không thể xóa câu hỏi.', 'error');
    }
  };

  return (
    <div className="dash-shell">
      <TeacherSidebar />

      <main className="dash-main">
        <header className="dash-header dash-header--overview">
          <div>
            <p className="overview-badge">Ngân hàng câu hỏi</p>
            <p className="dash-subtitle">Quản lý và tổ chức kho câu hỏi trắc nghiệm của bạn.</p>
          </div>
          <div className="overview-actions">
            <button className="btn-start" type="button" onClick={() => handleOpenForm(null)}> +Thêm câu hỏi mới </button>
          </div>
        </header>
        
        {toast.show && (
          <div className={`toast toast--${toast.type}`}>
            {toast.type === "success"
              ? <FiCheckCircle className="toast-icon" />
              : <FiXCircle className="toast-icon" />}
            <span>{toast.text}</span>
          </div>
        )}        


        {showForm ? (
          <section className="question-form-panel">
            <div className="question-form-header">
              <div>
                <h3>{formData._id ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
                <p className="panel-subtitle">Nhập câu hỏi trực tiếp lên giao diện, không cần bật hộp thoại.</p>
              </div>
              <button
                  className="btn-outline btn-small"
                  type="button"
                  onClick={() => {
                      setShowForm(false);
                      setFormData(emptyForm);
                  }}
              >
                  <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="field-label">Nội dung câu hỏi</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.content}
                onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                required
              />

              <div className="question-form-row">

                <div className="question-form-group">
                  <label className="field-label">Môn học</label>

                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData({ ...formData, category: event.target.value })
                    }
                  >
                    <option value="">-- Chọn môn học --</option>

                    {subjectList.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="question-form-group">
                  <label className="field-label">Độ khó</label>

                  <select
                    className="form-input"
                    value={formData.difficulty}
                    onChange={(event) =>
                      setFormData({ ...formData, difficulty: event.target.value })
                    }
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>

              </div>

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
                rows="1"
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

        {showEditModal ? (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>Chỉnh sửa câu hỏi</h3>
                <button className="modal-close-btn" type="button" onClick={() => setShowEditModal(false)}> <FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="field-label">Nội dung câu hỏi</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.content}
                  onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                  required
                />

                <div className="modal-row">

                  <div className="modal-field">
                    <label className="field-label">Môn học</label>

                    <select
                      className="form-input"
                      value={formData.category}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          category: event.target.value,
                        })
                      }
                    >
                      <option value="">-- Chọn môn học --</option>

                      {subjectList.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-field">
                    <label className="field-label">Độ khó</label>

                    <select
                      className="form-input"
                      value={formData.difficulty}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          difficulty: event.target.value,
                        })
                      }
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>

                </div>

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
                  rows="1"
                  value={formData.explanation}
                  onChange={(event) => setFormData({ ...formData, explanation: event.target.value })}
                />

                <div className="modal-actions">
                  <button className="btn-outline" type="button" onClick={() => { setShowEditModal(false); setFormData(emptyForm); }}>Hủy</button>
                  <button className="btn-start" type="submit">Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
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
          <div className="question-filter-scroll">
            <div className="question-filter-row">
              <button
                className={`filter-pill ${selectedSubject === 'Tất cả' ? 'active' : ''}`}
                onClick={() => setSelectedSubject('Tất cả')}
              >
                Tất cả
              </button>

              {subjectList.map((sub) => (
                <button
                  key={sub._id}
                  className={`filter-pill ${selectedSubject === sub._id ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(sub._id)}
                >
                  {sub.name}
                </button>
              ))}
            </div>
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
                {paginatedQuestions.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="question-bank-row-title">
                      <div>{item.content}</div>
                    </td>
                    <td>
                      <span className="category-badge">{getSubjectName(item.category)}</span>
                    </td>
                    <td>
                      <span className={`difficulty-pill difficulty-pill--${item.difficulty === 'easy' ? 'easy' : item.difficulty === 'hard' ? 'hard' : 'medium'}`}>
                        {item.difficulty === 'easy' ? 'Dễ' : item.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                      </span>
                    </td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      <div className="question-card-actions">
                        <button className="btn-outline btn-small" type="button" onClick={() => handleOpenEditModal(item)}><HiOutlinePencilSquare size={16} /></button>
                        <button className="btn-outline btn-small" type="button" onClick={() => handleDelete(item._id)}><RiDeleteBin3Line size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Phân trang */}
        <div className="pagination">
          <button
            className="btn-outline btn-small"
            disabled={questionPage === 1}
            onClick={() => setQuestionPage((p) => p - 1)}
          >
            ← Trước
          </button>

          {Array.from(
            { length: totalQuestionPages },
            (_, i) => (
              <button
                key={i}
                className={`page-btn ${
                  questionPage === i + 1
                    ? "page-btn--active"
                    : ""
                }`}
                onClick={() => setQuestionPage(i + 1)}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            className="btn-outline btn-small"
            disabled={
              questionPage === totalQuestionPages ||
              totalQuestionPages === 0
            }
            onClick={() => setQuestionPage((p) => p + 1)}
          >
            Sau →
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuestionManager;