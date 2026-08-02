import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { quizService, subjectService } from "../services/services";
import AvatarInitials from "../components/AvatarInitials";
import "../styles/ExamList.css";

export default function ExamList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [modalExam, setModalExam] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [quizzes, setQuizzes] = useState([])
  // Danh sách môn học do Admin quản lý
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true)
      try {
        const response = await quizService.getQuizzes({ page: 1, limit: 50 })
        const list = Array.isArray(response)
          ? response
          : response?.data ?? response?.data?.data ?? []
        setQuizzes(list)
      } catch (err) {
        console.error('Failed to load quizzes:', err)
        setError('Không tải được danh sách bài thi. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    // Lấy danh sách môn học từ Admin để dựng tab động
    const fetchSubjects = async () => {
      try {
        const list = await subjectService.getSubjects()
        setSubjects(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Failed to load subjects:', err)
      }
    }

    fetchQuizzes()
    fetchSubjects()
  }, [])

  // Tab động dựa trên danh sách môn học do Admin quản lý
  const tabs = useMemo(() => ['Tất cả', ...subjects.map((s) => s.name)], [subjects])

  // Helper: lấy tên môn học của một đề thi
  const getSubjectName = (quiz) => {
    // 1) Nếu quiz.subject đã được populate (object có _id, name)
    if (quiz.subject && typeof quiz.subject === 'object' && quiz.subject.name) {
      return quiz.subject.name
    }
    // 2) Nếu quiz.subject là ObjectId (string) → tìm trong danh sách môn học của Admin
    if (quiz.subject) {
      const found = subjects.find(
        (s) => String(s._id) === String(quiz.subject)
      )
      if (found) return found.name
    }
    // 3) Fallback: lấy categoryName / category từ câu hỏi đầu tiên
    const firstQuestion = quiz.questions?.[0]
    const qCat = firstQuestion?.questionId || firstQuestion
    if (qCat?.categoryName) return qCat.categoryName
    if (qCat?.category) {
      const found = subjects.find(
        (s) => String(s._id) === String(qCat.category)
      )
      if (found) return found.name
    }
    return 'Bài thi'
  }

  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return quizzes
      .map((quiz) => {
        const subjectName = getSubjectName(quiz)
        return {
          ...quiz,
          subject: subjectName,
          meta: quiz.description || 'Bài thi trực tuyến',
          questionCount: quiz.questions?.length || 0,
          time: `${quiz.duration || 0} phút`,
          quizId: quiz._id,
        }
      })
      .filter((e) => {
        const matchesTab =
          activeTab === 'Tất cả' || e.subject === activeTab
        const matchesSearch =
          !q ||
          e.title?.toLowerCase().includes(q) ||
          e.subject?.toLowerCase().includes(q)
        return matchesTab && matchesSearch
      })
  }, [activeTab, searchQuery, quizzes, subjects])

  return (
    <main className="exam-main">
      <header className="exam-topbar">
        <div className="search-box">
          <SearchIcon />
          <input
            placeholder="Tìm kiếm bài thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="dash-header-actions">
          <button className="icon-btn"><BellIcon /></button>
          <button className="icon-btn"><HelpIcon /></button>
          <div className="user-chip">
            <AvatarInitials name={user?.name} size={36} />
          </div>
        </div>
      </header>

      <h1>Danh sách bài thi</h1>
      <p className="exam-sub">Luyện tập và kiểm tra kiến thức của bạn thông qua các bài thi được biên soạn kỹ lưỡng.</p>

      <div className="tab-row">
        {tabs.map((t) => (
          <button
            key={t}
            className={'tab-pill' + (activeTab === t ? ' active' : '')}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="exam-loading">Đang tải danh sách bài thi...</div>
      ) : error ? (
        <div className="exam-error">{error}</div>
      ) : (
        <div className="exam-grid">
          {filteredExams.map((e) => (
            <div className="exam-card" key={e.quizId}>
              <div className="exam-card-top">
                <span className={'subject-pill subject-' + slug(e.subject)}>{e.subject}</span>
                <span className={'status-pill status-live'}>Đang mở</span>
              </div>
              <h3>{e.title}</h3>
              <div className="exam-card-meta">
                {e.time && <span><ClockIcon /> {e.time}</span>}
                {e.meta && <span><CalendarIcon /> {e.meta}</span>}
                {e.questionCount !== undefined && <span><QIcon /> {e.questionCount} câu hỏi</span>}
              </div>
              <button
                className="btn-primary full"
                onClick={() => navigate(`/quiz/${e.quizId}`)}
              >
                Vào làm bài
              </button>
            </div>
          ))}

          {filteredExams.length === 0 && (
            <div className="exam-card empty-card">
              <BookIcon />
              <h4>Không tìm thấy bài thi</h4>
              <p>Thử từ khóa khác hoặc chọn lại môn học.</p>
            </div>
          )}
        </div>
      )}

      {modalExam && (
        <ConfirmModal
          exam={modalExam}
          onClose={() => setModalExam(null)}
          onStart={() => navigate(`/quiz/${modalExam.quizId}`)}
        />
      )}
    </main>
  )
}

function ConfirmModal({ exam, onClose, onStart }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Xác nhận vào thi</h2>
            <p>Bạn đang thực hiện bài thi chính thức. Vui lòng đọc kỹ thông tin.</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-info-grid">
          <div className="modal-info-item">
            <span className="modal-info-icon"><QIcon /></span>
            <div>
              <span className="mi-label">Số câu hỏi</span>
              <span className="mi-value">{exam.questionCount} câu trắc nghiệm</span>
            </div>
          </div>
          <div className="modal-info-item">
            <span className="modal-info-icon"><ClockIcon /></span>
            <div>
              <span className="mi-label">Thời gian làm bài</span>
              <span className="mi-value">{exam.duration} phút</span>
            </div>
          </div>
          <div className="modal-info-item">
            <span className="modal-info-icon"><RefreshIcon /></span>
            <div>
              <span className="mi-label">Số lần còn lại</span>
              <span className="mi-value">1/1 lượt làm bài</span>
            </div>
          </div>
          <div className="modal-info-item">
            <span className="modal-info-icon"><DocIcon /></span>
            <div>
              <span className="mi-label">Hình thức</span>
              <span className="mi-value">Trực tuyến có giám sát</span>
            </div>
          </div>
        </div>

        <div className="modal-rules">
          <div className="modal-rules-title">🚩 Quy chế thi quan trọng:</div>
          <ul>
            <li>Không được thoát khỏi trình duyệt hoặc chuyển tab trong quá trình làm bài.</li>
            <li>Hệ thống sẽ tự động nộp bài khi hết thời gian quy định.</li>
            <li>Mọi hành vi gian lận sẽ bị hệ thống ghi lại và báo cáo giáo viên.</li>
            <li>Đảm bảo kết nối internet ổn định trước khi bắt đầu.</li>
          </ul>
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>Quay lại</button>
          <button className="btn-primary" onClick={onStart}>Bắt đầu làm bài ngay ⚡</button>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function HelpIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="17" r="0.9" fill="currentColor" /></svg>
}
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function TimerIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" /><path d="M12 9v4l2.5 1.5M10 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="m8.5 12.5 2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function QIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function ProgressIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 3 6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M4 12V7m0 5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function StarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m12 3 2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1L6.6 19l1.3-6-4.6-4.1 6.1-.6L12 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
}
function BookIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
}
function RefreshIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function slug(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '-')
}

function DocIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
}
