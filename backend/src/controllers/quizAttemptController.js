const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Bắt đầu làm bài thi
exports.startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate('questions.questionId');
    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    // Kiểm tra số lần làm bài
    const attemptCount = await QuizAttempt.countDocuments({
      studentId: req.user.id,
      quizId,
      status: { $in: ['in_progress', 'submitted'] },
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({ message: 'Bạn đã vượt quá số lần làm bài cho phép' });
    }

    // Tạo attempt mới
    const attempt = new QuizAttempt({
      studentId: req.user.userId,
      quizId,
      answers: quiz.questions.map((q, index) => ({
        questionId: q.questionId._id,
        selectedOptionIndex: null,
        isCorrect: null,
        timeTaken: 0,
      })),
      totalQuestions: quiz.questions.length,
      startTime: new Date(),
    });

    await attempt.save();

    // Trả lại quiz data (không gồm đáp án đúng)
    const quizData = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      questions: quiz.questions.map(q => ({
        _id: q.questionId._id,
        content: q.questionId.content,
        options: q.questionId.options.map(opt => ({
          text: opt.text,
          // không trả lại isCorrect
        })),
        category: q.questionId.category,
        difficulty: q.questionId.difficulty,
        order: q.order,
      })),
    };

    res.status(201).json({
      message: 'Bắt đầu làm bài thành công',
      attemptId: attempt._id,
      quiz: quizData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lưu tạm câu trả lời
exports.saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptionIndex } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Lần làm bài không tồn tại' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Không thể cập nhật câu trả lời' });
    }

    const answerIndex = attempt.answers.findIndex(ans => ans.questionId.toString() === questionId);
    if (answerIndex >= 0) {
      attempt.answers[answerIndex].selectedOptionIndex = selectedOptionIndex;
    }

    await attempt.save();
    res.json({ message: 'Lưu câu trả lời thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Nộp bài thi
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findById(attemptId).populate('quizId');
    if (!attempt) {
      return res.status(404).json({ message: 'Lần làm bài không tồn tại' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Bài làm không ở trạng thái in progress' });
    }

    // Lấy danh sách câu hỏi để kiểm tra đáp án
    const questionIds = attempt.answers.map(ans => ans.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let correctCount = 0;
    let totalScore = 0;

    attempt.answers = attempt.answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      if (question && answer.selectedOptionIndex !== null) {
        const isCorrect = question.options[answer.selectedOptionIndex]?.isCorrect || false;
        answer.isCorrect = isCorrect;
        if (isCorrect) {
          correctCount++;
          totalScore += attempt.quizId.totalPoints / attempt.totalQuestions;
        }
      }
      return answer;
    });

    attempt.correctAnswers = correctCount;
    attempt.score = Math.round(totalScore);
    attempt.percentage = Math.round((correctCount / attempt.totalQuestions) * 100);
    attempt.status = 'submitted';
    attempt.endTime = new Date();
    attempt.timeTaken = Math.round((attempt.endTime - attempt.startTime) / 60000); // convert to minutes
    attempt.isPassed = attempt.score >= attempt.quizId.passingScore;

    await attempt.save();

    res.json({
      message: 'Nộp bài thành công',
      result: {
        score: attempt.score,
        percentage: attempt.percentage,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        isPassed: attempt.isPassed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy kết quả bài thi
exports.getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quizId')
      .populate({
        path: 'answers.questionId',
        model: 'Question',
      });

    if (!attempt) {
      return res.status(404).json({ message: 'Lần làm bài không tồn tại' });
    }

    if (attempt.studentId.toString() !== req.user.id && attempt.quizId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem kết quả này' });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy lịch sử làm bài của học sinh
exports.getStudentAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const attempts = await QuizAttempt.find({ studentId: req.user.id })
      .populate('quizId', 'title')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await QuizAttempt.countDocuments({ studentId: req.user.id });

    res.json({
      data: attempts,
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
// Lấy kết quả của học sinh cho giáo viên
exports.getTeacherAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const quizzes = await Quiz.find({ createdBy: req.user.userId }).select('_id');
    const quizIds = quizzes.map((quiz) => quiz._id);

    const attempts = await QuizAttempt.find({ quizId: { $in: quizIds } })
      .populate('quizId', 'title')
      .populate('studentId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await QuizAttempt.countDocuments({ quizId: { $in: quizIds } });

    res.json({
      data: attempts,
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
