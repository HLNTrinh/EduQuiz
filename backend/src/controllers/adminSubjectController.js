const Subject = require('../models/Subject');

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

    const [subjects, total] = await Promise.all([
      Subject.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Subject.countDocuments(filter),
    ]);

    res.json({ success: true, subjects, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
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
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/subjects
========================= */
const createSubject = async (req, res) => {
  try {
    const { code, name, department, status, examsCount } = req.body;

    const existing = await Subject.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Mã môn học đã tồn tại' });

    const subject = await Subject.create({
      code: code.toUpperCase(),
      name,
      department,
      status: status || 'active',
      examsCount: examsCount || 0,
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
    const { code, name, department, status, examsCount } = req.body;

    const updateData = {};
    if (code) updateData.code = code.toUpperCase();
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (status) updateData.status = status;
    if (examsCount !== undefined) updateData.examsCount = examsCount;

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