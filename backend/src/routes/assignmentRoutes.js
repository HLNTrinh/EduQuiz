const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/teacherAssignmentController');

// Chỉ admin quản lý phân công giáo viên - môn - lớp
router.use(authenticate, authorize('admin'));

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.post('/', createAssignment);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

module.exports = router;
