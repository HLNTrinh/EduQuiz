import React from 'react';
import '../styles/ExamConfirmModal.css';

/**
 * Modal xác nhận trước khi vào làm bài thi
 *
 * Props:
 * - exam: { title, totalQuestions, duration, attemptsLeft, maxAttempts, mode }
 * - onCancel: () => void   -> đóng modal / quay lại
 * - onConfirm: () => void  -> bắt đầu làm bài
 */
export const ExamConfirmModal = ({ exam, onCancel, onConfirm }) => {
  if (!exam) return null;

  const rules = exam.rules || [
    'Không được thoát khỏi trình duyệt hoặc chuyển tab trong quá trình làm bài.',
    'Hệ thống sẽ tự động nộp bài khi hết thời gian quy định.',
    'Mọi hành vi gian lận sẽ bị hệ thống ghi lại và báo cáo giáo viên.',
    'Đảm bảo kết nối internet ổn định trước khi bắt đầu.',
  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="exam-modal-overlay" onClick={handleOverlayClick}>
      <div className="exam-modal">
        {/* Header */}
        <div className="exam-modal-header">
          <div>
            <h2>Xác nhận vào thi</h2>
            <p className="exam-modal-subtitle">
              Bạn đang thực hiện bài thi chính thức. Vui lòng đọc kỹ thông tin.
            </p>
          </div>
          <button className="exam-modal-close" onClick={onCancel} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Thông tin bài thi */}
        <div className="exam-modal-body">
          <div className="exam-info-grid">
            <div className="exam-info-item">
              <span className="exam-info-icon">📖</span>
              <div>
                <p className="exam-info-label">Số câu hỏi</p>
                <p className="exam-info-value">{exam.totalQuestions} câu trắc nghiệm</p>
              </div>
            </div>

            <div className="exam-info-item">
              <span className="exam-info-icon">⏱</span>
              <div>
                <p className="exam-info-label">Thời gian làm bài</p>
                <p className="exam-info-value">{exam.duration} phút</p>
              </div>
            </div>

            <div className="exam-info-item">
              <span className="exam-info-icon">🔄</span>
              <div>
                <p className="exam-info-label">Số lần còn lại</p>
                <p className="exam-info-value">
                  {exam.attemptsLeft}/{exam.maxAttempts} lượt làm bài
                </p>
              </div>
            </div>

            <div className="exam-info-item">
              <span className="exam-info-icon">📄</span>
              <div>
                <p className="exam-info-label">Hình thức</p>
                <p className="exam-info-value">{exam.mode || 'Trực tuyến có giám sát'}</p>
              </div>
            </div>
          </div>

          {/* Quy chế thi */}
          <div className="exam-rules">
            <p className="exam-rules-title">
              <span>🚩</span> Quy chế thi quan trọng:
            </p>
            <ul>
              {rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="exam-modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>
            Quay lại
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Bắt đầu làm bài ngay <span>⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamConfirmModal;

