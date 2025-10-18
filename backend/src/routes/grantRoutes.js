const express = require('express');
const router = express.Router();
const grantController = require('../controllers/grantController');

// @route   GET /api/grants
// @desc    Получить все гранты
// @access  Public
router.get('/', grantController.getAllGrants);

// @route   GET /api/grants/:id
// @desc    Получить грант по ID
// @access  Public
router.get('/:id', grantController.getGrantById);

// @route   POST /api/grants
// @desc    Создать новый грант
// @access  Private (Admin)
router.post('/', grantController.createGrant);

module.exports = router;