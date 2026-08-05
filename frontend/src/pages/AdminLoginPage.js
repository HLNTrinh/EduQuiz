import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdAdminPanelSettings } from "react-icons/md";
import "../styles/AdminLogin.css";

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập email/mã số và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const data = await login(username, password, false);
      if (data?.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        setError("Tài khoản này không có quyền admin");
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-logo">
          <MdAdminPanelSettings />
        </div>

        <h1>Admin Portal</h1>

        <p>
          Hệ thống quản trị Website Thi Trắc Nghiệm
        </p>

        {error && (
          <div className="admin-error" style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email hoặc mã số</label>

            <input
              type="text"
              placeholder="Email hoặc mã số người dùng"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

        </form>

        <button className="back-btn">
          Quay lại trang đăng nhập
        </button>

      </div>

    </div>
  );
}

export default AdminLoginPage;
