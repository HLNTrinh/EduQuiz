/* /src/pages/AdminSettingManagementPage.js */
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { getSettings, updateSettings } from '../services/adminService';
import '../styles/AdminSettingManagement.css';

// Importing beautiful icons from react-icons
import {
  FaCog,
  FaRegClock,
  FaShieldAlt,
  FaGraduationCap,
  FaSave,
  FaCheckCircle
} from 'react-icons/fa';

import {
  MdLoop,
  MdTune
} from 'react-icons/md';

export default function AdminSettingManagementPage() {
  // System Configurations States
  const [timeLimit, setTimeLimit] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [passwordPolicy, setPasswordPolicy] = useState('Trung bình (8 ký tự, 1 chữ hoa)');
  const [registerMethod, setRegisterMethod] = useState('Tự do đăng ký');
  const [twoFactor, setTwoFactor] = useState('required'); // 'required' or 'optional'
  const [ipLimit, setIpLimit] = useState('192.168.1.1/24');

  // Toggles (System Status)
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);
  const [hideResult, setHideResult] = useState(false);

  // App UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('default'); // 'default', 'security', 'regional'
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load settings từ API khi mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res.settings) {
        setTimeLimit(res.settings.timeLimit ?? 60);
        setMaxAttempts(res.settings.maxAttempts ?? 3);
        setPasswordPolicy(res.settings.passwordPolicy ?? 'Trung bình (8 ký tự, 1 chữ hoa)');
        setRegisterMethod(res.settings.registerMethod ?? 'Tự do đăng ký');
        setTwoFactor(res.settings.twoFactor ?? 'required');
        setIpLimit(res.settings.ipLimit ?? '192.168.1.1/24');
        setMaintenanceMode(res.settings.maintenanceMode ?? false);
        setAutoLock(res.settings.autoLock ?? true);
        setEmailNotify(res.settings.emailNotify ?? true);
        setHideResult(res.settings.hideResult ?? false);
      }
    } catch (error) {
      console.error('Lỗi tải cấu hình hệ thống:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide toast notification after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Handle saving configurations
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        timeLimit,
        maxAttempts,
        passwordPolicy,
        registerMethod,
        twoFactor,
        ipLimit,
        maintenanceMode,
        autoLock,
        emailNotify,
        hideResult,
      };
      await updateSettings(payload);
      setToastMessage('Lưu cấu hình hệ thống thành công!');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error.message || 'Lỗi khi lưu cấu hình');
      setShowToast(true);
    }
  };

  // Handle cancellation/reset of form to default values
  const handleReset = () => {
    setTimeLimit(60);
    setMaxAttempts(3);
    setPasswordPolicy('Trung bình (8 ký tự, 1 chữ hoa)');
    setRegisterMethod('Tự do đăng ký');
    setTwoFactor('required');
    setIpLimit('192.168.1.1/24');
    setMaintenanceMode(false);
    setAutoLock(true);
    setEmailNotify(true);
    setHideResult(false);

    setToastMessage('Đã hủy các thay đổi, khôi phục mặc định.');
    setShowToast(true);
  };

  return (
    <AdminLayout pageTitle="Cấu hình hệ thống" pageSubtitle="Quản lý các thiết lập mặc định và bảo mật cho toàn bộ nền tảng giáo dục.">
      <div className="asm-content-grid">
        {/* Left Tabs Menu Column */}
        <div className="asm-tabs-menu">
          <button
            className={`asm-tab-btn ${activeTab === 'default' ? 'active' : ''}`}
            onClick={() => setActiveTab('default')}
          >
            <FaCog />
            <span>Cài đặt mặc định</span>
          </button>
          <button
            className={`asm-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaShieldAlt />
            <span>Bảo mật & Đăng ký</span>
          </button>
          <button
            className={`asm-tab-btn ${activeTab === 'regional' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('regional');
              setToastMessage('Tính năng Ngôn ngữ & Vùng đang được cập nhật.');
              setShowToast(true);
            }}
          >
            <FaGraduationCap />
            <span>Ngôn ngữ & Vùng</span>
          </button>
        </div>

        {/* Right Settings Configuration Fields */}
        <form className="asm-settings-panel" onSubmit={handleSave}>
          {/* First Row: Time Bounds & Max Attempts */}
          <div className="asm-cards-row">
            {/* Time Constraint Card */}
            <div className="asm-card">
              <div className="asm-card-header">
                <div className="asm-card-icon-box">
                  <FaRegClock />
                </div>
                <h3 className="asm-card-title">Ràng buộc thời gian</h3>
              </div>
              <div className="asm-field-group">
                <p className="asm-field-title">Thời gian làm bài mặc định</p>
                <p className="asm-field-desc">Áp dụng cho các bài thi mới khởi tạo</p>
                <div className="asm-input-wrapper">
                  <input
                    type="number"
                    className="asm-input-number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    min="1"
                  />
                  <span className="asm-unit-label">phút</span>
                </div>
              </div>
            </div>

            {/* Max Attempt Card */}
            <div className="asm-card">
              <div className="asm-card-header">
                <div className="asm-card-icon-box">
                  <MdLoop />
                </div>
                <h3 className="asm-card-title">Lượt thi tối đa</h3>
              </div>
              <div className="asm-field-group">
                <p className="asm-field-title">Số lần làm bài cho phép</p>
                <p className="asm-field-desc">Giới hạn số lần thi lại mặc định</p>
                <div className="asm-input-wrapper">
                  <input
                    type="number"
                    className="asm-input-number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    min="1"
                  />
                  <span className="asm-unit-label">lần</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Registration Config Card */}
          <div className="asm-card">
            <div className="asm-card-header">
              <div className="asm-card-icon-box">
                <FaShieldAlt />
              </div>
              <h3 className="asm-card-title">Cấu hình bảo mật & Đăng ký</h3>
            </div>
            <div className="asm-inner-grid-2">
              <div>
                <div className="asm-field-group">
                  <p className="asm-field-title">Chính sách mật khẩu</p>
                  <select
                    className="asm-select"
                    value={passwordPolicy}
                    onChange={(e) => setPasswordPolicy(e.target.value)}
                  >
                    <option>Trung bình (8 ký tự, 1 chữ hoa)</option>
                    <option>Mạnh (10 ký tự, số, ký tự đặc biệt)</option>
                    <option>Rất mạnh</option>
                  </select>
                </div>

                <div className="asm-field-group">
                  <p className="asm-field-title">Phương thức đăng ký</p>
                  <select
                    className="asm-select"
                    value={registerMethod}
                    onChange={(e) => setRegisterMethod(e.target.value)}
                  >
                    <option>Tự do đăng ký</option>
                    <option>Duyệt bởi quản trị viên</option>
                    <option>Chỉ dành cho nội bộ (SSO)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="asm-field-group">
                  <p className="asm-field-title">Xác thực 2 lớp (2FA)</p>
                  <div className="asm-radio-group">
                    <label className="asm-radio-label">
                      <input
                        type="radio"
                        name="twoFactor"
                        className="asm-radio-input"
                        checked={twoFactor === 'required'}
                        onChange={() => setTwoFactor('required')}
                      />
                      <span>Bắt buộc</span>
                    </label>
                    <label className="asm-radio-label">
                      <input
                        type="radio"
                        name="twoFactor"
                        className="asm-radio-input"
                        checked={twoFactor === 'optional'}
                        onChange={() => setTwoFactor('optional')}
                      />
                      <span>Tùy chọn</span>
                    </label>
                  </div>
                </div>

                <div className="asm-field-group">
                  <p className="asm-field-title">Giới hạn IP đăng nhập</p>
                  <input
                    type="text"
                    className="asm-input-text"
                    value={ipLimit}
                    onChange={(e) => setIpLimit(e.target.value)}
                    placeholder="VD: 192.168.1.1/24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Status Toggles Card */}
          <div className="asm-card">
            <div className="asm-card-header">
              <div className="asm-card-icon-box">
                <MdTune />
              </div>
              <h3 className="asm-card-title">Trạng thái hệ thống</h3>
            </div>

            <div className="asm-toggle-grid">
              {/* Maintenance Mode Toggle */}
              <div className="asm-toggle-item">
                <div className="asm-toggle-label-box">
                  <p className="asm-toggle-title">Chế độ bảo trì</p>
                  <p className="asm-toggle-desc">Tạm dừng tất cả các hoạt động làm bài</p>
                </div>
                <label className="asm-switch">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                  />
                  <span className="asm-slider" />
                </label>
              </div>

              {/* Auto Lock Toggle */}
              <div className="asm-toggle-item">
                <div className="asm-toggle-label-box">
                  <p className="asm-toggle-title">Tự động khóa tài khoản</p>
                  <p className="asm-toggle-desc">Khóa sau 5 lần đăng nhập sai</p>
                </div>
                <label className="asm-switch">
                  <input
                    type="checkbox"
                    checked={autoLock}
                    onChange={(e) => setAutoLock(e.target.checked)}
                  />
                  <span className="asm-slider" />
                </label>
              </div>

              {/* Email Notifications Toggle */}
              <div className="asm-toggle-item">
                <div className="asm-toggle-label-box">
                  <p className="asm-toggle-title">Gửi thông báo Email</p>
                  <p className="asm-toggle-desc">Tự động gửi email khi có bài thi mới</p>
                </div>
                <label className="asm-switch">
                  <input
                    type="checkbox"
                    checked={emailNotify}
                    onChange={(e) => setEmailNotify(e.target.checked)}
                  />
                  <span className="asm-slider" />
                </label>
              </div>

              {/* Hide Result Toggle */}
              <div className="asm-toggle-item">
                <div className="asm-toggle-label-box">
                  <p className="asm-toggle-title">Ẩn kết quả thi</p>
                  <p className="asm-toggle-desc">Người học không xem được đáp án ngay</p>
                </div>
                <label className="asm-switch">
                  <input
                    type="checkbox"
                    checked={hideResult}
                    onChange={(e) => setHideResult(e.target.checked)}
                  />
                  <span className="asm-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="asm-action-bar">
            <button
              type="button"
              className="asm-btn-secondary"
              onClick={handleReset}
            >
              Hủy thay đổi
            </button>
            <button
              type="submit"
              className="asm-btn-primary"
            >
              <FaSave />
              <span>Lưu cấu hình</span>
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Success Toast Message */}
      {showToast && (
        <div className="asm-toast">
          <FaCheckCircle className="asm-toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AdminLayout>
  );
}