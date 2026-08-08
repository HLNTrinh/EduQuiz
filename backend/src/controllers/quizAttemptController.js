const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Class = require('../models/Class');
const User = require('../models/User');
const Subject = require('../models/Subject');
const QuizAssignment = require('../models/QuizAssignment');
const { getUserId, getAttemptsFilter } = require('../services/permissionService');

// Bắt đầu làm bài thi
exports.startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = getUserId(req);

    const quiz = await Quiz.findById(quizId).populate('questions.questionId');
    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    // Kiểm tra học sinh thuộc lớp được giao đề (QuizAssignment active)
    const studentClasses = await Class.find({ students: studentId }).select('_id').lean();
    const classIds = studentClasses.map((c) => c._id);

    const assignment = await QuizAssignment.findOne({
      quiz: quiz._id,
      class: { $in: classIds },
      status: 'active',
    });

    if (!assignment) {
      return res.status(403).json({ message: 'Bạn không được giao đề thi này' });
    }

    // Kiểm tra khung thời gian làm bài (startTime / deadline của assignment)
    const now = new Date();
    if (assignment.startTime && now < new Date(assignment.startTime)) {
      return res.status(400).json({ message: 'Đề thi chưa đến thời gian bắt đầu' });
    }
    if (assignment.deadline && now > new Date(assignment.deadline)) {
      return res.status(400).json({ message: 'Đề thi đã hết hạn làm bài' });
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
      subject: quiz.subject,
      class: assignment.class,
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
    const studentId = getUserId(req);
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
    const studentId = getUserId(req);

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
    const userId = getUserId(req);

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

    // Giáo viên được phép xem nếu: admin, hoặc người tạo đề, hoặc attempt nằm trong phạm vi phân công
    let isTeacher = false;
    if (req.user.role === 'admin') {
      isTeacher = true;
    } else if (req.user.role === 'teacher') {
      if (attempt.quizId?.createdBy?.toString() === userId) {
        isTeacher = true;
      } else {
        const filter = await getAttemptsFilter(req.user);
        const visible = await QuizAttempt.findOne({ _id: attempt._id, ...filter }).select('_id').lean();
        isTeacher = Boolean(visible);
      }
    }

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
    const studentId = getUserId(req);

    const attempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title')
      .populate('answers.questionId', 'category categoryName')
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

// Lấy kết quả cho giáo viên - theo phân quyền chủ nhiệm/bộ môn
exports.getTeacherAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 10, quizId: filterQuizId } = req.query;

    // Xây dựng filter theo vai trò (admin/chủ nhiệm/bộ môn)
    const filter = await getAttemptsFilter(req.user);
    if (filterQuizId) {
      filter.quizId = filterQuizId;
    }

    const attempts = await QuizAttempt.find(filter)
      .populate('quizId', 'title subject')
      .populate('studentId', 'name email')
      .populate('class', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await QuizAttempt.countDocuments(filter);

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



// Xem điểm cả lớp theo môn (chỉ giáo viên chủ nhiệm hoặc admin)
exports.getClassResults = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = getUserId(req);

    const classDoc = await Class.findById(classId).select('name homeroomTeacher students');
    if (!classDoc) {
      return res.status(404).json({ message: 'Lớp học không tồn tại' });
    }

    // Chỉ giáo viên chủ nhiệm lớp này hoặc admin mới xem được
    if (req.user.role !== 'admin') {
      const isHomeroom =
        classDoc.homeroomTeacher &&
        classDoc.homeroomTeacher.toString() === userId;
      if (!isHomeroom) {
        return res.status(403).json({ message: 'Bạn không phải giáo viên chủ nhiệm lớp này' });
      }
    }

    const studentIds = classDoc.students || [];

    const students = await User.find({ _id: { $in: studentIds } })
      .select('name email userCode avatar')
      .lean();

    const attempts = await QuizAttempt.find({ studentId: { $in: studentIds }, class: classId })
      .populate('quizId', 'title')
      .lean();

    // Lấy tên môn
    const subjectIds = [...new Set(attempts.filter((a) => a.subject).map((a) => a.subject.toString()))];
    const subjectDocs = await Subject.find({ _id: { $in: subjectIds } }).select('name').lean();
    const subjectNameMap = {};
    subjectDocs.forEach((s) => { subjectNameMap[s._id.toString()] = s.name; });

    // Nhóm theo học sinh → môn → các đề
    const byStudent = {};
    attempts.forEach((a) => {
      if (!a.subject) return;
      const sid = a.studentId.toString();
      const subjId = a.subject.toString();
      if (!byStudent[sid]) byStudent[sid] = {};
      if (!byStudent[sid][subjId]) {
        byStudent[sid][subjId] = { bestScore: -1, sumScore: 0, count: 0, quizzes: [] };
      }
      const entry = byStudent[sid][subjId];
      entry.sumScore += a.score || 0;
      entry.count += 1;
      if ((a.score || 0) > entry.bestScore) entry.bestScore = a.score || 0;
      entry.quizzes.push({
        quizId: a.quizId?._id || a.quizId,
        quizTitle: a.quizId?.title || 'Bài thi',
        score: a.score || 0,
        percentage: a.percentage || 0,
        isPassed: Boolean(a.isPassed),
        timeTaken: a.timeTaken,
        endTime: a.endTime,
      });
    });

    const data = students.map((st) => {
      const subjMap = byStudent[st._id.toString()] || {};
      const results = Object.entries(subjMap)
        .map(([subjId, d]) => ({
          subjectId: subjId,
          subject: subjectNameMap[subjId] || 'Môn khác',
          bestScore: d.bestScore < 0 ? 0 : d.bestScore,
          averageScore: d.count > 0 ? Math.round((d.sumScore / d.count) * 10) / 10 : 0,
          attemptCount: d.count,
          quizzes: d.quizzes,
        }))
        .sort((a, b) => a.subject.localeCompare(b.subject));

      const averageAll = results.length
        ? Math.round((results.reduce((s, r) => s + r.averageScore, 0) / results.length) * 10) / 10
        : 0;

      return {
        student: st,
        results,
        averageScore: averageAll,
        totalSubjects: results.length,
      };
    });

    res.json({
      success: true,
      class: { _id: classDoc._id, name: classDoc.name },
      students: data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

