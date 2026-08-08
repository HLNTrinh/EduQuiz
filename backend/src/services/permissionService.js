const TeacherAssignment = require('../models/TeacherAssignment');
const Class = require('../models/Class');

const getUserId = (req) => (req.user && (req.user.id || req.user.userId)) || null;

// Lấy danh sách môn học giáo viên được phân công dạy
async function getTeacherAssignedSubjects(teacherId) {
  const rows = await TeacherAssignment.find({ teacher: teacherId, status: 'active' })
    .select('subject')
    .lean();
  return rows.map((r) => r.subject.toString());
}

// Lấy danh sách lớp giáo viên được phân công dạy
async function getTeacherAssignedClasses(teacherId) {
  const rows = await TeacherAssignment.find({ teacher: teacherId, status: 'active' })
    .select('class')
    .lean();
  return rows.map((r) => r.class.toString());
}

// Giáo viên có được dạy môn này không?
async function canAccessSubject(teacherId, subjectId) {
  if (!teacherId || !subjectId) return false;
  const found = await TeacherAssignment.findOne({
    teacher: teacherId,
    subject: subjectId,
    status: 'active',
  }).lean();
  return Boolean(found);
}

// Giáo viên có phải chủ nhiệm lớp này không?
async function isHomeroomTeacher(teacherId, classId) {
  if (!teacherId || !classId) return false;
  const cls = await Class.findById(classId).select('homeroomTeacher').lean();
  return Boolean(cls && cls.homeroomTeacher && cls.homeroomTeacher.toString() === teacherId.toString());
}

// Giáo viên có được phân công dạy (subject, class) không? (bộ môn)
async function canAccessSubjectClass(teacherId, subjectId, classId) {
  if (!teacherId || !subjectId || !classId) return false;
  const found = await TeacherAssignment.findOne({
    teacher: teacherId,
    subject: subjectId,
    class: classId,
    status: 'active',
  }).lean();
  return Boolean(found);
}

// Tạo query filter để lọc QuizAttempt mà giáo viên được phép xem điểm.
// - Admin: xem tất cả
// - GV chủ nhiệm: xem toàn bộ môn của lớp chủ nhiệm
// - GV bộ môn: chỉ xem môn + lớp được phân công
async function getAttemptsFilter(user) {
  if (!user) return { _id: { $in: [] } };

  const userId = user.id || user.userId;
  if (user.role === 'admin') return {};

  if (user.role !== 'teacher') return { _id: { $in: [] } };

  // Các lớp giáo viên chủ nhiệm → xem mọi môn trong lớp đó
  const homeroomClasses = await Class.find({ homeroomTeacher: userId, status: 'active' })
    .select('_id')
    .lean();
  const homeroomClassIds = homeroomClasses.map((c) => c._id.toString());

  // Các (subject, class) giáo viên được phân công dạy → xem đúng môn/lớp
  const assignments = await TeacherAssignment.find({ teacher: userId, status: 'active' })
    .select('subject class')
    .lean();

  const subjectClassPairs = assignments.map((a) => ({
    subject: a.subject.toString(),
    class: a.class.toString(),
  }));

  // Xây dựng điều kiện OR
  const conditions = [];

  // 1) Chủ nhiệm: class thuộc lớp chủ nhiệm (bất kể môn)
  if (homeroomClassIds.length > 0) {
    conditions.push({ class: { $in: homeroomClassIds } });
  }

  // 2) Bộ môn: đúng cặp (subject, class)
  subjectClassPairs.forEach((pair) => {
    conditions.push({ subject: pair.subject, class: pair.class });
  });

  if (conditions.length === 0) {
    return { _id: { $in: [] } };
  }

  return { $or: conditions };
}

module.exports = {
  getUserId,
  getTeacherAssignedSubjects,
  getTeacherAssignedClasses,
  canAccessSubject,
  isHomeroomTeacher,
  canAccessSubjectClass,
  getAttemptsFilter,
};
