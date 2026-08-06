const User = require('../models/User');
const Class = require('../models/Class');
const bcrypt = require('bcryptjs');

/* =========================
   GET /api/admin/users
   Lấy danh sách người dùng (có phân trang, tìm kiếm, lọc)
========================= */
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
    } = req.query;

    // Xây dựng filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/users/:id
   Chi tiết 1 người dùng
========================= */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/users
   Tạo người dùng mới
========================= */
const createUser = async (req, res) => {
  try {
    const { name, userCode, email, password, role, status, phone, gender, schoolClass } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    // Kiểm tra userCode trùng nếu có
    if (userCode) {
      const existingCode = await User.findOne({ userCode });
      if (existingCode) {
        return res.status(400).json({ success: false, message: 'Mã người dùng đã tồn tại' });
      }
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 12);

    const user = await User.create({
      name,
      userCode: userCode || null,
      email,
      password: hashedPassword,
      role: role || 'student',
      status: status || 'active',
      phone: phone || null,
      joinDate: new Date(),
      avatar: null,              // Avatar mặc định do frontend tạo (màu + chữ đầu/cuối)
    });

    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      user: safeUser,
    });
  } catch (error) {
    // Bắt lỗi trùng khóa (email/userCode) từ unique index của MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message = field === 'email'
        ? 'Email đã tồn tại'
        : field === 'userCode'
          ? 'Mã người dùng đã tồn tại'
          : 'Dữ liệu đã tồn tại';
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PUT /api/admin/users/:id
   Cập nhật thông tin người dùng
========================= */
const updateUser = async (req, res) => {
  try {
    const { name, userCode, email, role, status, phone } = req.body;

    // Kiểm tra email trùng (loại trừ chính user đang sửa)
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      }
    }

    // Kiểm tra userCode trùng nếu có (loại trừ chính user đang sửa)
    if (userCode) {
      const existingCode = await User.findOne({ userCode, _id: { $ne: req.params.id } });
      if (existingCode) {
        return res.status(400).json({ success: false, message: 'Mã người dùng đã tồn tại' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (userCode !== undefined) updateData.userCode = userCode || null;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (phone !== undefined) updateData.phone = phone;

    // Nếu có password mới
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 12);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      user,
    });
  } catch (error) {
    // Bắt lỗi trùng khóa (email/userCode) từ unique index của MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message = field === 'email'
        ? 'Email đã tồn tại'
        : field === 'userCode'
          ? 'Mã người dùng đã tồn tại'
          : 'Dữ liệu đã tồn tại';
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   DELETE /api/admin/users/:id
   Xóa người dùng
========================= */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Cách 2: Khi xóa user, đồng thời xóa user khỏi tất cả các lớp và cập nhật lại studentCount
    const userId = user._id;

    // Tìm các lớp có chứa user TRƯỚC khi pull (sau khi pull sẽ không tìm thấy nữa)
    const affectedClasses = await Class.find({ students: userId });

    // Xóa user khỏi tất cả các lớp
    await Class.updateMany(
      { students: userId },
      { $pull: { students: userId } }
    );

    // Cập nhật lại studentCount cho các lớp bị ảnh hưởng
    for (const cls of affectedClasses) {
      cls.students = cls.students.filter((id) => id.toString() !== userId.toString());
      cls.studentCount = cls.students.length;
      await cls.save();
    }

    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PATCH /api/admin/users/:id/toggle-lock
   Khóa / Mở khóa tài khoản
========================= */
const toggleLockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Không cho phép admin khóa chính mình
    if (req.user && req.user.id && req.user.id.toString() === req.params.id) {
      return res.status(403).json({ success: false, message: 'Bạn không thể khóa tài khoản của chính mình!' });
    }

    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    user.status = newStatus;
    await user.save();

    res.json({
      success: true,
      message: newStatus === 'blocked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      user: { id: user._id, status: user.status },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const filter = { role: 'teacher' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userCode: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).select('name email avatar userCode').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleLockUser,
  getTeachers,
};