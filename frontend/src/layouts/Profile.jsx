import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

export default function Profile() {
  const { user } = useAuth();

  // State dữ liệu người dùng
  const [profileData, setProfileData] = useState({
    name: '',
    avatar: '',
    email: '',
    phone: '',
    role: '',
    joinDate: '',
  });

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [language, setLanguage] = useState('vi');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);

  // Fetch thông tin profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // TODO: Thay bằng API thật
        // const res = await userAPI.getProfile(user.id);

        // Dữ liệu mẫu
        setProfileData({
          name: user?.name || "Nguyễn Văn A",
          avatar: user?.avatar || "https://i.pravatar.cc/200?img=33",
          email: "nguyenvana@eduquiz.vn",
          phone: "090 123 4567",
          role: "Quản lý hệ thống (Super Admin)",
          joinDate: "15/05/2023",
        });
      } catch (error) {
        console.error("Lỗi tải profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSaveSettings = () => {
    // await userAPI.updateSettings({ emailNotif, pushNotif, language });
    alert("Đã lưu cài đặt thành công!");
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    // await userAPI.changePassword({ currentPassword, newPassword });
    alert("Đổi mật khẩu thành công!");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (loading) return <div className="loading-screen">Đang tải hồ sơ...</div>;

  return (
    <div className="profile-main">
      <header className="profile-topbar">
        <h1>Hồ sơ cá nhân</h1>
        <div className="dash-header-actions">
          <button className="icon-btn"><BellIcon /></button>
          <button className="icon-btn"><HelpIcon /></button>
          <div className="user-chip">
            <img src={profileData.avatar} alt="avatar" />
            <div className="user-chip-text">
              <span className="name">{profileData.name}</span>
              <span className="role">Quản trị viên</span>
            </div>
          </div>
        </div>
      </header>

      <section className="profile-grid">
        {/* Thông tin cơ bản */}
        <div className="card profile-info-card">
          <div className="profile-info-top">
            <div className="avatar-wrap">
              <img src={profileData.avatar} alt="Avatar" />
              <button className="avatar-edit"><CameraIcon /></button>
            </div>
            <div className="profile-name-block">
              <h2>{profileData.name}</h2>
              <div className="badges">
                <span className="role-badge">QUẢN TRỊ VIÊN</span>
                <span className="status-dot" /> Hoạt động
              </div>
            </div>
            <button className="btn-primary"><EditIcon /> Cập nhật thông tin</button>
          </div>

          <div className="info-fields">
            <div className="info-field">
              <span className="if-label"><MailIcon /> EMAIL CÁ NHÂN</span>
              <span className="if-value">{profileData.email}</span>
            </div>
            <div className="info-field">
              <span className="if-label"><PhoneIcon /> SỐ ĐIỆN THOẠI</span>
              <span className="if-value">{profileData.phone}</span>
            </div>
            <div className="info-field">
              <span className="if-label"><BriefcaseIcon /> VAI TRÒ</span>
              <span className="if-value">{profileData.role}</span>
            </div>
            <div className="info-field">
              <span className="if-label"><CalendarIcon /> NGÀY THAM GIA</span>
              <span className="if-value">{profileData.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Cài đặt hệ thống */}
        <div className="card settings-card">
          <h3><SlidersIcon /> Cài đặt hệ thống</h3>

          <label className="field-label">Ngôn ngữ hiển thị</label>
          <select 
            className="select-field" 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="vi">Tiếng Việt (Việt Nam)</option>
            <option value="en">English (US)</option>
          </select>

          <div className="field-label" style={{ marginTop: 22 }}>Thông báo ứng dụng</div>
          <div className="toggle-row">
            <span><MailIcon /> Thông báo qua Email</span>
            <Toggle checked={emailNotif} onChange={() => setEmailNotif(v => !v)} />
          </div>
          <div className="toggle-row">
            <span><BellOutlineIcon /> Thông báo đẩy (Push)</span>
            <Toggle checked={pushNotif} onChange={() => setPushNotif(v => !v)} />
          </div>

          <button className="btn-primary full" style={{ marginTop: 24 }} onClick={handleSaveSettings}>
            Lưu cấu hình
          </button>
        </div>
      </section>

      {/* Bảo mật */}
      <section className="card security-card">
        <div className="security-left">
          <h3><ShieldIcon /> Bảo mật tài khoản</h3>
          <p>Đảm bảo tài khoản của bạn luôn an toàn bằng cách sử dụng mật khẩu mạnh và thay đổi định kỳ mỗi 3 tháng.</p>
          <div className="tip-box">
            ℹ️ Mật khẩu nên chứa ít nhất 8 ký tự, bao gồm cả chữ hoa, chữ thường và chữ số.
          </div>
        </div>

        <div className="security-right">
          <label className="field-label">Mật khẩu hiện tại</label>
          <PasswordInput 
            visible={showCurrent} 
            onToggle={() => setShowCurrent(v => !v)}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="pw-row">
            <div>
              <label className="field-label">Mật khẩu mới</label>
              <PasswordInput 
                visible={showNew} 
                onToggle={() => setShowNew(v => !v)}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Xác nhận mật khẩu mới</label>
              <PasswordInput 
                visible={showConfirm} 
                onToggle={() => setShowConfirm(v => !v)}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-dark" onClick={handleChangePassword}>
            Đổi mật khẩu
          </button>
        </div>
      </section>

      <footer className="profile-footer">
        © 2024 EduQuiz. Hỗ trợ kỹ thuật: support@eduquiz.vn
      </footer>
    </div>
  );
}

// ==================== SUB COMPONENTS ====================

function Toggle({ checked, onChange }) {
  return (
    <button className={`toggle ${checked ? 'on' : ''}`} onClick={onChange}>
      <span className="toggle-knob" />
    </button>
  );
}

function PasswordInput({ visible, onToggle, value, onChange }) {
  return (
    <div className="pw-input">
      <input 
        type={visible ? 'text' : 'password'} 
        value={value}
        onChange={onChange}
        placeholder="Nhập mật khẩu"
      />
      <button onClick={onToggle} type="button">
        <EyeIcon />
      </button>
    </div>
  );
}

// SVG Icons
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function BellOutlineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 7h3l2-3h8l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 3 21l.5-4.5L17 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m2 8 10 6 10-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.9v3a1.7 1.7 0 0 1-1.8 1.7A16.7 16.7 0 0 1 2.4 3.8 1.7 1.7 0 0 1 4.1 2h3a1.4 1.4 0 0 1 1.4 1.2c.1 1 .4 2 .7 2.9a1.4 1.4 0 0 1-.3 1.5L7.3 9.3a11 11 0 0 0 5.4 5.4l1.7-1.6a1.4 1.4 0 0 1 1.5-.3c1 .3 1.9.6 2.9.7a1.4 1.4 0 0 1 1.2 1.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.3 3.8 10.3 9 11 5.2-.7 9-5.7 9-11V7l-9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
