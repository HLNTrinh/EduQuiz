/* =========================
   Admin Setting Controller
   Lưu ý: Hiện tại chưa có model SystemConfig riêng.
   Có thể lưu cấu hình vào file hoặc tạo model sau.
   Tạm thời trả về cấu hình mặc định.
========================= */

// Cấu hình mặc định của hệ thống
const defaultSettings = {
  timeLimit: 60,
  maxAttempts: 3,
  passwordPolicy: 'Trung bình (8 ký tự, 1 chữ hoa)',
  registerMethod: 'Tự do đăng ký',
  twoFactor: 'required',
  ipLimit: '192.168.1.1/24',
  maintenanceMode: false,
  autoLock: true,
  emailNotify: true,
  hideResult: false,
};

/* =========================
   GET /api/admin/settings
   Lấy cấu hình hệ thống
========================= */
const getSettings = async (req, res) => {
  try {
    // TODO: Sau này có thể lưu settings vào MongoDB,
    // tạm thời trả về mặc định
    res.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PUT /api/admin/settings
   Cập nhật cấu hình hệ thống
========================= */
const updateSettings = async (req, res) => {
  try {
    const {
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
    } = req.body;

    // TODO: Sau này sẽ lưu vào database
    // Tạm thời chỉ trả về thành công
    res.json({
      success: true,
      message: 'Lưu cấu hình hệ thống thành công',
      settings: {
        timeLimit: timeLimit ?? defaultSettings.timeLimit,
        maxAttempts: maxAttempts ?? defaultSettings.maxAttempts,
        passwordPolicy: passwordPolicy ?? defaultSettings.passwordPolicy,
        registerMethod: registerMethod ?? defaultSettings.registerMethod,
        twoFactor: twoFactor ?? defaultSettings.twoFactor,
        ipLimit: ipLimit ?? defaultSettings.ipLimit,
        maintenanceMode: maintenanceMode ?? defaultSettings.maintenanceMode,
        autoLock: autoLock ?? defaultSettings.autoLock,
        emailNotify: emailNotify ?? defaultSettings.emailNotify,
        hideResult: hideResult ?? defaultSettings.hideResult,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = { getSettings, updateSettings };