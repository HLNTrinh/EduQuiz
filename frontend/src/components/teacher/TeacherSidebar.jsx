//import { useNavigate } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { TbLayoutDashboard } from "react-icons/tb";
import { LuBookOpenText } from "react-icons/lu";
import { FcLibrary } from "react-icons/fc";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FaUsers } from "react-icons/fa";

import "./TeacherSidebar.css"; // nếu CSS của sidebar ở đây

export default function TeacherSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {/* Logo SVG của bạn */}
        <svg
          width="190"
          height="62"
          viewBox="0 0 220 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Icon */}
          <rect
            x="0"
            y="5"
            width="50"
            height="50"
            rx="14"
            fill="url(#paint0_linear)"
          />

          <path
            d="M25 18L36 24L25 30L14 24L25 18Z"
            fill="white"
          />

          <path
            d="M18 28.5V33C18 35.5 21 37 25 37C29 37 32 35.5 32 33V28.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M33 25.5V32"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Tên EduQuiz */}
          <text
            x="65"
            y="37"
            fontFamily="Inter, sans-serif"
            fontSize="26"
            fontWeight="800"
            fill="#0F172A"
          >
            Edu
            <tspan fill="#2563EB">Quiz</tspan>
          </text>

          {/* Gradient */}
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="0"
              y1="5"
              x2="50"
              y2="55"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
        </svg>

        <span className="sidebar-subtitle">
          EduQuiz-Hệ thống tri thức
        </span>

      </div>

      <nav className="sidebar-nav">
        <a
          className={`sidebar-link ${
            location.pathname === "/teacher/dashboard" ? "sidebar-link--active" : ""
          }`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/teacher/dashboard");
          }}
        >
          <span className="sidebar-icon">
            <TbLayoutDashboard size={22} />
          </span>
          Tổng quan
        </a>

        <a
          className={`sidebar-link ${
            location.pathname === "/teacher/exams" ? "sidebar-link--active" : ""
          }`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/teacher/exams");
          }}
        >
          <span className="sidebar-icon">
            <LuBookOpenText size={22} />
          </span>
          Đề thi
        </a>

        <a
          className={`sidebar-link ${
            location.pathname === "/teacher/questions" ? "sidebar-link--active" : ""
          }`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/teacher/questions");
          }}
        >
          <span className="sidebar-icon">
            <FcLibrary size={22} />
          </span>
          Ngân hàng câu hỏi
        </a>

        <a
          className={`sidebar-link ${
            location.pathname === "/teacher/results" ? "sidebar-link--active" : ""
          }`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/teacher/results");
          }}
        >
          <span className="sidebar-icon">
            <LuChartNoAxesCombined size={22} />
          </span>
          Kết quả
        </a>

        <a
          className={`sidebar-link ${
            location.pathname === "/teacher/members" ? "sidebar-link--active" : ""
          }`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/teacher/members");
          }}
        >
          <span className="sidebar-icon">
            <FaUsers size={22} />
          </span>
          Thành viên
        </a>
      </nav>

      <div className="sidebar-bottom">
        <a
          className="sidebar-link"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/teacher/settings");
          }}
        >
          <span className="sidebar-icon">⚙️</span>
          Cài đặt
        </a>

        <a
          className="sidebar-link sidebar-link--danger"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
        >
          <span className="sidebar-icon">↪</span>
          Đăng xuất
        </a>
      </div>
    </aside>
  );
}