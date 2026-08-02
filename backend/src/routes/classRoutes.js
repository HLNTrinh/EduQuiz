
// const express = require('express');
// const { authenticate, authorize } = require('../middlewares/auth');
// const { getTeacherClasses, getStudentClasses, getClassMembers } = require('../controllers/classController');

// const router = express.Router();

// router.get('/teacher', authenticate, authorize('teacher', 'admin'), getTeacherClasses);
// router.get('/student', authenticate, authorize('student', 'admin'), getStudentClasses);
// router.get('/:id/members', authenticate, getClassMembers);

// module.exports = router;

//của yk
//Tạo API ở backend
const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const { authenticate } = require('../middlewares/auth');

// lấy tất cả lớp của giáo viên
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const classes = await Class.find({
      teacher: req.params.teacherId,
    }).populate("students", "name email role status");

    res.json({
      success: true,
      data: classes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Lấy danh sách lớp của học sinh (dùng token)
router.get("/student", authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const classes = await Class.find({ students: userId })
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
