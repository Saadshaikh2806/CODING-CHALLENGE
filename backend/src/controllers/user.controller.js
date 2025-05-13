const db = require('../models');
const User = db.user;
const Store = db.store;
const Rating = db.rating;
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// Get all users (admin only)
exports.findAll = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    let condition = {};

    // Apply filters if provided
    if (name) condition.name = { [Op.iLike]: `%${name}%` };
    if (email) condition.email = { [Op.iLike]: `%${email}%` };
    if (address) condition.address = { [Op.iLike]: `%${address}%` };
    if (role) condition.role = role;

    const users = await User.findAll({
      where: condition,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'ownedStore',
          attributes: ['id', 'name', 'email', 'address'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['value']
            }
          ]
        }
      ]
    });

    // Calculate average rating for store owners
    const formattedUsers = users.map(user => {
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      };

      // Add store rating for store owners
      if (user.role === 'store_owner' && user.ownedStore) {
        const ratings = user.ownedStore.ratings || [];
        let averageRating = 0;
        
        if (ratings.length > 0) {
          const sum = ratings.reduce((total, rating) => total + rating.value, 0);
          averageRating = (sum / ratings.length).toFixed(1);
        }
        
        userData.storeId = user.ownedStore.id;
        userData.storeName = user.ownedStore.name;
        userData.rating = averageRating;
      }

      return userData;
    });

    res.status(200).send(formattedUsers);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving users.'
    });
  }
};

// Get user by ID (admin only)
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'ownedStore',
          attributes: ['id', 'name', 'email', 'address'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['value']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).send({
        message: `User with id ${id} not found.`
      });
    }

    // Format response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    // Add store rating for store owners
    if (user.role === 'store_owner' && user.ownedStore) {
      const ratings = user.ownedStore.ratings || [];
      let averageRating = 0;
      
      if (ratings.length > 0) {
        const sum = ratings.reduce((total, rating) => total + rating.value, 0);
        averageRating = (sum / ratings.length).toFixed(1);
      }
      
      userData.storeId = user.ownedStore.id;
      userData.storeName = user.ownedStore.name;
      userData.rating = averageRating;
    }

    res.status(200).send(userData);
  } catch (error) {
    res.status(500).send({
      message: error.message || `Error retrieving user with id ${req.params.id}`
    });
  }
};

// Create a new user (admin only)
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.address || !req.body.role) {
      return res.status(400).send({
        message: 'All fields are required!'
      });
    }

    // Validate name length
    if (req.body.name.length < 20 || req.body.name.length > 60) {
      return res.status(400).send({
        message: 'Name must be between 20 and 60 characters!'
      });
    }

    // Validate address length
    if (req.body.address.length > 400) {
      return res.status(400).send({
        message: 'Address must not exceed 400 characters!'
      });
    }

    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).send({
        message: 'Password must be 8-16 characters and include at least one uppercase letter and one special character!'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      address: req.body.address,
      role: req.body.role
    });

    res.status(201).send({
      message: 'User created successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({
        message: 'Email is already in use!'
      });
    }
    res.status(500).send({
      message: error.message || 'Some error occurred while creating the user.'
    });
  }
};

// Get dashboard statistics (admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.status(200).send({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving dashboard statistics.'
    });
  }
};

// Delete a user (admin only)
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({
        message: `User with id ${id} not found.`
      });
    }

    // Check if user is an admin
    if (user.role === 'admin') {
      return res.status(403).send({
        message: 'Admin users cannot be deleted.'
      });
    }
    
    // Check if user owns a store
    if (user.role === 'store_owner') {
      const store = await Store.findOne({ where: { ownerId: id } });
      if (store) {
        // Delete store ratings
        await Rating.destroy({ where: { storeId: store.id } });
        // Delete the store
        await store.destroy();
      }
    }
    
    // Delete user ratings
    await Rating.destroy({ where: { userId: id } });
    
    // Delete the user
    await user.destroy();
    
    res.status(200).send({
      message: 'User deleted successfully!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || `Error deleting user with id ${req.params.id}`
    });
  }
};
