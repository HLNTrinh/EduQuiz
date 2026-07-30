const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// Lấy tất cả môn học (active)
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({ status: "active" }).sort({ name: 1 });
    res.json({
      success: true,
      data: subjects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;