import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

const stats = [
  {
    label: "BÀI THI ĐƯỢC GIAO",
    value: "08",
    sub: "3 bài sắp đến hạn",
    highlight: true,
    icon: "📋",
  },
  {
    label: "ĐÃ HOÀN THÀNH",
    value: "24",
    sub: "+2 bài tuần này",
    subColor: "success",
    icon: "✅",
  },
  {
    label: "ĐIỂM TRUNG BÌNH",
    value: "8.4",
    sub: "Nằm trong top 10%",
    icon: "⭐",
  },
  {
    label: "MÔN HỌC MẠNH NHẤT",
    value: "Toán Học",
    valueSmall: true,
    sub: "Tỉ lệ đúng 92%",
    icon: "∑",
  },
];

const upcoming = [
  {
    day: "24",
    month: "TH.10",
    title: "Kiểm tra Giữa kỳ II - Toán 12",
    time: "60 phút",
    questions: "40 câu",
    cta: "Bắt đầu",
    urgent: true,
  },
  {
    day: "26",
    month: "TH.10",
    title: "Vật Lý 12 - Ôn tập Chương IV",
    time: "45 phút",
    questions: "30 câu",
    cta: "Bắt đầu",
    urgent: true,
  },
  {
    day: "29",
    month: "TH.10",
    title: "Tiếng Anh - Mock Test 04",
    time: "90 phút",
    questions: "80 câu",
    cta: "Chi tiết",
    urgent: false,
  },
];

const recentResults = [
  {
    subject: "Hóa học 12",
    time: "2 giờ trước",
    score: "9.5",
    ok: true,
  },
  {
    subject: "Lịch sử 12",
    time: "Hôm qua",
    score: "8.0",
    ok: true,
  },
  {
    subject: "Sinh học 12",
    time: "3 ngày trước",
    score: "6.5",
    ok: false,
  },
];

const chartMonths = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"];
const chartValues = [55, 62, 58, 74, 68, 80];

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // Tối ưu greeting bằng useMemo
  const greeting = useMemo(() => {
    let text = "";
    let emoji = "👋";

    if (currentHour >= 5 && currentHour < 12) {
      text = "Chào buổi sáng";
      emoji = "🌅";
    } else if (currentHour >= 12 && currentHour < 15) {
      text = "Chào buổi trưa";
      emoji = "☀️";
    } else if (currentHour >= 15 && currentHour < 18) {
      text = "Chào buổi chiều";
      emoji = "🌤️";
    } else {
      text = "Chào buổi tối";
      emoji = "🌙";
    }

    return `${text}, ${user?.name || "Học sinh"}! ${emoji}`;
  }, [currentHour, user?.name]);

  // Cập nhật giờ hiện tại
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getHours();
      if (now !== currentHour) {
        setCurrentHour(now);
      }
    }, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(interval);
  }, [currentHour]);

  return (
    <>
      {/* HEADER */}
      <header className="dash-header">
        <div>
          <h1>{greeting}</h1>
          <p>Bạn có 3 bài thi cần hoàn thành trong tuần này.</p>
        </div>

        <div className="dash-header-actions">
          <button className="bell-btn" aria-label="Thông báo">
            🔔
            <span className="bell-dot" />
          </button>

          <div className="user-chip">
            <img
              src={user?.avatar || "https://i.pravatar.cc/64?img=12"}
              alt="avatar"
            />
            <span>{user?.name || "Học sinh"}</span>
          </div>
        </div>
      </header>

      {/* STATISTICS */}
      <section className="stat-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`stat-card ${s.highlight ? "highlight" : ""}`}
          >
            <div className="stat-top">
              <span className="stat-label">{s.label}</span>
              <span className="stat-icon">{s.icon}</span>
            </div>

            <div className={`stat-value ${s.valueSmall ? "small" : ""}`}>
              {s.value}
            </div>

            <div className={`stat-sub ${s.subColor || ""}`}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* MAIN GRID: left content + right sidebar */}
      <div className="dash-main-grid">
        <div className="dash-col-left">
          {/* Progress chart */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Tiến độ học tập</h3>
                <p className="card-subtitle">
                  Thống kê điểm số 6 tháng gần nhất
                </p>
              </div>

              <div className="chart-controls">
                <span className="legend-dot" />
                <span className="legend-label">Điểm trung bình</span>
                <select className="year-select" defaultValue="2023-2024">
                  <option value="2023-2024">2023 - 2024</option>
                  <option value="2022-2023">2022 - 2023</option>
                </select>
              </div>
            </div>

            <div className="mini-chart">
              {chartValues.map((v, i) => (
                <div className="chart-bar-wrap" key={chartMonths[i]}>
                  <div
                    className={`chart-bar ${i === 3 ? "active" : ""}`}
                    style={{ height: `${v}%` }}
                  />
                  <span
                    className={`chart-month ${i === 3 ? "active" : ""}`}
                  >
                    {chartMonths[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div className="card">
            <div className="card-head">
              <h3>Bài thi sắp đến hạn</h3>
              <Link to="/student/exams" className="view-all">
                Xem tất cả
              </Link>
            </div>

            <div className="exam-rows">
              {upcoming.map((e) => (
                <div className="exam-row" key={e.title}>
                  <div className={`date-badge ${e.urgent ? "urgent" : ""}`}>
                    <span>{e.day}</span>
                    <small>{e.month}</small>
                  </div>

                  <div className="exam-info">
                    <div className="exam-title">{e.title}</div>
                    <div className="exam-meta">
                      🕒 {e.time} &nbsp;&nbsp; 📄 {e.questions}
                    </div>
                  </div>

                  <button
                    className={e.urgent ? "btn-primary" : "btn-outline-sm"}
                  >
                    {e.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-col-right">
          {/* Profile card */}
          <div className="profile-card">
            <div className="profile-card-top">
              <img
                src={user?.avatar || "https://i.pravatar.cc/120?img=12"}
                alt="avatar"
                className="profile-avatar"
              />
            </div>

            <div className="profile-card-body">
              <h3>{user?.name || "Học sinh"}</h3>
              <p>Lớp 12A1 • Trường THPT Chuyên</p>

              <div className="profile-stats">
                <div>
                  <span className="profile-stat-label">XẾP HẠNG</span>
                  <strong>#14</strong>
                </div>
                <div className="profile-stat-divider" />
                <div>
                  <span className="profile-stat-label">HUY HIỆU</span>
                  <strong>08</strong>
                </div>
              </div>

              <Link to="/student/profile" className="btn-profile-full">
                Xem hồ sơ đầy đủ
              </Link>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <div className="card-head">
              <h3>Kết quả gần đây</h3>
            </div>

            <div className="result-rows">
              {recentResults.map((r) => (
                <div className="result-row" key={r.subject}>
                  <span className={`result-flag ${r.ok ? "ok" : "warn"}`}>
                    {r.ok ? "✓" : "!"}
                  </span>

                  <div className="result-info">
                    <div className="result-subject">{r.subject}</div>
                    <div className="result-time">{r.time}</div>
                  </div>

                  <strong className="result-score">{r.score}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Challenge */}
          <div className="challenge-card">
            <span className="eyebrow">THỬ THÁCH TUẦN</span>
            <p>Hoàn thành 5 bài thi trắc nghiệm để nhận 100 điểm thưởng!</p>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: "60%" }} />
            </div>

            <span className="progress-label">3/5 bài hoàn tất</span>
          </div>
        </div>
      </div>
    </>
  );
}