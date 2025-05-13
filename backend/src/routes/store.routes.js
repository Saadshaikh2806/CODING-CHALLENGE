const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Create a new store (admin only)
router.post('/', [authMiddleware.verifyToken, authMiddleware.isAdmin], storeController.create);

// Get all stores (accessible to all authenticated users)
router.get('/', [authMiddleware.verifyToken], storeController.findAll);

// Get store by ID (accessible to all authenticated users)
router.get('/:id', [authMiddleware.verifyToken], storeController.findOne);

// Get store by owner ID (for store owner dashboard)
router.get('/owner/dashboard', [authMiddleware.verifyToken, authMiddleware.isStoreOwner], storeController.findByOwnerId);

// Delete a store (admin only)
router.delete('/:id', [authMiddleware.verifyToken, authMiddleware.isAdmin], storeController.delete);

module.exports = router;
