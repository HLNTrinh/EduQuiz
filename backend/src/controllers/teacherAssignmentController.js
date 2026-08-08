const TeacherAssignment = require('../models/TeacherAssignment');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Lấy danh sách phân công (có lọc theo teacher/subject/class, tìm kiếm, phân trang)
exports.getAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, teacher = '', subject = '', class: classId = '', search = '' } = req.query;

    const filter = {};
    if (teacher && isValidObjectId(teacher)) filter.teacher = teacher;
    if (subject && isValidObjectId(subject)) filter.subject = subject;
    if (classId && isValidObjectId(classId)) filter.class = classId;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    if (!search) {
      const [assignments, total] = await Promise.all([
        TeacherAssignment.find(filter)
          .populate('teacher', 'name email userCode')
          .populate('subject', 'name code')
          .populate('class', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        TeacherAssignment.countDocuments(filter),
      ]);
      return res.json({ success: true, assignments, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    }

    // Trường hợp có search → dùng aggregate để tìm theo tên
    const matchStage = {};
    if (teacher && isValidObjectId(teacher)) matchStage.teacher = new mongoose.Types.ObjectId(teacher);
    if (subject && isValidObjectId(subject)) matchStage.subject = new mongoose.Types.ObjectId(subject);
    if (classId && isValidObjectId(classId)) matchStage.class = new mongoose.Types.ObjectId(classId);

    const pipeline = [
      { $match: matchStage },
      { $lookup: { from: 'users', localField: 'teacher', foreignField: '_id', as: 'teacherDoc' } },
      { $unwind: { path: '$teacherDoc', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'subjects', localField: 'subject', foreignField: '_id', as: 'subjectDoc' } },
      { $unwind: { path: '$subjectDoc', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'classDoc' } },
      { $unwind: { path: '$classDoc', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const regex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'teacherDoc.name': regex },
            { 'teacherDoc.email': regex },
            { 'teacherDoc.userCode': regex },
            { 'subjectDoc.name': regex },
            { 'subjectDoc.code': regex },
            { 'classDoc.name': regex },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limitNum });

    const assignments = await TeacherAssignment.aggregate(pipeline);
    const countResult = await TeacherAssignment.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'users', localField: 'teacher', foreignField: '_id', as: 'teacherDoc' } },
      { $unwind: { path: '$teacherDoc', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'subjects', localField: 'subject', foreignField: '_id', as: 'subjectDoc' } },
      { $unwind: { path: '$subjectDoc', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'classDoc' } },
      { $unwind: { path: '$classDoc', preserveNullAndEmptyArrays: true } },
    ]);
    const total = countResult.length;

    res.json({ success: true, assignments, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết 1 phân công
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await TeacherAssignment.findById(req.params.id)
      .populate('teacher', 'name email userCode')
      .populate('subject', 'name code')
      .populate('class', 'name')
      .lean();
    if (!assignment) return res.status(404).json({ success: false, message: 'Không tìm thấy phân công' });
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Tạo phân công mới
exports.createAssignment = async (req, res) => {
  try {
    const { teacher, subject, class: classId, schoolYear, status } = req.body;

    if (!teacher || !subject || !classId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn đầy đủ giáo viên, môn học và lớp học' });
    }

    const exists = await TeacherAssignment.findOne({ subject, class: classId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Môn học này ở lớp này đã có giáo viên dạy rồi' });
    }

    const assignment = await TeacherAssignment.create({
      teacher,
      subject,
      class: classId,
      schoolYear: schoolYear || '',
      status: status || 'active',
    });

    res.status(201).json({ success: true, message: 'Thêm phân công thành công', assignment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Môn học này ở lớp này đã có giáo viên dạy rồi' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật phân công
exports.updateAssignment = async (req, res) => {
  try {
    const { teacher, subject, class: classId, schoolYear, status } = req.body;

    const existing = await TeacherAssignment.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy phân công' });

    // Nếu thay đổi (subject, class) thì kiểm tra trùng: 1 môn + 1 lớp chỉ 1 giáo viên
    if (subject || classId) {
      const newSubject = subject || existing.subject;
      const newClass = classId || existing.class;

      const dup = await TeacherAssignment.findOne({
        _id: { $ne: existing._id },
        subject: newSubject,
        class: newClass,
      });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Môn học này ở lớp này đã có giáo viên dạy rồi' });
      }
    }

    const updateData = {};
    if (teacher !== undefined) updateData.teacher = teacher;
    if (subject !== undefined) updateData.subject = subject;
    if (classId !== undefined) updateData.class = classId;
    if (schoolYear !== undefined) updateData.schoolYear = schoolYear;
    if (status !== undefined) updateData.status = status;

    const assignment = await TeacherAssignment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, message: 'Cập nhật phân công thành công', assignment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Phân công này đã tồn tại (cùng giáo viên, môn và lớp)' });
    }
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Xóa phân công
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await TeacherAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Không tìm thấy phân công' });
    res.json({ success: true, message: 'Xóa phân công thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
