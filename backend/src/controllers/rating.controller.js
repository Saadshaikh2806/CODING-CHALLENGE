const db = require('../models');
const Rating = db.rating;
const Store = db.store;
const User = db.user;

// Submit a rating
exports.submitRating = async (req, res) => {
  try {
    // Validate request
    if (!req.body.storeId || !req.body.value) {
      return res.status(400).send({
        message: 'Store ID and rating value are required!'
      });
    }

    // Validate rating value
    const value = parseInt(req.body.value);
    if (isNaN(value) || value < 1 || value > 5) {
      return res.status(400).send({
        message: 'Rating value must be between 1 and 5!'
      });
    }

    // Check if store exists
    const store = await Store.findByPk(req.body.storeId);
    if (!store) {
      return res.status(404).send({
        message: 'Store not found!'
      });
    }

    // Check if user has already rated this store
    const existingRating = await Rating.findOne({
      where: {
        userId: req.userId,
        storeId: req.body.storeId
      }
    });

    const io = req.app.get('io');
    
    if (existingRating) {
      // Update existing rating
      await existingRating.update({
        value: value
      });

      // Emit socket events for real-time update
      if (io) {
        io.emit('rating:updated', {
          storeId: req.body.storeId,
          userId: req.userId,
          value: value
        });
        
        // Emit to specific store room
        io.to(`store:${req.body.storeId}`).emit('rating:store:updated', {
          storeId: req.body.storeId,
          userId: req.userId,
          value: value
        });
        
        // Also emit specific event for this store
        io.emit(`rating:store:${req.body.storeId}:updated`, {
          storeId: req.body.storeId,
          userId: req.userId,
          value: value
        });
      }

      return res.status(200).send({
        message: 'Rating updated successfully!',
        rating: existingRating
      });
    }

    // Create new rating
    const rating = await Rating.create({
      value: value,
      userId: req.userId,
      storeId: req.body.storeId
    });

    // Emit socket events for real-time update
    if (io) {
      io.emit('rating:created', {
        storeId: req.body.storeId,
        userId: req.userId,
        value: value
      });
      
      // Emit to specific store room
      io.to(`store:${req.body.storeId}`).emit('rating:store:updated', {
        storeId: req.body.storeId,
        userId: req.userId,
        value: value
      });
      
      // Also emit specific event for this store
      io.emit(`rating:store:${req.body.storeId}:updated`, {
        storeId: req.body.storeId,
        userId: req.userId,
        value: value
      });
    }

    res.status(201).send({
      message: 'Rating submitted successfully!',
      rating
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while submitting the rating.'
    });
  }
};

// Get user's rating for a store
exports.getUserRating = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    
    const rating = await Rating.findOne({
      where: {
        userId: req.userId,
        storeId: storeId
      }
    });

    if (!rating) {
      return res.status(404).send({
        message: 'Rating not found.'
      });
    }

    res.status(200).send(rating);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error retrieving rating.'
    });
  }
};

// Get all ratings (admin only)
exports.findAll = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address']
        }
      ]
    });

    res.status(200).send(ratings);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving ratings.'
    });
  }
};
