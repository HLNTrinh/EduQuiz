const mongoose = require('mongoose');

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vui lòng chọn giáo viên'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Vui lòng chọn môn học'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Vui lòng chọn lớp học'],
    },
    schoolYear: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Một môn của một lớp chỉ được phân công cho duy nhất 1 giáo viên
// (giáo viên vẫn có thể dạy cùng môn đó ở lớp khác vì khác `class`)
teacherAssignmentSchema.index({ subject: 1, class: 1 }, { unique: true });
teacherAssignmentSchema.index({ teacher: 1 });
teacherAssignmentSchema.index({ subject: 1 });

const TeacherAssignment = mongoose.model('TeacherAssignment', teacherAssignmentSchema);

module.exports = TeacherAssignment;
