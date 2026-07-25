const express = require('express');
const {
  startQuizAttempt,
  saveAnswer,
  submitQuizAttempt,
  getAttemptResult,
  getStudentAttempts,
  getTeacherAttempts,
} = require('../controllers/quizAttemptController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Học sinh
router.post('/start/:quizId', authenticate, authorize('student'), startQuizAttempt);
router.post('/:attemptId/answer', authenticate, authorize('student'), saveAnswer);
router.post('/:attemptId/submit', authenticate, authorize('student'), submitQuizAttempt);
router.get('/:attemptId/result', authenticate, getAttemptResult);
router.get('/', authenticate, authorize('student'), getStudentAttempts);

// Giáo viên
router.get('/teacher', authenticate, authorize('teacher', 'admin'), getTeacherAttempts);

module.exports = router;
