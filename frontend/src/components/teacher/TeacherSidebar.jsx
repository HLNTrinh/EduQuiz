import { useNavigate, useLocation } from "react-router-dom";

import { TbLayoutDashboard } from "react-icons/tb";
import { LuBookOpenText } from "react-icons/lu";
import { FcLibrary } from "react-icons/fc";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FaUsers } from "react-icons/fa";

import "./TeacherSidebar.css";

export default function TeacherSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <aside className="sidebar-teacher">

      {/* =========================
          LOGO
      ========================= */}
      <div className="sidebar-logo-teacher">

        <svg
          width="170"
          height="48"
          viewBox="0 0 170 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          {/* Icon */}
          <rect
            x="4"
            y="6"
            width="40"
            height="40"
            rx="12"
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
            x="55"
            y="31"
            fontFamily="Inter, sans-serif"
            fontSize="21"
            fontWeight="800"
            fill="#0F172A"
          >
            Edu
            <tspan fill="#2563EB">Quiz</tspan>
          </text>

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


      {/* =========================
          MENU
      ========================= */}
      <nav className="sidebar-nav">

        {/* Tổng quan */}
        <a
          href="#"
          className={`sidebar-link ${
            location.pathname === "/teacher/dashboard"
              ? "sidebar-link--active"
              : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/teacher/dashboard");
          }}
        >
          <span className="sidebar-icon">
            <TbLayoutDashboard size={22} />
          </span>

          <span className="sidebar-text">
            Tổng quan
          </span>
        </a>


        {/* Đề thi */}
        <a
          href="#"
          className={`sidebar-link ${
            location.pathname === "/teacher/exams"
              ? "sidebar-link--active"
              : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/teacher/exams");
          }}
        >
          <span className="sidebar-icon">
            <LuBookOpenText size={22} />
          </span>

          <span className="sidebar-text">
            Đề thi
          </span>
        </a>


        {/* Câu hỏi */}
        <a
          href="#"
          className={`sidebar-link ${
            location.pathname === "/teacher/questions"
              ? "sidebar-link--active"
              : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/teacher/questions");
          }}
        >
          <span className="sidebar-icon">
            <FcLibrary size={22} />
          </span>

          <span className="sidebar-text">
            Câu hỏi
          </span>
        </a>


        {/* Kết quả */}
        <a
          href="#"
          className={`sidebar-link ${
            location.pathname === "/teacher/results"
              ? "sidebar-link--active"
              : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/teacher/results");
          }}
        >
          <span className="sidebar-icon">
            <LuChartNoAxesCombined size={22} />
          </span>

          <span className="sidebar-text">
            Kết quả
          </span>
        </a>


        {/* Thành viên */}
        <a
          href="#"
          className={`sidebar-link ${
            location.pathname === "/teacher/members"
              ? "sidebar-link--active"
              : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/teacher/members");
          }}
        >
          <span className="sidebar-icon">
            <FaUsers size={22} />
          </span>

          <span className="sidebar-text">
            Thành viên
          </span>
        </a>

      </nav>

    </aside>
  );
}