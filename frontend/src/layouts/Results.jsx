//Là cái trang lịch sử 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAttemptService } from '../services/services';
import '../styles/Results.css';

export default function Results() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const response = await quizAttemptService.getStudentAttempts({ page: 1, limit: 50 });
        const list = response?.data ?? response?.data?.data ?? [];
        setAttempts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError('Không thể tải lịch sử làm bài');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  if (loading) return <div className="exam-loading">Đang tải lịch sử...</div>;
  if (error) return <div className="exam-error">{error}</div>;

  return (
    <main className="results-main">
      <div className="results-body">
        {/* Header */}
        <div className="results-head">
          <div>
            <h1>Lịch sử làm bài</h1>
            <p>Tổng hợp tất cả kết quả bài thi của bạn.</p>
          </div>
        </div>

        {/* Stats Summary */}
        {attempts.length > 0 && (
          <section className="stat-two-grid" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3>Tổng số bài đã làm</h3>
              <p className="stat-value" style={{ fontSize: 36, fontWeight: 700, color: '#2563eb' }}>
                {attempts.length}
              </p>
              <p className="muted-small">Tổng số lượt làm bài</p>
            </div>
            <div className="card">
              <h3>Điểm trung bình</h3>
              <p className="stat-value" style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}>
                {attempts.length > 0
                  ? (attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length).toFixed(1)
                  : 0}%
              </p>
              <p className="muted-small">Trung bình tất cả bài thi</p>
            </div>
          </section>
        )}

        {/* History Table */}
        <section className="card history-card">
          <div className="card-head">
            <h3>Lịch sử làm bài</h3>
          </div>

          {attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7180' }}>
              <p style={{ fontSize: 18 }}>📝</p>
              <p>Bạn chưa làm bài thi nào.</p>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/student/exams')}>
                Vào làm bài ngay
              </button>
            </div>
          ) : (
            <>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Tên đề thi</th>
                    <th>Ngày thi</th>
                    <th>Điểm số</th>
                    <th>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, idx) => (
                    <tr key={a._id || idx} style={{ cursor: 'pointer' }} onClick={() => navigate(`/result/${a._id}`)}>
                      <td>
                        <div className="h-name">{a.quizId?.title || 'Bài thi'}</div>
                        <div className="h-meta">{a.totalQuestions || 0} câu hỏi</div>
                      </td>
                      <td>{a.endTime ? new Date(a.endTime).toLocaleDateString('vi-VN') : (a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi-VN') : '—')}</td>
                      <td className={a.isPassed ? 'score-good' : 'score-bad'}>
                        {a.percentage || 0}%
                      </td>
                      <td>
                        <span className={`status-chip ${a.isPassed ? 'status-chip--success' : 'status-chip--warning'}`}>
                          {a.isPassed ? '✓ Đạt' : '✗ Chưa đạt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-footer">
                <span>Hiển thị {attempts.length} kết quả</span>
              </div>
            </>
          )}
        </section>

        {/* CTA */}
        {attempts.length > 0 && (
          <section className="cta-card">
            <div className="cta-text">
              <h3>Sẵn sàng nâng cao kiến thức?</h3>
              <p>Luyện tập thêm để cải thiện kết quả của bạn.</p>
              <div className="cta-actions">
                <button className="btn-primary" onClick={() => navigate('/student/exams')}>
                  Làm bài thi mới
                </button>
              </div>
            </div>
            <div className="cta-art" />
          </section>
        )}
      </div>
    </main>
  );
}

/* ====================== Helper Functions ====================== */

function pentagonPoints(cx, cy, r, scales = [1, 1, 1, 1, 1]) {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const angle = Math.PI / 2 + i * (2 * Math.PI) / 5;
    const rr = r * scales[i];
    pts.push([cx + rr * Math.cos(angle), cy - rr * Math.sin(angle)]);
  }
  return pts.map((p) => p.join(',')).join(' ');
}

function labelPoint(cx, cy, r, i) {
  const angle = Math.PI / 2 + i * (2 * Math.PI) / 5;
  return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)];
}

function slug(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/* ====================== Icons ====================== */

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.1 10.8 7.8-4.4M8.1 13.2l7.8 4.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9v4l2.5 1.5M10 2h4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 12.5 2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}