const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Bắt đầu làm bài thi
exports.startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id || req.user.userId;

    const quiz = await Quiz.findById(quizId).populate('questions.questionId');
    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    const attemptCount = await QuizAttempt.countDocuments({
      studentId,
      quizId,
      status: { $in: ['in_progress', 'submitted'] },
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({
        message: 'Bạn đã vượt quá số lần làm bài cho phép',
      });
    }

    // Chỉ lấy câu hỏi còn tồn tại
    const validQuestions = quiz.questions.filter((q) => q.questionId);

    const attempt = new QuizAttempt({
      studentId,
      quizId,
      answers: validQuestions.map((q) => ({
        questionId: q.questionId._id,
        selectedOptionIndex: null,
        isCorrect: null,
        timeTaken: 0,
      })),
      totalQuestions: validQuestions.length,
      startTime: new Date(),
    });

    await attempt.save();

    // Trả showAnswerAfter để frontend biết có hiển thị đáp án hay không
    const quizData = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      showAnswerAfter: quiz.showAnswerAfter,
      questions: validQuestions.map((q) => ({
        _id: q.questionId._id,
        content: q.questionId.content,
        options: q.questionId.options.map((opt) => ({
          text: opt.text,
          // Chỉ gửi isCorrect nếu showAnswerAfter = true
          ...(quiz.showAnswerAfter ? { isCorrect: opt.isCorrect } : {}),
        })),
        category: q.questionId.category,
        difficulty: q.questionId.difficulty,
        // Chỉ gửi explanation nếu showAnswerAfter = true
        ...(quiz.showAnswerAfter ? { explanation: q.questionId.explanation } : {}),
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

    // Chỉ cho phép chủ bài làm cập nhật
    const studentId = req.user.id || req.user.userId;
    if (attempt.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật bài làm này' });
    }

    const answerIndex = attempt.answers.findIndex(
      (ans) => ans.questionId.toString() === questionId
    );
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
    const studentId = req.user.id || req.user.userId;

    const attempt = await QuizAttempt.findById(attemptId).populate('quizId');
    if (!attempt) {
      return res.status(404).json({ message: 'Lần làm bài không tồn tại' });
    }

    if (attempt.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền nộp bài này' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Bài làm không ở trạng thái in progress' });
    }

    const questionIds = attempt.answers.map((ans) => ans.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let correctCount = 0;
    let totalScore = 0;
    const pointsPerQuestion =
      attempt.totalQuestions > 0
        ? (attempt.quizId.totalPoints || 100) / attempt.totalQuestions
        : 0;

    attempt.answers = attempt.answers.map((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      if (question && answer.selectedOptionIndex !== null) {
        const isCorrect =
          question.options[answer.selectedOptionIndex]?.isCorrect || false;
        answer.isCorrect = isCorrect;
        if (isCorrect) {
          correctCount++;
          totalScore += pointsPerQuestion;
        }
      }
      return answer;
    });

    attempt.correctAnswers = correctCount;
    attempt.score = Math.round(totalScore);
    attempt.percentage = Math.round(
      (correctCount / attempt.totalQuestions) * 100
    );
    attempt.status = 'submitted';
    attempt.endTime = new Date();
    attempt.timeTaken = Math.round(
      (attempt.endTime - attempt.startTime) / 60000
    );
    attempt.isPassed = attempt.score >= (attempt.quizId.passingScore || 0);

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
    const userId = req.user.id || req.user.userId;

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quizId')
      .populate({
        path: 'answers.questionId',
        model: 'Question',
      });

    if (!attempt) {
      return res.status(404).json({ message: 'Lần làm bài không tồn tại' });
    }

    const isOwner = attempt.studentId.toString() === userId.toString();
    const isTeacher =
      attempt.quizId?.createdBy?.toString() === userId.toString();

    if (!isOwner && !isTeacher) {
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
    const studentId = req.user.id || req.user.userId;

    const attempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title')
      .populate('answers.questionId', 'category')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await QuizAttempt.countDocuments({ studentId });

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
    const { page = 1, limit = 10, quizId: filterQuizId } = req.query;
    const userId = req.user.id || req.user.userId;

    // Chỉ khai báo 1 lần
    const quizzes = await Quiz.find({ createdBy: userId }).select('_id');
    const quizIds = quizzes.map((quiz) => quiz._id);

    // Nếu có filterQuizId thì chỉ lấy attempts của quiz đó
    const matchQuizIds = filterQuizId ? [filterQuizId] : quizIds;

    const attempts = await QuizAttempt.find({ quizId: { $in: matchQuizIds } })
      .populate('quizId', 'title assignedClass')
      .populate('studentId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await QuizAttempt.countDocuments({ quizId: { $in: matchQuizIds } });

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
