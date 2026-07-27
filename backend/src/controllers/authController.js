const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/* =========================
   Register
========================= */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Tăng lên 12 là an toàn hơn

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: 'student',           // Luôn hardcode, không tin client
      joinDate: new Date(),
      avatar: `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70)}`,
    });

    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: safeUser
    });
  } catch (error) {
   // console.error("Register error:", error);//thêm
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   Login
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user.toObject();

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   Get Current User (Profile)
========================= */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')           // Không trả về password
      .lean();                       // Nhanh hơn toObject()

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   Update Profile
========================= */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   Change Password
========================= */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword 
};