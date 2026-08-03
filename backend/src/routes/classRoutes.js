
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
const User = require("../models/User");

// lấy tất cả lớp của giáo viên
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const classes = await Class.find({
      teacher: req.params.teacherId,
    }).select('name subject students studentCount progress')
      .lean();

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

// lấy danh sách học sinh của lớp theo trang
router.get("/:classId/members", async (req, res) => {
  try {
    const { classId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = (req.query.search || '').trim();

    const classItem = await Class.findById(classId).lean();
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    const filter = { _id: { $in: classItem.students } };
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { status: regex },
      ];
    }

    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .select('name email avatar role status')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: {
        students,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
