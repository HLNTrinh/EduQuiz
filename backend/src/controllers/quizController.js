const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Class = require('../models/Class');
const QuizAssignment = require('../models/QuizAssignment');
const { getUserId, canAccessSubject, canAccessSubjectClass } = require('../services/permissionService');

const getQuestionId = (q) => q.questionId || q._id;

// Tạo đề thi (chỉ lưu nội dung đề: title, subject, questions, ...)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions, duration, maxAttempts, showAnswerAfter, totalPoints, passingScore, subject } = req.body;
    const userId = getUserId(req);

    const normalizedQuestions = (questions || []).map((question, index) => ({
      questionId: getQuestionId(question),
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

    if (!subject) {
      return res.status(400).json({ message: 'Vui lòng chọn môn học cho đề thi' });
    }

    // Kiểm tra quyền dạy môn
    if (req.user.role !== 'admin') {
      const allowed = await canAccessSubject(userId, subject);
      if (!allowed) {
        return res.status(403).json({ message: 'Bạn không được phân công dạy môn học này' });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      questions: normalizedQuestions,
      duration: Number(duration || 45),
      maxAttempts: Number(maxAttempts || 1),
      showAnswerAfter: Boolean(showAnswerAfter),
      totalPoints: Number(totalPoints || normalizedQuestions.length * 10),
      passingScore: Number(passingScore || 50),
      createdBy: userId,
      subject,
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
    const userId = getUserId(req);

    if (req.user.role === 'student') {
      // Student: tìm các lớp có chứa học sinh này
      const studentClasses = await Class.find({ students: userId }).select('_id').lean();
      const classIds = studentClasses.map((c) => c._id);

      // Tìm assignment đang active của các lớp đó
      const assignments = classIds.length
        ? await QuizAssignment.find({ class: { $in: classIds }, status: 'active' }).lean()
        : [];

      const quizIds = [...new Set(assignments.map((a) => a.quiz?.toString()).filter(Boolean))];

      const quizzes = await Quiz.find({ _id: { $in: quizIds }, isPublished: true })
        .populate('createdBy', 'name email')
        .populate('questions.questionId')
        .populate('subject', 'name')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean();

      // Gắn thông tin assignment (class, startTime, deadline) cho từng quiz
      const assignmentsByQuiz = {};
      assignments.forEach((a) => {
        if (!a.quiz) return;
        const id = a.quiz.toString();
        if (!assignmentsByQuiz[id]) assignmentsByQuiz[id] = a;
      });

      const data = quizzes.map((q) => {
        const ass = assignmentsByQuiz[q._id.toString()];
        return {
          ...q,
          assignment: ass
            ? { _id: ass._id, class: ass.class, startTime: ass.startTime, deadline: ass.deadline, status: ass.status }
            : null,
        };
      });

      return res.json({
        data,
        pagination: { total: quizIds.length, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(quizIds.length / limit) },
      });
    }

    // Teacher/Admin: đề do họ tạo
    const quizFilter = req.user.role === 'admin' ? {} : { createdBy: userId };
    const quizzes = await Quiz.find(quizFilter)
      .populate('createdBy', 'name email')
      .populate('questions.questionId')
      .populate('subject', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    // Gắn thông tin các lớp được giao đề (từ QuizAssignment)
    const quizIds = quizzes.map((q) => q._id);
    const assignments = quizIds.length
      ? await QuizAssignment.find({ quiz: { $in: quizIds } })
          .populate('class', 'name')
          .lean()
      : [];
    const assignmentsByQuiz = {};
    assignments.forEach((a) => {
      const id = a.quiz?.toString();
      if (id) (assignmentsByQuiz[id] = assignmentsByQuiz[id] || []).push(a);
    });

    const data = quizzes.map((q) => ({
      ...q,
      assignments: assignmentsByQuiz[q._id.toString()] || [],
    }));

    const total = await Quiz.countDocuments(quizFilter);
    return res.json({
      data,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
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

    const { title, description, questions, duration, maxAttempts, showAnswerAfter, totalPoints, passingScore, subject } = req.body;

    // Nếu thay đổi môn → kiểm tra quyền dạy môn mới
    if (subject && subject !== quiz.subject?.toString() && req.user.role !== 'admin') {
      const allowed = await canAccessSubject(getUserId(req), subject);
      if (!allowed) {
        return res.status(403).json({ message: 'Bạn không được phân công dạy môn học này' });
      }
    }

    Object.assign(quiz, {
      title,
      description,
      questions,
      duration,
      maxAttempts,
      showAnswerAfter,
      totalPoints,
      passingScore,
      subject: subject || quiz.subject,
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

    // Xóa cả các assignment giao đề
    await QuizAssignment.deleteMany({ quiz: quiz._id });
    await Quiz.deleteOne({ _id: req.params.id });
    res.json({ message: 'Xóa đề thi thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Publish + giao đề: tạo/cập nhật QuizAssignment cho từng lớp được chọn
exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Đề thi không tồn tại' });
    }

    const userId = req.user.id || req.user.userId;
    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền công bố đề thi này' });
    }

    const { classes, classId, startTime, deadline } = req.body;

    // Chuẩn hóa danh sách lớp cần giao đề
    let assignList = [];
    if (Array.isArray(classes) && classes.length) {
      assignList = classes.map((c) =>
        typeof c === 'string' ? { classId: c } : { classId: c.classId || c.class, startTime: c.startTime, deadline: c.deadline }
      );
    } else if (classId) {
      assignList = [{ classId, startTime, deadline }];
    }

    if (assignList.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn lớp để giao đề' });
    }

    // Kiểm tra giáo viên được phân công dạy môn ở từng lớp
    for (const item of assignList) {
      const cid = item.classId;
      if (!cid) continue;
      if (req.user.role !== 'admin') {
        const allowed = await canAccessSubjectClass(userId, quiz.subject, cid);
        if (!allowed) {
          return res.status(403).json({ message: 'Bạn không được phân công dạy môn này ở lớp được chọn' });
        }
      }
      await QuizAssignment.findOneAndUpdate(
        { quiz: quiz._id, class: cid },
        {
          teacher: userId,
          startTime: item.startTime ? new Date(item.startTime) : null,
          deadline: item.deadline ? new Date(item.deadline) : null,
          status: 'active',
        },
        { upsert: true, new: true }
      );
    }

    quiz.isPublished = true;
    await quiz.save();
    res.json({ message: 'Công bố đề thi thành công', data: quiz });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


