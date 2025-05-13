const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!'
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.role === 'admin') {
      next();
      return;
    }

    res.status(403).send({
      message: 'Require Admin Role!'
    });
  } catch (error) {
    res.status(500).send({
      message: 'Unable to validate user role!'
    });
  }
};

// Check if user is store owner
const isStoreOwner = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.role === 'store_owner') {
      next();
      return;
    }

    res.status(403).send({
      message: 'Require Store Owner Role!'
    });
  } catch (error) {
    res.status(500).send({
      message: 'Unable to validate user role!'
    });
  }
};

const authMiddleware = {
  verifyToken,
  isAdmin,
  isStoreOwner
};

module.exports = authMiddleware;
