const express = require('express');
const { register, login, getMe, updateProfile, changePassword, updateSettings } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/settings', authenticate, updateSettings);

module.exports = router;
