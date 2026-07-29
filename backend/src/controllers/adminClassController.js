const Class = require('../models/Class');
const User = require('../models/User');
const mongoose = require('mongoose');

// Utility: escape regex for exact name matching
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* =========================
   GET /api/admin/classes
   Lấy danh sách lớp học (có tìm kiếm, phân trang)
========================= */
const getClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { teacherName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [classes, total] = await Promise.all([
      Class.find(filter)
        .populate('teacher', 'name email avatar')
        .populate('students', 'name email avatar role status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Class.countDocuments(filter),
    ]);

    res.json({ success: true, classes, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/classes/:id
========================= */
const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status')
      .lean();

    if (!classItem) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    res.json({ success: true, class: classItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/classes
   Tạo lớp học mới
========================= */
const createClass = async (req, res) => {
  try {
    const { name, teacher, teacherName, year, status } = req.body;

    // Resolve teacher: prefer explicit teacher ObjectId; otherwise try to match by name or email
    let teacherId = null;
    let resolvedTeacherName = teacherName || '';

    if (teacher && mongoose.Types.ObjectId.isValid(teacher)) {
      teacherId = teacher;
      // try to get canonical name
      const t = await User.findById(teacherId).select('name');
      if (t) resolvedTeacherName = t.name;
    } else if (teacherName) {
      // try exact email match or exact name (case-insensitive)
      const found = await User.findOne({
        $or: [
          { email: teacherName.toLowerCase() },
          { name: { $regex: `^${escapeRegex(teacherName)}$`, $options: 'i' } },
        ],
        role: 'teacher',
      }).select('name');

      if (found) {
        teacherId = found._id;
        resolvedTeacherName = found.name;
      }
    }

    const classData = {
      name,
      teacher: teacherId,
      teacherName: resolvedTeacherName,
      year: year || '',
      status: status || 'active',
      students: [],
      studentCount: 0,
    };

    const newClass = await Class.create(classData);

    res.status(201).json({ success: true, message: 'Tạo lớp học thành công', class: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   PUT /api/admin/classes/:id
   Cập nhật thông tin lớp học
========================= */
const updateClass = async (req, res) => {
  try {
    const { name, teacher, teacherName, year, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;

    // If teacher explicitly provided (could be null to clear), use it
    if (teacher !== undefined) {
      updateData.teacher = teacher;
    }

    // If teacherName provided but teacher not explicitly set, try to resolve to teacher id
    if ((teacher === undefined || teacher === null) && teacherName) {
      const found = await User.findOne({
        $or: [
          { email: teacherName.toLowerCase() },
          { name: { $regex: `^${escapeRegex(teacherName)}$`, $options: 'i' } },
        ],
        role: 'teacher',
      }).select('name');

      if (found) {
        updateData.teacher = found._id;
        updateData.teacherName = found.name;
      } else {
        // If not found, still update teacherName field so admin can store free text
        updateData.teacherName = teacherName;
      }
    } else if (teacherName !== undefined) {
      updateData.teacherName = teacherName;
    }

    if (year) updateData.year = year;
    if (status) updateData.status = status;

    const updatedClass = await Class.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status');

    if (!updatedClass) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });

    res.json({ success: true, message: 'Cập nhật lớp học thành công', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   DELETE /api/admin/classes/:id
   Xóa lớp học
========================= */
const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findByIdAndDelete(req.params.id);
    if (!classItem) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    res.json({ success: true, message: 'Xóa lớp học thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   POST /api/admin/classes/:id/students
   Thêm học sinh vào lớp
========================= */
const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ID học sinh' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'ID học sinh không hợp lệ' });
    }

    // Kiểm tra user có tồn tại không
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Tài khoản được chọn không phải học sinh' });
    }

    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    // Kiểm tra học sinh đã có trong lớp chưa
    if (classItem.students.some((id) => id.equals(student._id))) {
      return res.status(400).json({ success: false, message: 'Học sinh đã có trong lớp này' });
    }

    classItem.students.push(studentId);
    classItem.studentCount = classItem.students.length;
    await classItem.save();

    const updatedClass = await Class.findById(req.params.id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status')
      .lean();

    res.json({ success: true, message: 'Thêm học sinh thành công', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   DELETE /api/admin/classes/:id/students/:studentId
   Xóa học sinh khỏi lớp
========================= */
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    const studentIndex = classItem.students.findIndex((student) => student.equals(studentId));
    if (studentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Học sinh không có trong lớp này' });
    }

    classItem.students.splice(studentIndex, 1);
    classItem.studentCount = classItem.students.length;
    await classItem.save();

    const updatedClass = await Class.findById(id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status')
      .lean();

    res.json({ success: true, message: 'Xóa học sinh khỏi lớp thành công', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
};
