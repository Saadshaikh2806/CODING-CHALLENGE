const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Register a new user
router.post('/signup', authController.signup);

// Login user
router.post('/signin', authController.signin);

// Update password (requires authentication)
router.put('/update-password', [authMiddleware.verifyToken], authController.updatePassword);

module.exports = router;
