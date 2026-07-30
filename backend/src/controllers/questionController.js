const Question = require('../models/Question');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');
// Tạo câu hỏi
exports.createQuestion = async (req, res) => {
  try {
    const { content, options, category, difficulty, explanation } = req.body;

    // Validate options
    if (!options || options.length !== 4) {
      return res.status(400).json({ message: 'Câu hỏi phải có đúng 4 đáp án' });
    }

    const correctCount = options.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      return res.status(400).json({ message: 'Phải có đúng 1 đáp án đúng' });
    }

    // Nếu category là ObjectId của Subject, lấy tên subject
    let categoryName = '';
    if (category) {
      const subject = await Subject.findById(category);
      if (subject) categoryName = subject.name;
    }

    const question = new Question({
      content,
      options,
      category: category || null,
      categoryName,
      difficulty,
      explanation,
      createdBy: req.user.id || req.user.userId,
    });

    await question.save();
    res.status(201).json({ message: 'Tạo câu hỏi thành công', data: question });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách câu hỏi của giáo viên
/*
exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;
    const filter = { createdBy: req.user.userId };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(filter);

    res.json({
      data: questions,
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
};*/

exports.getQuestions = async (req, res) => {
  try {

    console.log("REQ.USER =", req.user);

    const { category, difficulty, page = 1, limit = 10 } = req.query;

    const userId = req.user.id || req.user.userId;

    const filter = {
      createdBy: new mongoose.Types.ObjectId(userId)
    };

    console.log("FILTER =", filter);

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    console.log("QUESTIONS =", questions);

    const total = await Question.countDocuments(filter);

    res.json({
      data: questions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};
// Lấy chi tiết câu hỏi
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'name email');
    if (!question) {
      return res.status(404).json({ message: 'Câu hỏi không tồn tại' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Câu hỏi không tồn tại' });
    }

    const currentUserId = req.user.id || req.user.userId;
    if (question.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa câu hỏi này' });
    }

    const { content, options, category, difficulty, explanation } = req.body;

    if (options && options.length !== 4) {
      return res.status(400).json({ message: 'Câu hỏi phải có đúng 4 đáp án' });
    }

    if (options) {
      const correctCount = options.filter(opt => opt.isCorrect).length;
      if (correctCount !== 1) {
        return res.status(400).json({ message: 'Phải có đúng 1 đáp án đúng' });
      }
    }

    // Nếu category thay đổi, cập nhật categoryName
    let categoryName = question.categoryName;
    if (category && category !== question.category?.toString()) {
      const subject = await Subject.findById(category);
      if (subject) categoryName = subject.name;
    }

    Object.assign(question, { content, options, category, difficulty, explanation, categoryName });
    await question.save();

    res.json({ message: 'Cập nhật câu hỏi thành công', data: question });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Câu hỏi không tồn tại' });
    }

    const currentUserId = req.user.id || req.user.userId;
    if (question.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa câu hỏi này' });
    }

    await Question.deleteOne({ _id: req.params.id });
    res.json({ message: 'Xóa câu hỏi thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách category (từ Subject model)
exports.getCategories = async (req, res) => {
  try {
const subjects = await Subject.find({ status: 'active' }).select('_id name code').sort({ name: 1 }).lean();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};