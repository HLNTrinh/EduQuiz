const Notification = require('../models/Notification');

/* =========================
   GET /api/admin/notifications
   Lấy danh sách thông báo (có tìm kiếm, lọc, phân trang)
========================= */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tab = 'all' } = req.query;

    const filter = {};
    if (tab === 'pinned') filter.pinned = true;
    if (tab === 'draft') filter.status = 'draft';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('sender', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({ success: true, notifications, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/notifications/:id
========================= */
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('sender', 'name email avatar')
      .lean();
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/notifications
   Tạo thông báo mới
========================= */
const createNotification = async (req, res) => {
  try {
    const { title, content, pinned, senderName } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề và nội dung' });
    }

    const notification = await Notification.create({
      title,
      content,
      pinned: pinned || false,
      status: pinned ? 'pinned' : 'success',
      sender: req.user.id,
      senderName: senderName || 'Quản trị viên',
      views: 0,
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name email avatar')
      .lean();

    res.status(201).json({ success: true, message: 'Tạo thông báo thành công', notification: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PUT /api/admin/notifications/:id
   Cập nhật thông báo
========================= */
const updateNotification = async (req, res) => {
  try {
    const { title, content, pinned } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (pinned !== undefined) {
      updateData.pinned = pinned;
      updateData.status = pinned ? 'pinned' : 'success';
    }

    const notification = await Notification.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('sender', 'name email avatar')
      .lean();

    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });

    res.json({ success: true, message: 'Cập nhật thông báo thành công', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   DELETE /api/admin/notifications/:id
   Xóa thông báo
========================= */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    res.json({ success: true, message: 'Xóa thông báo thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PATCH /api/admin/notifications/:id/toggle-pin
   Ghim / Bỏ ghim thông báo
========================= */
const togglePinNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });

    notification.pinned = !notification.pinned;
    notification.status = notification.pinned ? 'pinned' : 'success';
    await notification.save();

    res.json({
      success: true,
      message: notification.pinned ? 'Đã ghim thông báo' : 'Đã bỏ ghim thông báo',
      notification: { id: notification._id, pinned: notification.pinned, status: notification.status },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  togglePinNotification,
};