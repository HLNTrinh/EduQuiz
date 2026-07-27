const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

/* =========================
   GET /api/admin/dashboard/stats
   Thống kê tổng quan cho Dashboard
========================= */
const getDashboardStats = async (req, res) => {
  try {
    // Lấy tất cả thống kê cùng lúc
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalQuizzes,
      totalAttempts,
      todayAttempts,
      weeklyAttempts,
      totalSubjects,
      totalClasses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(),
      // Bài nộp hôm nay
      QuizAttempt.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
      }),
      // Bài nộp 7 ngày qua
      QuizAttempt.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Subject.countDocuments(),
      Class.countDocuments(),
    ]);

    // Đếm số admin
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalTeachers,
        totalStudents,
        totalQuizzes,
        totalAttempts,
        todayAttempts,
        weeklyAttempts,
        totalSubjects,
        totalClasses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/dashboard/chart
   Dữ liệu biểu đồ số bài thi 7 ngày qua
========================= */
const getChartData = async (req, res) => {
  try {
    const { period = 'day' } = req.query; // 'day' hoặc 'week'

    const now = new Date();
    const days = period === 'week' ? 28 : 7;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Lấy tất cả bài nộp trong khoảng thời gian
    const attempts = await QuizAttempt.find({
      createdAt: { $gte: startDate },
    })
      .select('createdAt')
      .lean();

    // Tạo map labels tiếng Việt
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Nhóm theo ngày
    const groupedData = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      groupedData[key] = {
        label: dayLabels[dayOfWeek],
        count: 0,
        date: key,
      };
    }

    attempts.forEach((attempt) => {
      const key = attempt.createdAt.toISOString().split('T')[0];
      if (groupedData[key]) {
        groupedData[key].count += 1;
      }
    });

    // Chuyển về mảng và sắp xếp theo ngày tăng dần
    const chartData = Object.values(groupedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.json({ success: true, chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/dashboard/role-distribution
   Phân bố vai trò người dùng (cho donut chart)
========================= */
const getRoleDistribution = async (req, res) => {
  try {
    const [students, teachers, admins] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    const total = students + teachers + admins;

    res.json({
      success: true,
      distribution: {
        students,
        teachers,
        admins,
        total,
        percentages: {
          students: total > 0 ? parseFloat(((students / total) * 100).toFixed(1)) : 0,
          teachers: total > 0 ? parseFloat(((teachers / total) * 100).toFixed(1)) : 0,
          admins: total > 0 ? parseFloat(((admins / total) * 100).toFixed(1)) : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/* =========================
   GET /api/admin/dashboard/recent-activities
   Hoạt động gần đây
========================= */
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Lấy bài nộp gần đây nhất
    const recentAttempts = await QuizAttempt.find()
      .populate('studentId', 'name email avatar')
      .populate('quizId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const activities = recentAttempts.map((attempt) => ({
      id: attempt._id,
      user: attempt.studentId
        ? {
            name: attempt.studentId.name,
            email: attempt.studentId.email,
            avatar: attempt.studentId.avatar,
          }
        : { name: 'Người dùng ẩn danh', email: '', avatar: null },
      action: 'Nộp bài thi',
      target: attempt.quizId ? attempt.quizId.title : 'Bài thi không xác định',
      time: attempt.createdAt,
      timeAgo: getTimeAgo(attempt.createdAt),
    }));

    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Helper: tính thời gian trước
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

module.exports = {
  getDashboardStats,
  getChartData,
  getRoleDistribution,
  getRecentActivities,
};