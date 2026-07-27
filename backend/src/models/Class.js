const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    teacherName: {
      type: String,
      trim: true,
      default: '',
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    studentCount: {
      type: Number,
      default: 0,
    },
    year: {
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
  {
    timestamps: true,
  }
);

// Middleware: tự động cập nhật studentCount khi students thay đổi
classSchema.pre('save', function (next) {
  this.studentCount = this.students.length;
  next();
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;