const db = require('../models');
const Store = db.store;
const User = db.user;
const Rating = db.rating;
const { Op } = require('sequelize');

// Create a new store (admin only)
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.email || !req.body.address) {
      return res.status(400).send({
        message: 'Name, email, and address are required!'
      });
    }

    // Validate address length
    if (req.body.address.length > 400) {
      return res.status(400).send({
        message: 'Address must not exceed 400 characters!'
      });
    }

    // Check if owner exists if ownerId is provided
    if (req.body.ownerId) {
      const owner = await User.findByPk(req.body.ownerId);
      if (!owner) {
        return res.status(404).send({
          message: 'Owner not found!'
        });
      }

      // Update owner role to store_owner
      await owner.update({ role: 'store_owner' });
    }

    // Create store
    const store = await Store.create({
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      ownerId: req.body.ownerId || null
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('store:created', {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId
      });
    }

    res.status(201).send({
      message: 'Store created successfully!',
      store
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while creating the store.'
    });
  }
};

// Get all stores
exports.findAll = async (req, res) => {
  try {
    const { name, address } = req.query;
    let condition = {};

    // Apply filters if provided
    if (name) condition.name = { [Op.iLike]: `%${name}%` };
    if (address) condition.address = { [Op.iLike]: `%${address}%` };

    const stores = await Store.findAll({
      where: condition,
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'value', 'userId']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Format response and calculate average rating
    const formattedStores = stores.map(store => {
      const ratings = store.ratings || [];
      let averageRating = 0;
      
      if (ratings.length > 0) {
        const sum = ratings.reduce((total, rating) => total + rating.value, 0);
        averageRating = (sum / ratings.length).toFixed(1);
      }

      // Find user's rating if user is authenticated
      let userRating = null;
      if (req.userId && ratings.length > 0) {
        const userRatingObj = ratings.find(rating => rating.userId === req.userId);
        if (userRatingObj) {
          userRating = userRatingObj.value;
        }
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        owner: store.owner ? {
          id: store.owner.id,
          name: store.owner.name,
          email: store.owner.email
        } : null,
        averageRating,
        userRating,
        ratingsCount: ratings.length
      };
    });

    res.status(200).send(formattedStores);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving stores.'
    });
  }
};

// Get store by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const store = await Store.findByPk(id, {
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'value', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!store) {
      return res.status(404).send({
        message: `Store with id ${id} not found.`
      });
    }

    // Calculate average rating
    const ratings = store.ratings || [];
    let averageRating = 0;
    
    if (ratings.length > 0) {
      const sum = ratings.reduce((total, rating) => total + rating.value, 0);
      averageRating = (sum / ratings.length).toFixed(1);
    }

    // Find user's rating if user is authenticated
    let userRating = null;
    if (req.userId && ratings.length > 0) {
      const userRatingObj = ratings.find(rating => rating.userId === req.userId);
      if (userRatingObj) {
        userRating = userRatingObj.value;
      }
    }

    // Format response
    const storeData = {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      owner: store.owner ? {
        id: store.owner.id,
        name: store.owner.name,
        email: store.owner.email
      } : null,
      averageRating,
      userRating,
      ratings: store.ratings.map(rating => ({
        id: rating.id,
        value: rating.value,
        user: {
          id: rating.user.id,
          name: rating.user.name,
          email: rating.user.email
        }
      }))
    };

    res.status(200).send(storeData);
  } catch (error) {
    res.status(500).send({
      message: error.message || `Error retrieving store with id ${req.params.id}`
    });
  }
};

// Get store by owner ID (for store owner dashboard)
exports.findByOwnerId = async (req, res) => {
  try {
    const ownerId = req.userId;
    
    const store = await Store.findOne({
      where: { ownerId },
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'value', 'userId', 'createdAt'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!store) {
      return res.status(404).send({
        message: 'You do not own any store.'
      });
    }

    // Calculate average rating
    const ratings = store.ratings || [];
    let averageRating = 0;
    
    if (ratings.length > 0) {
      const sum = ratings.reduce((total, rating) => total + rating.value, 0);
      averageRating = (sum / ratings.length).toFixed(1);
    }

    // Format response
    const storeData = {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating,
      ratingsCount: ratings.length,
      ratings: store.ratings.map(rating => ({
        id: rating.id,
        value: rating.value,
        createdAt: rating.createdAt,
        user: {
          id: rating.user.id,
          name: rating.user.name,
          email: rating.user.email
        }
      }))
    };

    res.status(200).send(storeData);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error retrieving store information.'
    });
  }
};

// Delete a store
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if store exists
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).send({
        message: `Store with id ${id} not found.`
      });
    }
    
    // Delete related ratings
    await Rating.destroy({
      where: { storeId: id }
    });
    
    // Delete the store
    await store.destroy();
    
    res.status(200).send({
      message: 'Store deleted successfully!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || `Error deleting store with id ${req.params.id}`
    });
  }
};

// Update store by ID (admin only)
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if store exists
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).send({
        message: `Store with id ${id} not found.`
      });
    }
    
    // Update store
    await store.update({
      name: req.body.name || store.name,
      email: req.body.email || store.email,
      address: req.body.address || store.address,
      ownerId: req.body.ownerId || store.ownerId,
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('store:updated', {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId
      });
      
      // Emit specific store update event
      io.emit(`store:${id}:updated`, {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId
      });
    }
    
    res.status(200).send({
      message: 'Store updated successfully!',
      store
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while updating the store.'
    });
  }
};
