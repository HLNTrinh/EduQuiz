const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getStudentNotifications,
  markAsRead,
} = require('../controllers/notificationController');

// Lấy danh sách thông báo cho học sinh
router.get('/student', authenticate, getStudentNotifications);

// Đánh dấu đã đọc
router.put('/:id/read', authenticate, markAsRead);

module.exports = router;
