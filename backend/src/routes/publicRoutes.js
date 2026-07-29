const express = require('express');
const Quiz = require('../models/Quiz');

const router = express.Router();

// Public: list published quizzes (simple summary view)
router.get('/quizzes', async (req, res) => {
  try {
    const now = new Date();
    const quizzes = await Quiz.find({ isPublished: true, endDate: { $gte: now } })
      .sort({ startDate: 1 })
      .limit(200)
      .lean();

    // Map quizzes to the frontend-friendly shape used by ExamList
    const mapped = quizzes.map((q) => {
      const status = q.startDate <= new Date() && q.endDate >= new Date() ? 'Đang diễn ra'
        : q.startDate > new Date() ? 'Sắp diễn ra'
        : 'Đã hoàn thành';

      const statusType = q.startDate <= new Date() && q.endDate >= new Date() ? 'live'
        : q.startDate > new Date() ? 'upcoming'
        : 'done';

      return {
        quizId: q._id,
        subject: q.subject || 'Chung',
        status,
        statusType,
        title: q.title,
        time: q.duration ? `${q.duration} phút` : undefined,
        meta: q.endDate ? `Hạn nộp: ${new Date(q.endDate).toLocaleString()}` : undefined,
        metaIcon: q.endDate ? 'calendar' : undefined,
        questions: q.questions ? `${q.questions.length} câu hỏi` : undefined,
        cta: statusType === 'live' ? 'Vào thi ngay' : statusType === 'started' ? 'Tiếp tục làm bài' : statusType === 'upcoming' ? 'Chưa đến giờ' : 'Xem lại kết quả',
        ctaType: statusType === 'live' ? 'primary' : statusType === 'upcoming' ? 'disabled' : 'outline',
        questionCount: q.questions ? q.questions.length : undefined,
        duration: q.duration,
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error('Public quizzes error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Public: get quiz detail by id (only if published)
router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, isPublished: true })
      .populate('questions.questionId')
      .lean();

    if (!quiz) return res.status(404).json({ message: 'Đề thi không tồn tại hoặc chưa được công bố' });

    res.json(quiz);
  } catch (error) {
    console.error('Public quiz detail error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
