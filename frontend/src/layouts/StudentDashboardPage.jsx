import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { quizService, quizAttemptService, classService } from "../services/services";
import NotificationBell from "../components/student/NotificationBell";
import UserMenu from "../components/student/UserMenu";
import AvatarInitials from "../components/student/AvatarInitials";
import "../styles/Dashboard.css";

// Helper lấy tên môn học từ đề thi
const getSubjectName = (quiz) => {
  if (quiz?.subject && typeof quiz.subject === "object" && quiz.subject.name) {
    return quiz.subject.name;
  }
  const firstQuestion = quiz?.questions?.[0];
  const qCat = firstQuestion?.questionId || firstQuestion;
  if (qCat?.categoryName) return qCat.categoryName;
  if (typeof quiz?.subject === "string" && quiz.subject) return quiz.subject;
  return "Bài thi";
};

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [activeStat, setActiveStat] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);

  // Greeting
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

  // Cập nhật giờ
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getHours();
      if (now !== currentHour) setCurrentHour(now);
    }, 60000);
    return () => clearInterval(interval);
  }, [currentHour]);

  // Lấy dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, attemptRes, classRes] = await Promise.all([
          quizService.getQuizzes({ page: 1, limit: 50 }),
          quizAttemptService.getStudentAttempts({ page: 1, limit: 50 }),
          classService.getStudentClasses(),
        ]);

        const quizList = Array.isArray(quizRes)
          ? quizRes
          : quizRes?.data ?? quizRes?.data?.data ?? [];

        const attemptList =
          attemptRes?.data ?? attemptRes?.data?.data ?? [];

        setQuizzes(Array.isArray(quizList) ? quizList : []);
        setAttempts(Array.isArray(attemptList) ? attemptList : []);
        setStudentClasses(Array.isArray(classRes) ? classRes : []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  // ========== BIỂU ĐỒ 6 THÁNG GẦN NHẤT (tính từ attempts) ==========
  const { chartMonths, chartValues } = useMemo(() => {
    const now = new Date();
    const months = [];
    const values = [];

    // Tạo 6 tháng gần nhất (từ cũ → mới)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = `Tháng ${d.getMonth() + 1}`;
      months.push(monthLabel);

      // Lọc các bài làm trong tháng này
      const monthAttempts = attempts.filter((a) => {
        if (!a.endTime) return false;
        const end = new Date(a.endTime);
        return (
          end.getFullYear() === d.getFullYear() &&
          end.getMonth() === d.getMonth()
        );
      });

      // Tính điểm trung bình của tháng
      if (monthAttempts.length === 0) {
        values.push(0);
      } else {
        const avg =
          monthAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
          monthAttempts.length;
        values.push(Math.round(avg));
      }
    }

    return { chartMonths: months, chartValues: values };
  }, [attempts]);

  // Bài thi sắp đến hạn
  const upcomingExams = useMemo(() => {
    const now = new Date();
    const doneQuizIds = new Set(
      attempts
        .filter((a) => a.status === "submitted" || a.status === "completed")
        .map((a) => String(a.quizId?._id || a.quizId))
    );

    return quizzes
      .filter((q) => {
        const end = q.endDate ? new Date(q.endDate) : null;
        const start = q.startDate ? new Date(q.startDate) : null;
        const inWindow = (!start || start <= now) && (!end || end >= now);
        const notDone = !doneQuizIds.has(String(q._id));
        return inWindow && notDone;
      })
      .map((q) => {
        const end = q.endDate ? new Date(q.endDate) : new Date();
        const day = end.getDate();
        const month = "TH." + (end.getMonth() + 1);
        const isUrgent =
          end.getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000;

        return {
          _id: q._id,
          day: String(day).padStart(2, "0"),
          month,
          title: q.title || "Bài thi",
          time: `${q.duration || 0} phút`,
          questions: `${q.questions?.length || 0} câu`,
          cta: "Bắt đầu",
          urgent: isUrgent,
        };
      })
      .slice(0, 5);
  }, [quizzes, attempts]);

  // Kết quả gần đây
  const recentResults = useMemo(() => {
    return attempts.slice(0, 5).map((a) => {
      const passed = Boolean(a.isPassed);
      return {
        _id: a._id,
        subject: a.quizId?.title || "Bài thi",
        time: a.endTime
          ? new Date(a.endTime).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
        score: a.percentage != null ? `${a.percentage}%` : "—",
        ok: passed,
      };
    });
  }, [attempts]);

  // Thống kê
  const stats = useMemo(() => {
    const assignedCount = quizzes.length;
    const doneCount = attempts.filter(
      (a) => a.status === "submitted" || a.status === "completed"
    ).length;

    const avgPercentage =
      doneCount > 0
        ? Math.round(
            attempts.reduce((s, a) => s + (a.percentage || 0), 0) /
              attempts.length
          )
        : 0;

    // Môn học mạnh nhất
    const subjScore = {};
    attempts.forEach((a) => {
      const name = getSubjectName(a.quizId || {});
      if (!subjScore[name]) subjScore[name] = { total: 0, count: 0 };
      subjScore[name].total += a.percentage || 0;
      subjScore[name].count += 1;
    });

    let bestSubject = "—";
    let bestScore = -1;
    Object.entries(subjScore).forEach(([name, v]) => {
      const avg = v.count > 0 ? v.total / v.count : 0;
      if (avg > bestScore) {
        bestScore = avg;
        bestSubject = name;
      }
    });

    return [
      {
        label: "BÀI THI ĐƯỢC GIAO",
        value: String(assignedCount).padStart(2, "0"),
        sub: `${upcomingExams.length} bài sắp đến hạn`,
        highlight: true,
        icon: "📋",
      },
      {
        label: "ĐÃ HOÀN THÀNH",
        value: String(doneCount).padStart(2, "0"),
        sub: "Tổng số bài đã nộp",
        subColor: "success",
        icon: "✅",
      },
      {
        label: "ĐIỂM TRUNG BÌNH",
        value: avgPercentage > 0 ? String(avgPercentage) : "0",
        sub: "Trung bình các bài thi",
        icon: "⭐",
      },
      {
        label: "MÔN HỌC MẠNH NHẤT",
        value: bestSubject,
        valueSmall: true,
        sub:
          bestScore >= 0
            ? `Tỉ lệ đúng ${Math.round(bestScore)}%`
            : "Chưa có dữ liệu",
        icon: "∑",
      },
    ];
  }, [quizzes, attempts, upcomingExams]);

  return (
    <>
      {/* HEADER */}
      <header className="dash-header">
        <div>
          <h1>{greeting}</h1>
          <p>
            {upcomingExams.length > 0
              ? `Bạn có ${upcomingExams.length} bài thi cần hoàn thành trong tuần này.`
              : "Bạn đã hoàn thành tất cả bài thi được giao. 🎉"}
          </p>
        </div>

        <div className="dash-header-actions">
          <NotificationBell />
          <UserMenu size={36} />
        </div>
      </header>

      {/* STATISTICS */}
      <section className="stat-grid">
        {stats.map((s, index) => (
          <div
            key={s.label}
            className={`stat-card ${
              s.highlight && activeStat === null ? "highlight" : ""
            } ${activeStat === index ? "active" : ""}`}
            onClick={() =>
              setActiveStat(activeStat === index ? null : index)
            }
            style={{ cursor: "pointer" }}
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

      {/* MAIN GRID */}
      <div className="dash-main-grid">
        <div className="dash-col-left">
          {/* Progress chart - ĐÃ NÂNG CẤP */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Tiến độ học tập</h3>
                <p className="card-subtitle">
                  Điểm trung bình 6 tháng gần nhất
                </p>
              </div>

              <div className="chart-controls">
                <span className="legend-dot" />
                <span className="legend-label">Điểm trung bình</span>
              </div>
            </div>

            <div className="mini-chart">
              {chartValues.map((v, i) => (
                <div className="chart-bar-wrap" key={chartMonths[i]}>
                  <div
                    className={`chart-bar ${i === chartValues.length - 1 ? "active" : ""}`}
                    style={{ height: `${Math.max(v, 4)}%` }} // tối thiểu 4% để vẫn nhìn thấy
                    title={`${v}%`}
                  />
                  <span
                    className={`chart-month ${
                      i === chartValues.length - 1 ? "active" : ""
                    }`}
                  >
                    {chartMonths[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming exams */}
          <div className="card">
            <div className="card-head">
              <h3>Bài thi sắp đến hạn</h3>
              <Link to="/student/exams" className="view-all">
                Xem tất cả
              </Link>
            </div>

            <div className="exam-rows">
              {upcomingExams.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6b7180",
                    padding: 16,
                  }}
                >
                  Không có bài thi nào đang chờ bạn.
                </div>
              ) : (
                upcomingExams.map((e) => (
                  <div className="exam-row" key={e._id}>
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

                    <Link
                      to={`/quiz/${e._id}`}
                      className={e.urgent ? "btn-primary" : "btn-outline-sm"}
                    >
                      {e.cta}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="dash-col-right">
          {/* Profile card */}
          <div className="profile-card">
            <div className="profile-card-top">
              <AvatarInitials
                name={user?.name}
                avatar={user?.avatar}
                size={80}
              />
            </div>

            <div className="profile-card-body">
              <h3>{user?.name || "Học sinh"}</h3>
              <p>
                {studentClasses.length > 0
                  ? studentClasses.map((c) => c.name).join(", ")
                  : "Chưa có lớp"}
              </p>

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
              {recentResults.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6b7180",
                    padding: 16,
                  }}
                >
                  Chưa có kết quả làm bài nào.
                </div>
              ) : (
                recentResults.map((r) => (
                  <div className="result-row" key={r._id || r.subject}>
                    <span className={`result-flag ${r.ok ? "ok" : "warn"}`}>
                      {r.ok ? "✓" : "!"}
                    </span>

                    <div className="result-info">
                      <div className="result-subject">{r.subject}</div>
                      <div className="result-time">{r.time}</div>
                    </div>

                    <strong className="result-score">{r.score}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Challenge */}
          <div className="challenge-card">
            <span className="eyebrow">THỬ THÁCH TUẦN</span>
            <p>
              Hoàn thành 5 bài thi trắc nghiệm để nhận 100 điểm thưởng!
            </p>

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