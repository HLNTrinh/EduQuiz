const Class = require('../models/Class');
const User = require('../models/User');
const TeacherAssignment = require('../models/TeacherAssignment');

const getUserId = (req) => req.user?.id || req.user?.userId;

// Các lớp giáo viên quản lý: là chủ nhiệm HOẶC được phân công dạy
const getTeacherClasses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { subject } = req.query;

    let ids;
    if (subject) {
      // Lọc theo môn: chỉ các lớp giáo viên được phân công dạy môn này
      const subjectClassIds = await TeacherAssignment.find({
        teacher: userId,
        subject,
        status: 'active',
      }).distinct('class');
      ids = new Set(subjectClassIds.map((x) => x.toString()));
    } else {
      // Lớp giáo viên làm chủ nhiệm
      const homeroomClasses = await Class.find({ homeroomTeacher: userId })
        .select('_id')
        .lean();

      // Lớp giáo viên được phân công dạy (qua TeacherAssignment)
      const assignedClassIds = await TeacherAssignment.find({ teacher: userId, status: 'active' })
        .distinct('class');

      ids = new Set([
        ...homeroomClasses.map((c) => c._id.toString()),
        ...assignedClassIds.map((x) => x.toString()),
      ]);
    }

    const classes = ids.size
      ? await Class.find({ _id: { $in: [...ids] } })
          .populate('homeroomTeacher', 'name email avatar')
          .populate('students', 'name email avatar role status')
          .sort({ createdAt: -1 })
          .lean()
      : [];

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const getStudentClasses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const classes = await Class.find({ students: userId })
      .populate('homeroomTeacher', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const getClassMembers = async (req, res) => {
  try {
    const userId = getUserId(req);
    const classItem = await Class.findById(req.params.id)
      .populate('homeroomTeacher', 'name email avatar')
      .populate('students', 'name email avatar role status')
      .lean();

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    // Giáo viên: là chủ nhiệm hoặc được phân công dạy lớp này
    let isTeacher = false;
    if (req.user.role === 'teacher') {
      isTeacher = classItem.homeroomTeacher?._id?.toString() === userId;
      if (!isTeacher) {
        const assigned = await TeacherAssignment.findOne({ teacher: userId, class: classItem._id, status: 'active' }).lean();
        isTeacher = Boolean(assigned);
      }
    }
    const isStudent = req.user.role === 'student' && classItem.students.some((student) => student._id.toString() === userId);
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isStudent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập lớp học này' });
    }

    res.json({ success: true, class: classItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getTeacherClasses,
  getStudentClasses,
  getClassMembers,
};
