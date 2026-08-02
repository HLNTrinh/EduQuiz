const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung câu hỏi'],
      minlength: [5, 'Câu hỏi quá ngắn'],
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    categoryName: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    explanation: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Validate: phải có 4 đáp án, 1 đáp án đúng
questionSchema.pre('save', function (next) {
  if (this.options.length !== 4) {
    return next(new Error('Câu hỏi phải có đúng 4 đáp án'));
  }
  const correctCount = this.options.filter(opt => opt.isCorrect).length;
  if (correctCount !== 1) {
    return next(new Error('Phải có đúng 1 đáp án đúng'));
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);