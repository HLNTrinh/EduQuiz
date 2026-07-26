const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Tạo đề thi
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions, duration, maxAttempts, startDate, endDate, showAnswerAfter, totalPoints, passingScore } = req.body;

    const normalizedQuestions = (questions || []).map((question, index) => ({
      questionId: question.questionId || question._id,
      order: question.order || index + 1,
    }));

    if (!normalizedQuestions.length) {
      return res.status(400).json({ message: 'Đề thi phải có tối thiểu 1 câu hỏi' });
    }

    const questionIds = normalizedQuestions.map((q) => q.questionId);
    const foundQuestions = await Question.find({ _id: { $in: questionIds } });
    if (foundQuestions.length !== normalizedQuestions.length) {
      return res.status(400).json({ message: 'Một số câu hỏi không tồn tại' });
    }

    const quiz = new Quiz({
      title,
      description,
      questions: normalizedQuestions,
      duration: Number(duration || 45),
      maxAttempts: Number(maxAttempts || 1),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      showAnswerAfter: Boolean(showAnswerAfter),
      totalPoints: Number(totalPoints || normalizedQuestions.length * 10),
      passingScore: Number(passingScore || 50),
      createdBy: req.user.id || req.user.userId,
    });

    await quiz.save();
    res.status(201).json({ message: 'Tạo đề thi thành công', data: quiz });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách đề thi
exports.getQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = req.user.role === 'student'
      ? { isPublished: true }
      : { createdBy: req.user.id };

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Quiz.countDocuments(filter);

    res.json({
      data: quizzes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết đề thi
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions.questionId');

    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật đề thi
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    if (quiz.createdBy.toString() !== (req.user.id || req.user.userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa đề thi này' });
    }

    const { title, description, questions, duration, maxAttempts, startDate, endDate, showAnswerAfter, totalPoints, passingScore } = req.body;

    Object.assign(quiz, {
      title,
      description,
      questions,
      duration,
      maxAttempts,
      startDate,
      endDate,
      showAnswerAfter,
      totalPoints,
      passingScore,
    });

    await quiz.save();
    res.json({ message: 'Cập nhật đề thi thành công', data: quiz });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa đề thi
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    if (quiz.createdBy.toString() !== (req.user.id || req.user.userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đề thi này' });
    }

    await Quiz.deleteOne({ _id: req.params.id });
    res.json({ message: 'Xóa đề thi thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Publish đề thi
exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    if (quiz.createdBy.toString() !== (req.user.id || req.user.userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền công bố đề thi này' });
    }

    quiz.isPublished = true;
    await quiz.save();
    res.json({ message: 'Công bố đề thi thành công', data: quiz });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
