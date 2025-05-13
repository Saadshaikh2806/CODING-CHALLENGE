const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all users (admin only)
router.get('/', [authMiddleware.verifyToken, authMiddleware.isAdmin], userController.findAll);

// Get dashboard statistics (admin only)
router.get('/dashboard-stats', [authMiddleware.verifyToken, authMiddleware.isAdmin], userController.getDashboardStats);

// Create a new user (admin only)
router.post('/', [authMiddleware.verifyToken, authMiddleware.isAdmin], userController.create);

// Get user by ID (admin only)
router.get('/:id', [authMiddleware.verifyToken, authMiddleware.isAdmin], userController.findOne);

// Delete a user (admin only)
router.delete('/:id', [authMiddleware.verifyToken, authMiddleware.isAdmin], userController.delete);

module.exports = router;
