const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Class = require("../models/Class");
const User = require("../models/User");
const TeacherAssignment = require("../models/TeacherAssignment");
const { authenticate } = require('../middlewares/auth');

// Helper: kiểm tra ObjectId hợp lệ
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: escape regex (chống ReDoS)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /teacher/:teacherId
 * Chỉ cho phép giáo viên xem lớp của chính mình (hoặc admin)
 */
router.get("/teacher/:teacherId", authenticate, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;
    const currentUserId = req.user.id || req.user.userId;
    const currentUserRole = req.user.role;

    if (!isValidObjectId(teacherId)) {
      return res.status(400).json({ success: false, message: "teacherId không hợp lệ" });
    }

    // Chỉ cho phép xem lớp của chính mình (trừ admin)
    if (currentUserRole !== "admin" && currentUserId.toString() !== teacherId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem dữ liệu này" });
    }

    let ids = new Set();

    if (subject && isValidObjectId(subject)) {
      // Lọc theo môn: chỉ các lớp giáo viên được phân công dạy môn này
      const subjectClassIds = await TeacherAssignment.find({
        teacher: teacherId,
        subject,
        status: 'active',
      }).distinct('class');
      ids = new Set(subjectClassIds.map((x) => x.toString()));
    } else {
      // Không có môn: lớp chủ nhiệm + tất cả lớp được phân công dạy
      const homeroomClasses = await Class.find({ homeroomTeacher: teacherId })
        .select("name students")
        .lean();
      const assignedClassIds = await TeacherAssignment.find({ teacher: teacherId, status: 'active' }).distinct('class');
      ids = new Set([
        ...homeroomClasses.map((c) => c._id.toString()),
        ...assignedClassIds.map((x) => x.toString()),
      ]);
    }

    const classes = ids.size
      ? await Class.find({ _id: { $in: [...ids] } }).select("name students").lean()
      : [];

    res.json({
      success: true,
      data: classes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

/**
 * GET /:classId/members
 * Chỉ giáo viên của lớp hoặc học sinh trong lớp mới được xem
 */
router.get("/:classId/members", authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10)); // giới hạn limit
    const search = (req.query.search || "").trim();

    if (!isValidObjectId(classId)) {
      return res.status(400).json({ success: false, message: "classId không hợp lệ" });
    }

    const classItem = await Class.findById(classId).lean();
    if (!classItem) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lớp học" });
    }

    const currentUserId = (req.user.id || req.user.userId).toString();
    const currentUserRole = req.user.role;

    // Kiểm tra quyền: admin || giáo viên (chủ nhiệm hoặc phân công dạy) của lớp || học sinh trong lớp
    let isTeacher = classItem.homeroomTeacher?.toString() === currentUserId;
    if (!isTeacher && currentUserRole === 'teacher') {
      const assigned = await TeacherAssignment.findOne({ teacher: currentUserId, class: classItem._id, status: 'active' }).lean();
      isTeacher = Boolean(assigned);
    }
    const isStudent = classItem.students?.some((id) => id.toString() === currentUserId);

    if (currentUserRole !== "admin" && !isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem danh sách thành viên lớp này" });
    }

    const filter = { _id: { $in: classItem.students } };

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { status: regex },
      ];
    }

    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .select("name email avatar role status")
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
      message: "Lỗi server",
    });
  }
});

/**
 * GET /student
 * Lấy danh sách lớp của học sinh đang đăng nhập
 */
router.get("/student", authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const classes = await Class.find({ students: userId })
      .populate("homeroomTeacher", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

module.exports = router;