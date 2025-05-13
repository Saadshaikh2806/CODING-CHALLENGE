const db = require('../models');
const User = db.user;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
exports.signup = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.address) {
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
      role: req.body.role || 'user'
    });

    res.status(201).send({
      message: 'User registered successfully!',
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

// Login user
exports.signin = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.status(404).send({
        message: 'User not found!'
      });
    }

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({
        message: 'Invalid password!'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred during login.'
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    // Validate request
    if (!req.body.currentPassword || !req.body.newPassword) {
      return res.status(400).send({
        message: 'Current password and new password are required!'
      });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(req.body.newPassword)) {
      return res.status(400).send({
        message: 'Password must be 8-16 characters and include at least one uppercase letter and one special character!'
      });
    }

    // Find user
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        message: 'User not found!'
      });
    }

    // Validate current password
    const validPassword = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).send({
        message: 'Current password is incorrect!'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    // Update password
    await user.update({
      password: hashedPassword
    });

    res.status(200).send({
      message: 'Password updated successfully!'
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while updating password.'
    });
  }
};
