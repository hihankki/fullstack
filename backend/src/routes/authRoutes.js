const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Аутентификация пользователя
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/register
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', authController.register);

module.exports = router;