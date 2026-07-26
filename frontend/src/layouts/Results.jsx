import '../styles/Results.css';

const history = [
  { name: 'Giải tích 12 - Chương 1', meta: '40 câu hỏi • 45 phút', subject: 'Toán học', date: '24/05/2024', score: '9.5 / 10', tone: 'good' },
  { name: 'Vật lý hạt nhân căn bản', meta: '30 câu hỏi • 30 phút', subject: 'Vật lý', date: '22/05/2024', score: '8.0 / 10', tone: 'good' },
  { name: 'Hóa hữu cơ lớp 11', meta: '50 câu hỏi • 60 phút', subject: 'Hóa học', date: '18/05/2024', score: '4.5 / 10', tone: 'bad' },
  { name: 'English Grammar A2', meta: '25 câu hỏi • 20 phút', subject: 'Tiếng Anh', date: '15/05/2024', score: '10 / 10', tone: 'good' },
];

export default function Results() {
  return (
    <main className="results-main">
      <div className="results-body">
        {/* Header */}
        <div className="results-head">
          <div>
            <h1>Kết quả bài thi mới nhất</h1>
            <p>Chúc mừng! Bạn vừa hoàn thành bài kiểm tra Toán Giải Tích.</p>
          </div>
          <span className="pill-success">✓ Hoàn thành xuất sắc</span>
        </div>

        {/* Score Section */}
        <section className="score-grid">
          <div className="score-card">
            <span className="score-label">ĐIỂM SỐ CỦA BẠN</span>
            <div className="score-value">
              9.5<span>/10</span>
            </div>
            <div className="score-actions">
              <button className="btn-white">
                <EyeIcon /> Xem lại bài làm
              </button>
              <button className="btn-ghost-light">
                <ShareIcon /> Chia sẻ
              </button>
            </div>
            <div className="score-blob" />
          </div>

          <div className="score-side">
            <div className="side-stat">
              <span className="side-label">Thời gian làm bài</span>
              <span className="side-value">
                24:15 <small>/ 45p</small>
              </span>
              <span className="side-icon">
                <TimerIcon />
              </span>
            </div>
            <div className="side-stat">
              <span className="side-label">Tỷ lệ chính xác</span>
              <span className="side-value">95%</span>
              <span className="side-icon good">
                <CheckIcon />
              </span>
            </div>
          </div>
        </section>

        {/* Detail Card */}
        <section className="card detail-card">
          <div className="detail-head">
            <h3>Chi tiết câu hỏi</h3>
            <div className="detail-legend">
              <span>
                <i className="dot good" /> 38 Đúng
              </span>
              <span>
                <i className="dot bad" /> 2 Sai
              </span>
              <span>
                <i className="dot neutral" /> 0 Bỏ qua
              </span>
            </div>
          </div>
          <div className="detail-bar">
            <div className="detail-bar-good" style={{ width: '95%' }} />
            <div className="detail-bar-bad" style={{ width: '5%' }} />
          </div>
        </section>

        {/* Personal Stats */}
        <h2 className="section-title">Thống kê cá nhân</h2>
        <section className="stat-two-grid">
          <div className="card">
            <div className="card-head">
              <h3>Tiến độ điểm số</h3>
              <span className="trend-up">↗ +12%</span>
            </div>
            <p className="muted-small">Trung bình 30 ngày qua</p>
            <div className="mini-bars">
              {[38, 46, 34, 58, 66, 78].map((h, i) => (
                <div
                  key={i}
                  className={`mini-bar-col ${i === 5 ? 'active' : ''}`}
                >
                  <div className="mini-bar" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="mini-bar-labels">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Kỹ năng theo môn học</h3>
            <p className="muted-small">Đánh giá dựa trên lịch sử làm bài</p>
            <div className="radar-wrap">
              <svg viewBox="0 0 200 200" width="220" height="220">
                {[1, 2, 3, 4].map((r) => (
                  <polygon
                    key={r}
                    points={pentagonPoints(100, 100, 80 * (r / 4))}
                    fill="none"
                    stroke="#e7e9f2"
                    strokeWidth="1"
                  />
                ))}
                <polygon
                  points={pentagonPoints(100, 100, 80)}
                  fill="none"
                  stroke="#e7e9f2"
                  strokeWidth="1"
                />
                <polygon
                  points={pentagonPoints(100, 100, 80, [0.9, 0.7, 0.6, 0.65, 0.85])}
                  fill="rgba(29,78,216,0.22)"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                />
                {['Toán', 'Lý', 'Hóa', 'Anh', 'Văn'].map((label, i) => {
                  const [x, y] = labelPoint(100, 100, 98, i);
                  return (
                    <text
                      key={label}
                      x={x}
                      y={y}
                      fontSize="11"
                      fill="#6b7180"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="card history-card">
          <div className="card-head">
            <h3>Lịch sử làm bài</h3>
            <div className="history-actions">
              <button className="btn-outline small">⚲ Bộ lọc</button>
              <button className="btn-outline small">⬇ Xuất PDF</button>
            </div>
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>Tên đề thi</th>
                <th>Môn học</th>
                <th>Ngày thi</th>
                <th>Điểm số</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.name}>
                  <td>
                    <div className="h-name">{h.name}</div>
                    <div className="h-meta">{h.meta}</div>
                  </td>
                  <td>
                    <span className={`subject-pill subject-${slug(h.subject)}`}>
                      {h.subject}
                    </span>
                  </td>
                  <td>{h.date}</td>
                  <td className={h.tone === 'good' ? 'score-good' : 'score-bad'}>
                    {h.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-footer">
            <span>Hiển thị 4 trên 158 kết quả</span>
            <div className="pager">
              <button>‹</button>
              <button>›</button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-card">
          <div className="cta-text">
            <h3>Sẵn sàng nâng cao kiến thức?</h3>
            <p>
              Dựa trên kết quả của bạn, chúng tôi đề xuất các bài tập bổ sung về
              phần 'Tích phân hàm ẩn'.
            </p>
            <div className="cta-actions">
              <button className="btn-primary">Luyện tập ngay</button>
              <button className="btn-outline">Xem giáo trình</button>
            </div>
          </div>
          <div className="cta-art" />
        </section>
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