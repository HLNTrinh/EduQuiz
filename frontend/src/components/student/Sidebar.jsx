import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="sidebar">
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
                >
                    <span className="link-icon">📊</span>
                    Tổng quan
                </NavLink>

                <NavLink
                    to="/student/exams"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    <span className="link-icon">📝</span>
                    Bài thi
                </NavLink>

                <NavLink
                    to="/student/results"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    <span className="link-icon">📜</span>
                    Lịch sử
                </NavLink>

                <NavLink
                    to="/student/profile"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
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
    );
}