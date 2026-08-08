const mongoose = require('mongoose');

const quizAssignmentSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// 1 đề giao cho 1 lớp chỉ có 1 assignment
quizAssignmentSchema.index({ quiz: 1, class: 1 }, { unique: true });
quizAssignmentSchema.index({ class: 1 });
quizAssignmentSchema.index({ teacher: 1 });

module.exports = mongoose.model('QuizAssignment', quizAssignmentSchema);