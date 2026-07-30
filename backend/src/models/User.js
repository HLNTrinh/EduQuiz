const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },

    phone: {
      type: String,
      default: null,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    avatar: {
      type: String,
      default: null,
    },

    settings: {
      language: { type: String, default: 'vi' },
      emailNotif: { type: Boolean, default: true },
      pushNotif: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
