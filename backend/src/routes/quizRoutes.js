const express = require('express');
const {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
} = require('../controllers/quizController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticate, authorize('teacher', 'admin'), createQuiz);
router.get('/', authenticate, getQuizzes);
router.get('/:id', authenticate, getQuiz);
router.put('/:id', authenticate, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), deleteQuiz);
router.post('/:id/publish', authenticate, authorize('teacher', 'admin'), publishQuiz);

module.exports = router;
