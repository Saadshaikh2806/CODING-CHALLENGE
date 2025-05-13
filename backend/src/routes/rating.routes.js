const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Submit a rating (normal user)
router.post('/', [authMiddleware.verifyToken], ratingController.submitRating);

// Get user's rating for a store
router.get('/store/:storeId', [authMiddleware.verifyToken], ratingController.getUserRating);

// Get all ratings (admin only)
router.get('/', [authMiddleware.verifyToken, authMiddleware.isAdmin], ratingController.findAll);

module.exports = router;
