const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');

/* =========================
   GET /api/admin/subjects
   Lấy danh sách môn học (có tìm kiếm, lọc, phân trang)
========================= */
const getSubjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', status = '' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (department && department !== 'all') filter.department = department;
    if (status && status !== 'all') filter.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [subjects, total, activeCount, pausedCount, allSubjects] = await Promise.all([
      Subject.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Subject.countDocuments(filter),
      Subject.countDocuments({ status: 'active' }),
      Subject.countDocuments({ status: 'inactive' }),
      Subject.find().select('department').lean(),
    ]);

    // Đếm số khoa/ngành duy nhất từ tất cả môn học
    const deptCount = [...new Set(allSubjects.map(s => s.department))].length;

    // Lấy số lượng đề thi thực tế cho từng môn từ Quiz model
    const subjectIds = subjects.map(s => s._id);
    const quizCounts = await Quiz.aggregate([
      { $match: { subject: { $in: subjectIds } } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
    ]);

    // Map quiz counts vào subjects
    const countMap = {};
    quizCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    const subjectsWithQuizCount = subjects.map(s => ({
      ...s,
      quizCount: countMap[s._id.toString()] || 0,
    }));

    res.json({ success: true, subjects: subjectsWithQuizCount, total, page: pageNum, totalPages: Math.ceil(total / limitNum), activeCount, pausedCount, deptCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/subjects/:id
========================= */
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).lean();
    if (!subject) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });

    // Đếm số lượng đề thi thực tế từ Quiz model
    const quizCount = await Quiz.countDocuments({ subject: subject._id });

    res.json({ success: true, subject: { ...subject, quizCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/subjects
========================= */
const createSubject = async (req, res) => {
  try {
    const { code, name, department, status } = req.body;

    const existing = await Subject.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Mã môn học đã tồn tại' });

    const subject = await Subject.create({
      code: code.toUpperCase(),
      name,
      department,
      status: status || 'active',
    });

    res.status(201).json({ success: true, message: 'Thêm môn học thành công', subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PUT /api/admin/subjects/:id
========================= */
const updateSubject = async (req, res) => {
  try {
    const { code, name, department, status } = req.body;

    const updateData = {};
    if (code) updateData.code = code.toUpperCase();
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (status) updateData.status = status;

    const subject = await Subject.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!subject) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });

    res.json({ success: true, message: 'Cập nhật môn học thành công', subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   DELETE /api/admin/subjects/:id
========================= */
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
    res.json({ success: true, message: 'Xóa môn học thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };