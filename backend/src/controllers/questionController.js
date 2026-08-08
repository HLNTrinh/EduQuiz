const Question = require('../models/Question');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');
const {
  canAccessSubject,
  getTeacherAssignedSubjects,
  getUserId,
} = require('../services/permissionService');

// Kiểm tra giáo viên có được thao tác trên môn này không
async function ensureSubjectPermission(req, category) {
  const userId = getUserId(req);
  if (!userId) return { ok: false, message: 'Vui lòng đăng nhập' };

  // Admin không bị giới hạn môn
  if (req.user.role === 'admin') return { ok: true };

  if (!category) {
    return { ok: false, message: 'Vui lòng chọn môn học cho câu hỏi' };
  }

  const allowed = await canAccessSubject(userId, category);
  if (!allowed) {
    return { ok: false, message: 'Bạn không được phân công dạy môn học này' };
  }
  return { ok: true };
}

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

    // Kiểm tra quyền dạy môn
    const perm = await ensureSubjectPermission(req, category);
    if (!perm.ok) return res.status(403).json({ message: perm.message });

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

// Lấy danh sách câu hỏi (ngân hàng câu hỏi dùng chung theo môn được phân công)
exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;

    const userId = getUserId(req);

    // Xác định danh sách môn được phép
    let allowedSubjects = null;
    if (req.user.role === 'admin') {
      allowedSubjects = null; // admin xem tất cả
    } else {
      allowedSubjects = await getTeacherAssignedSubjects(userId);
      if (allowedSubjects.length === 0) {
        return res.json({
          data: [],
          pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 },
        });
      }
    }

    const filter = {};
    if (allowedSubjects) {
      // Nếu truyền category không thuộc môn được phân công → trả về rỗng
      if (category && !allowedSubjects.includes(category)) {
        return res.json({ data: [], pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 } });
      }
      filter.category = category ? category : { $in: allowedSubjects };
    } else if (category) {
      filter.category = category;
    }
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
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
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

    // Nếu category thay đổi, kiểm tra quyền dạy môn mới
    if (category && category !== question.category?.toString()) {
      const perm = await ensureSubjectPermission(req, category);
      if (!perm.ok) return res.status(403).json({ message: perm.message });
    }

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

// Lấy danh sách category (từ Subject model) - giáo viên chỉ thấy môn được phân công
exports.getCategories = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const subjects = await Subject.find({ status: 'active' }).select('_id name code').sort({ name: 1 }).lean();
      return res.json(subjects);
    }

    const userId = getUserId(req);
    const allowedSubjects = await getTeacherAssignedSubjects(userId);
    const subjects = await Subject.find({ _id: { $in: allowedSubjects }, status: 'active' })
      .select('_id name code')
      .sort({ name: 1 })
      .lean();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
