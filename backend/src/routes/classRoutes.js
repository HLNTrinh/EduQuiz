//Tạo API ở backend
const express = require("express");
const router = express.Router();
const Class = require("../models/Class");

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

module.exports = router;