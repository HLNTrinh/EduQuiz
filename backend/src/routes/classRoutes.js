const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { getTeacherClasses, getStudentClasses, getClassMembers } = require('../controllers/classController');

const router = express.Router();

router.get('/teacher', authenticate, authorize('teacher', 'admin'), getTeacherClasses);
router.get('/student', authenticate, authorize('student', 'admin'), getStudentClasses);
router.get('/:id/members', authenticate, getClassMembers);

module.exports = router;
