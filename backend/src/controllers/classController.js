const Class = require('../models/Class');
const User = require('../models/User');

const getUserId = (req) => req.user?.id || req.user?.userId;

const getTeacherClasses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const filter = { teacher: userId };
    const classes = await Class.find(filter)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

const getStudentClasses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const classes = await Class.find({ students: userId })
      .populate('teacher', 'name email avatar')
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
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar role status')
      .lean();

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    const isTeacher = req.user.role === 'teacher' && classItem.teacher?._id?.toString() === userId;
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
