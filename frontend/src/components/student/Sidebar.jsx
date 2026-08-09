import { useState } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <>
            {/* Nút hamburger - chỉ hiển thị trên mobile */}
            <button
                type="button"
                className="sidebar-hamburger"
                aria-label="Mở menu"
                onClick={() => setOpen((o) => !o)}
            >
                ☰
            </button>

            <aside className={`sidebar ${open ? "open" : ""}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="logo-icon">🎓</div>
                    <div>
                        <h2 className="logo-title">EduQuiz</h2>
                        <p className="logo-subtitle">HỌC SINH</p>
                    </div>
                </div>
                {/* Navigation */}
                <nav className="sidebar-nav">
                    <NavLink
                        to="/student/dashboard"
                        className={({ isActive }) =>
                            isActive ? "sidebar-link active" : "sidebar-link"
                        }
                        onClick={close}
                    >
                        <span className="link-icon">📊</span>
                        Tổng quan
                    </NavLink>

                    <NavLink
                        to="/student/exams"
                        className={({ isActive }) =>
                            isActive ? "sidebar-link active" : "sidebar-link"
                        }
                        onClick={close}
                    >
                        <span className="link-icon">📝</span>
                        Bài thi
                    </NavLink>

                    <NavLink
                        to="/student/results"
                        className={({ isActive }) =>
                            isActive ? "sidebar-link active" : "sidebar-link"
                        }
                        onClick={close}
                    >
                        <span className="link-icon">📜</span>
                        Lịch sử
                    </NavLink>

                    <NavLink
                        to="/student/profile"
                        className={({ isActive }) =>
                            isActive ? "sidebar-link active" : "sidebar-link"
                        }
                        onClick={close}
                    >
                        <span className="link-icon">👤</span>
                        Hồ sơ
                    </NavLink>
                </nav>

                {/* Bottom Section */}
                <div className="sidebar-bottom">
                    {/* Empty - Settings & Logout moved to UserMenu dropdown */}
                </div>
            </aside>

            {/* Overlay - đóng khi bấm ra ngoài */}
            <div
                className={`sidebar-overlay ${open ? "open" : ""}`}
                onClick={close}
            />
        </>
    );
}