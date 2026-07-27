const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth');

// Import Admin Controllers
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleLockUser,
} = require('../controllers/adminUserController');

const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/adminSubjectController');

const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
} = require('../controllers/adminClassController');

const {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  togglePinNotification,
} = require('../controllers/adminNotificationController');

const {
  getDashboardStats,
  getChartData,
  getRoleDistribution,
  getRecentActivities,
} = require('../controllers/adminDashboardController');

const {
  getSettings,
  updateSettings,
} = require('../controllers/adminSettingController');

// Tất cả routes admin đều cần authenticate + authorize('admin')
router.use(authenticate, authorize('admin'));

// ==================== User Management ====================
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-lock', toggleLockUser);

// ==================== Subject Management ====================
router.get('/subjects', getSubjects);
router.get('/subjects/:id', getSubjectById);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// ==================== Class Management ====================
router.get('/classes', getClasses);
router.get('/classes/:id', getClassById);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.post('/classes/:id/students', addStudent);
router.delete('/classes/:id/students/:studentId', removeStudent);

// ==================== Notification Management ====================
router.get('/notifications', getNotifications);
router.get('/notifications/:id', getNotificationById);
router.post('/notifications', createNotification);
router.put('/notifications/:id', updateNotification);
router.delete('/notifications/:id', deleteNotification);
router.patch('/notifications/:id/toggle-pin', togglePinNotification);

// ==================== Dashboard ====================
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/chart', getChartData);
router.get('/dashboard/role-distribution', getRoleDistribution);
router.get('/dashboard/recent-activities', getRecentActivities);

// ==================== Settings ====================
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;