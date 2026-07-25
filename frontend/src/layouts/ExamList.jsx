import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ExamList.css";
const tabs = ['Tất cả', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học']

const exams = [
  {
    quizId: 'giai-tich-12-giua-ky',
    subject: 'Toán học',
    status: 'Đang diễn ra',
    statusType: 'live',
    title: 'Kiểm tra giữa kỳ Giải tích 12 - Chuyên đề Đạo hàm & Nguyên...',
    time: '45 phút',
    meta: 'Hạn nộp: 23:59 - 15/10/2023',
    metaIcon: 'calendar',
    questions: '40 câu hỏi',
    cta: 'Vào thi ngay',
    ctaType: 'primary',
    questionCount: 40,
    duration: 45,
  },
  {
    quizId: 'nghi-luan-van-hoc',
    subject: 'Ngữ văn',
    status: 'Đã bắt đầu',
    statusType: 'started',
    title: 'Nghị luận văn học: Hình tượng người lính trong thơ ca kháng...',
    time: '90 phút',
    meta: 'Hạn nộp: 10:00 - 20/10/2023',
    metaIcon: 'calendar',
    progress: 'Tiến độ: Đã làm 2/5 câu',
    cta: 'Tiếp tục làm bài',
    ctaType: 'outline',
    questionCount: 5,
    duration: 90,
  },
  {
    quizId: 'english-proficiency-test',
    subject: 'Tiếng Anh',
    status: 'Đang diễn ra',
    statusType: 'live',
    title: 'English Proficiency Test - Reading & Vocabulary Mock Test',
    time: '60 phút',
    meta: 'Hạn nộp: 17:00 - 18/10/2023',
    metaIcon: 'calendar',
    questions: '50 câu hỏi',
    cta: 'Vào thi ngay',
    ctaType: 'primary',
    questionCount: 50,
    duration: 60,
  },
  {
    quizId: 'vat-ly-chuong-1',
    subject: 'Vật lý',
    status: 'Sắp diễn ra',
    statusType: 'upcoming',
    title: 'Kiểm tra Chương 1: Dao động cơ học - Lớp 12A1',
    time: '45 phút',
    meta: 'Mở sau: 02 giờ 15 phút',
    metaIcon: 'timer',
    questions: '30 câu hỏi',
    cta: 'Chưa đến giờ',
    ctaType: 'disabled',
    questionCount: 30,
    duration: 45,
  },
  {
    quizId: 'hoa-huu-co-11',
    subject: 'Hóa học',
    status: 'Đã hoàn thành',
    statusType: 'done',
    title: 'Tổng hợp kiến thức Este - Lipit & Cacbohidrat',
    meta: 'Đã nộp: 09:15 - 10/10/2023',
    metaIcon: 'check',
    result: 'Kết quả: 9.5 / 10.0',
    cta: 'Xem lại kết quả',
    ctaType: 'outline',
  },
]

export default function ExamList() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [modalExam, setModalExam] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return exams.filter((e) => {
      const matchesTab = activeTab === 'Tất cả' || e.subject === activeTab
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      return matchesTab && matchesSearch
    })
  }, [activeTab, searchQuery])

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
            <img src="https://i.pravatar.cc/64?img=13" alt="" />
            <div className="user-chip-text">
              <span className="name">Nguyễn Minh Quân</span>
              <span className="role">Học sinh lớp 12A1</span>
            </div>
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

      <div className="exam-grid">
        {filteredExams.map((e) => (
          <div className="exam-card" key={e.title}>
            <div className="exam-card-top">
              <span className={'subject-pill subject-' + slug(e.subject)}>{e.subject}</span>
              <span className={'status-pill status-' + e.statusType}>
                {e.statusType === 'live' && <i className="live-dot" />}
                {e.status}
              </span>
            </div>
            <h3>{e.title}</h3>
            <div className="exam-card-meta">
              {e.time && <span><ClockIcon /> {e.time}</span>}
              {e.meta && <span>{e.metaIcon === 'timer' ? <TimerIcon /> : e.metaIcon === 'check' ? <CheckIcon /> : <CalendarIcon />} {e.meta}</span>}
              {e.questions && <span><QIcon /> {e.questions}</span>}
              {e.progress && <span><ProgressIcon /> {e.progress}</span>}
              {e.result && <span><StarIcon /> {e.result}</span>}
            </div>
            <button
              className={
                e.ctaType === 'primary' ? 'btn-primary full' :
                e.ctaType === 'outline' ? 'btn-outline full' : 'btn-disabled full'
              }
              disabled={e.ctaType === 'disabled'}
              onClick={() => {
                if (e.ctaType === 'primary') setModalExam(e)
                else if (e.cta === 'Tiếp tục làm bài') navigate(`/quiz/${e.quizId}`)
                else if (e.cta === 'Xem lại kết quả') navigate('/student/results')
              }}
            >
              {e.cta}
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