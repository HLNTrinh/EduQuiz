import { useState, useEffect } from "react";
import '../styles/AuthPages.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// =====================
// Icons
// =====================
const GoogleIcon = () => (
  <svg className="social-icon" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="social-icon" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// =====================
// Left Panel (shared)
// =====================
function LeftPanel() {
  useEffect(() => {
    const cards = document.querySelectorAll(".feature-card");
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.transition = "all 0.6s cubic-bezier(0.2,0.8,0.2,1)";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 150 * i);
    });
  }, []);

  return (
    <section className="auth-left">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="auth-left-content">
        <div className="auth-left-brand">
          <div className="brand-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <span className="brand-name">EduQuiz</span>
        </div>
        <h1 className="auth-left-title">Nền tảng học tập</h1>
        <p className="auth-left-desc">
          Hệ thống quản lý thi và học tập trực tuyến dành cho sinh viên và giáo viên chuyên nghiệp.
        </p>
        <div className="feature-list">
          <div className="feature-card">
            <div className="feature-icon feature-icon--primary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <h3 className="feature-title">Theo dõi tiến độ</h3>
              <p className="feature-desc">Xem kết quả và thống kê chi tiết theo thời gian thực.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon--tertiary">
              <span className="material-symbols-outlined">quiz</span>
            </div>
            <div>
              <h3 className="feature-title">Bài kiểm tra đa dạng</h3>
              <p className="feature-desc">Hàng trăm đề thi từ nhiều môn học và cấp độ khác nhau.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon--secondary">
              <span className="material-symbols-outlined">leaderboard</span>
            </div>
            <div>
              <h3 className="feature-title">Bảng xếp hạng</h3>
              <p className="feature-desc">Cạnh tranh và cải thiện kết quả cùng cộng đồng người học.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================
// Footer Links (shared)
// =====================
function AuthFooterLinks() {
  return (
    <div className="auth-footer-links">
      <Link to="/terms">Điều khoản sử dụng</Link>
      <Link to="/privacy">Chính sách bảo mật</Link>
      <Link to="/support">Hỗ trợ</Link>
    </div>
  );
}

// =====================
// LOGIN PAGE
// =====================
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password, rememberMe);
      const userRole = data?.user?.role || 'student';
      navigate(`/${userRole}/dashboard`);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <LeftPanel />
      <section className="auth-right">
        <div className="auth-form-container">
          {/* Mobile logo */}
          <div className="mobile-logo">
            <span className="material-symbols-outlined">school</span>
            <span>EduQuiz</span>
          </div>

          <div className="auth-form-header">
            <h2 className="auth-form-title">Chào mừng bạn đến với EduQuiz</h2>
            <p className="auth-form-subtitle">Vui lòng nhập thông tin để tiếp tục học tập</p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">EMAIL</label>
              <div className="auth-field-row">
                <span className="auth-field-icon material-symbols-outlined">mail</span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="example@eduquiz.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label className="auth-label" htmlFor="login-password">MẬT KHẨU</label>
                <Link to="/forgot-password" className="auth-forgot-link">Quên mật khẩu?</Link>
              </div>
              <div className="auth-field-row">
                <span className="auth-field-icon material-symbols-outlined">lock</span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input auth-input--password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>

            <button
              type="submit"
              className={`auth-btn-login ${loading ? "auth-btn-login--loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span>HOẶC ĐĂNG NHẬP VỚI</span>
            <div className="auth-divider-line" />
          </div>

          <div className="auth-social-row">
            <button className="auth-btn-social" type="button"><GoogleIcon /> Google</button>
            <button className="auth-btn-social" type="button"><FacebookIcon /> Facebook</button>
          </div>

          <div className="auth-footer">
            <p className="auth-footer-link">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="auth-link">Đăng ký ngay</Link>
            </p>
            <AuthFooterLinks />
          </div>
        </div>
      </section>
    </main>
  );
}

// =====================
// REGISTER PAGE
// =====================
export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <LeftPanel />
      <section className="auth-right">
        <div className="auth-form-container">
          <div className="mobile-logo">
            <span className="material-symbols-outlined">school</span>
            <span>EduQuiz</span>
          </div>

          <div className="auth-form-header">
            <h2 className="auth-form-title">Tạo tài khoản mới</h2>
            <p className="auth-form-subtitle">Điền thông tin để bắt đầu học tập</p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-name">HỌ VÀ TÊN</label>
              <div className="auth-field-row">
                <span className="auth-field-icon material-symbols-outlined">person</span>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={handleChange}
                  className="auth-input"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">EMAIL</label>
              <div className="auth-field-row">
                <span className="auth-field-icon material-symbols-outlined">mail</span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="example@eduquiz.vn"
                  value={form.email}
                  onChange={handleChange}
                  className="auth-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">MẬT KHẨU</label>
              <div className="auth-field-row">
                <span className="auth-field-icon material-symbols-outlined">lock</span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input auth-input--password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-confirm">XÁC NHẬN MẬT KHẨU</label>
              <div className="auth-field-row">
                <span className="auth-field-icon material-symbols-outlined">lock</span>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="auth-input"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`auth-btn-login ${loading ? "auth-btn-login--loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-link">
              Đã có tài khoản?{" "}
              <Link to="/login" className="auth-link">Đăng nhập</Link>
            </p>
            <AuthFooterLinks />
          </div>
        </div>
      </section>
    </main>
  );
}