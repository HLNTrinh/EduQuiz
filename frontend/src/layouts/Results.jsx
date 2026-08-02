// Là cái trang lịch sử
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAttemptService } from '../services/services';
import NotificationBell from '../components/student/NotificationBell';
import AvatarInitials from '../components/student/AvatarInitials';
import '../styles/Results.css';

const SUBJECT_MAP = {
  Math: 'Toán',
  Physics: 'Vật lý',
  Chemistry: 'Hóa học',
  Biology: 'Sinh học',
  History: 'Sử',
  Geography: 'Địa',
  English: 'Tiếng Anh',
  Literature: 'Ngữ văn',
  Other: 'Khác',
};

const CHART_BAR_W = 36;
const CHART_GAP = 12;

export default function Results() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Data for bar chart: last 10 attempts sorted chronologically
  const barData = useMemo(() => {
    const sorted = [...attempts].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    return sorted.slice(-10);
  }, [attempts]);

  // Data for radar chart: performance by subject category
  const radarData = useMemo(() => {
    const catMap = {};
    attempts.forEach((a) => {
      if (!a.answers || !Array.isArray(a.answers)) return;
      a.answers.forEach((ans) => {
        const q = ans.questionId;
        if (!q || !q.category) return;
        const cat = SUBJECT_MAP[q.category] || q.category;
        if (!catMap[cat]) catMap[cat] = { correct: 0, total: 0 };
        catMap[cat].total += 1;
        if (ans.isCorrect) catMap[cat].correct += 1;
      });
    });

    return Object.entries(catMap)
      .map(([name, d]) => ({
        name,
        percentage: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      }))
      .filter((e) => e.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);
  }, [attempts]);

  const avgScore =
    attempts.length > 0
      ? (
          attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length
        ).toFixed(1)
      : 0;

  if (loading) return <div className="exam-loading">Đang tải lịch sử...</div>;
  if (error) return <div className="exam-error">{error}</div>;

return (
    <main className="results-main">
      <div className="results-body">
        {/* Topbar */}
        <header className="exam-topbar">
          <div className="search-box" style={{ visibility: 'hidden' }}>
            <SearchIcon />
            <input placeholder="Tìm kiếm..." />
          </div>
          <div className="dash-header-actions">
            <NotificationBell />
            <button className="icon-btn"><HelpIcon /></button>
            <div className="user-chip">
              <AvatarInitials name={user?.name} size={36} />
            </div>
          </div>
        </header>

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
              <p
                className="stat-value"
                style={{ fontSize: 36, fontWeight: 700, color: '#2563eb' }}
              >
                {attempts.length}
              </p>
              <p className="muted-small">Tổng số lượt làm bài</p>
            </div>
            <div className="card">
              <h3>Điểm trung bình</h3>
              <p
                className="stat-value"
                style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}
              >
                {avgScore}%
              </p>
              <p className="muted-small">Trung bình tất cả bài thi</p>
            </div>
          </section>
        )}

        {/* Charts Section */}
        {attempts.length > 0 && (
          <section className="charts-grid">
            {/* Bar Chart */}
            <div className="card chart-card">
              <div className="card-head">
                <h3>Điểm số các bài thi gần đây</h3>
              </div>
              {barData.length > 0 && <BarChart data={barData} />}
            </div>

            {/* Radar Chart */}
            <div className="card chart-card">
              <div className="card-head">
                <h3>Kết quả theo môn học</h3>
              </div>
              {radarData.length > 0 ? (
                <RadarChart data={radarData} size={200} />
              ) : (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>
                  Chưa có dữ liệu theo môn để hiển thị.
                </p>
              )}
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
              <button
                className="btn-primary"
                style={{ marginTop: 12 }}
                onClick={() => navigate('/student/exams')}
              >
                Xem danh sách bài thi
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
                    <tr
                      key={a._id || idx}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/result/${a._id}`)}
                    >
                      <td>
                        <div className="h-name">
                          {a.quizId?.title || 'Bài thi'}
                        </div>
                        <div className="h-meta">
                          {a.totalQuestions || 0} câu hỏi
                        </div>
                      </td>
                      <td>
                        {a.endTime
                          ? new Date(a.endTime).toLocaleDateString('vi-VN')
                          : a.createdAt
                            ? new Date(a.createdAt).toLocaleDateString('vi-VN')
                            : '—'}
                      </td>
                      <td className={a.isPassed ? 'score-good' : 'score-bad'}>
                        {a.percentage || 0}%
                      </td>
                      <td>
                        <span
                          className={`status-chip ${
                            a.isPassed
                              ? 'status-chip--success'
                              : 'status-chip--warning'
                          }`}
                        >
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
                <button
                  className="btn-primary"
                  onClick={() => navigate('/student/exams')}
                >
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

/* ====================== Bar Chart (SVG) ====================== */
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}
function HelpIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="17" r="0.9" fill="currentColor" /></svg>
}
function BarChart({ data }) {
  const maxVal = 100;
  const totalW = data.length * (CHART_BAR_W + CHART_GAP) + 20;
  const h = 180;

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${totalW} ${h + 30}`}
        style={{ width: '100%', maxWidth: totalW, height: h + 30 }}
      >
        {/* Y-axis gridlines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = h - (v / maxVal) * h;
          return (
            <g key={v}>
              <line
                x1={0}
                y1={y}
                x2={totalW - 10}
                y2={y}
                stroke="#eef0f6"
                strokeWidth={1}
              />
              <text
                x={totalW - 5}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#9ca3af"
              >
                {v}%
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.percentage / maxVal) * (h - 10);
          const x = 10 + i * (CHART_BAR_W + CHART_GAP);
          const y = h - barH;
          const color = d.isPassed ? '#10b981' : '#ef4444';
          const dateStr = d.endTime
            ? new Date(d.endTime).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
              })
            : d.createdAt
              ? new Date(d.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                })
              : '';

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={CHART_BAR_W}
                height={barH}
                rx={4}
                fill={color}
                opacity={0.85}
              />
              <text
                x={x + CHART_BAR_W / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={color}
              >
                {d.percentage}%
              </text>
              <text
                x={x + CHART_BAR_W / 2}
                y={h + 16}
                textAnchor="middle"
                fontSize={9}
                fill="#9ca3af"
              >
                {dateStr}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ====================== Radar / Spider Chart (SVG) ====================== */
function RadarChart({ data, size = 200 }) {
  const n = data.length;
  if (n < 3) {
    return (
      <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>
        Cần ít nhất 3 môn để hiển thị biểu đồ.
      </p>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const levels = [0.25, 0.5, 0.75, 1.0];

  function getPoints(scale) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = Math.PI / 2 + (i * 2 * Math.PI) / n;
      const rr = r * scale;
      pts.push([cx + rr * Math.cos(angle), cy - rr * Math.sin(angle)]);
    }
    return pts.map((p) => p.join(',')).join(' ');
  }

  function getDataPoints() {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = Math.PI / 2 + (i * 2 * Math.PI) / n;
      const rr = r * (data[i].percentage / 100);
      pts.push([cx + rr * Math.cos(angle), cy - rr * Math.sin(angle)]);
    }
    return pts.map((p) => p.join(',')).join(' ');
  }

  return (
    <div className="chart-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
      <svg
        viewBox={`0 0 ${size} ${size + 24}`}
        style={{ width: size, height: size + 24 }}
      >
        {/* Grid levels */}
        {levels.map((l) => (
          <polygon
            key={l}
            points={getPoints(l)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        {Array.from({ length: n }).map((_, i) => {
          const angle = Math.PI / 2 + (i * 2 * Math.PI) / n;
          const x2 = cx + r * Math.cos(angle);
          const y2 = cy - r * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}

        {/* Data area */}
        <polygon
          points={getDataPoints()}
          fill="rgba(79, 70, 229, 0.2)"
          stroke="#4f46e5"
          strokeWidth={2}
        />

        {/* Data dots */}
        {Array.from({ length: n }).map((_, i) => {
          const angle = Math.PI / 2 + (i * 2 * Math.PI) / n;
          const rr = r * (data[i].percentage / 100);
          const dx = cx + rr * Math.cos(angle);
          const dy = cy - rr * Math.sin(angle);
          return <circle key={i} cx={dx} cy={dy} r={3.5} fill="#4f46e5" />;
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = Math.PI / 2 + (i * 2 * Math.PI) / n;
          const labelR = r + 24;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy - labelR * Math.sin(angle);

          const anchor =
            angle > Math.PI ? 'end' : angle < Math.PI && angle > 0 ? 'start' : 'middle';

          const dy =
            Math.abs(angle - Math.PI / 2) < 0.01
              ? '-0.3em'
              : Math.abs(angle - (3 * Math.PI) / 2) < 0.01
                ? '0.9em'
                : '0.3em';

          return (
            <g key={i}>
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dy={dy}
                fontSize={10}
                fontWeight={600}
                fill="#374151"
              >
                {d.name}
              </text>
              <text
                x={lx}
                y={ly + 12}
                textAnchor={anchor}
                fontSize={9}
                fill="#9ca3af"
              >
                {d.percentage}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}