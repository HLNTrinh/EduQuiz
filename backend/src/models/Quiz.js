const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề đề thi'],
      minlength: [3, 'Tiêu đề quá ngắn'],
    },
    description: {
      type: String,
      default: '',
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    duration: {
      type: Number, // phút
      required: [true, 'Vui lòng nhập thời gian làm bài'],
      min: [1, 'Thời gian phải từ 1 phút trở lên'],
    },
    maxAttempts: {
      type: Number,
      default: 999,
      min: [1, 'Tối thiểu 1 lần làm'],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    showAnswerAfter: {
      type: Boolean,
      default: true,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    passingScore: {
      type: Number,
      default: 50,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
