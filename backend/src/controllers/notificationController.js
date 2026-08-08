const Notification = require('../models/Notification');
const Quiz = require('../models/Quiz');
const QuizAssignment = require('../models/QuizAssignment');
const Class = require('../models/Class');

// Lấy danh sách thông báo cho học sinh (dựa trên lớp học)
exports.getStudentNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    // Lấy tất cả lớp của học sinh
    const studentClasses = await Class.find({ students: userId }).lean();
    const classIds = studentClasses.map((c) => c._id);

    // Lấy các quiz được giao cho lớp của học sinh (qua QuizAssignment)
    const assignments = await QuizAssignment.find({
      class: { $in: classIds },
      status: 'active',
    })
      .populate({
        path: 'quiz',
        select: 'title description subject',
        populate: { path: 'subject', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Tạo danh sách thông báo từ các assignment
    const now = new Date();
    const notifications = [];

    for (const assignment of assignments) {
      const quiz = assignment.quiz;
      if (!quiz) continue;

      // Thông báo: Đề thi mới được giao
      notifications.push({
        _id: `assignment-${assignment._id}`,
        title: '📝 Đề thi mới',
        content: `Bạn có đề thi "${quiz.title}" cần hoàn thành.`,
        quizId: quiz._id,
        type: 'new_quiz',
        createdAt: assignment.createdAt,
        read: false,
      });

      // Thông báo: Sắp đến hạn (trong 3 ngày) - deadline nằm trong QuizAssignment
      const endDate = assignment.deadline ? new Date(assignment.deadline) : null;
      if (endDate) {
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft > 0 && daysLeft <= 3) {
          notifications.push({
            _id: `deadline-${quiz._id}`,
            title: '⏰ Sắp đến hạn',
            content: `Đề thi "${quiz.title}" sẽ hết hạn sau ${daysLeft} ngày (${endDate.toLocaleDateString('vi-VN')}).`,
            quizId: quiz._id,
            type: 'deadline',
            createdAt: now,
            read: false,
          });
        }

        // Thông báo: Đã hết hạn
        if (endDate < now) {
          notifications.push({
            _id: `expired-${quiz._id}`,
            title: '⌛ Đã hết hạn',
            content: `Đề thi "${quiz.title}" đã hết hạn vào ${endDate.toLocaleDateString('vi-VN')}.`,
            quizId: quiz._id,
            type: 'expired',
            createdAt: now,
            read: false,
          });
        }
      }
    }

    // Lấy thông báo từ Admin
    const adminNotifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const adminNotifs = adminNotifications.map((n) => ({
      _id: `admin-${n._id}`,
      title: n.title,
      content: n.content,
      quizId: null,
      type: 'admin',
      createdAt: n.createdAt,
      read: false,
    }));

    // Gộp và sắp xếp theo thời gian
    const allNotifs = [...notifications, ...adminNotifs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json({
      success: true,
      data: allNotifs,
      total: allNotifs.length,
    });
  } catch (error) {
    console.error('Get student notifications error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    res.json({ success: true, message: 'Đã đánh dấu thông báo' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
