const db = require('../models');
const bcrypt = require('bcrypt');

// Models
const User = db.user;
const Store = db.store;
const Rating = db.rating;

// Initialize database with sample data
const initDb = async () => {
  try {
    // Force sync all models (drops tables if they exist)
    await db.sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'System Administrator User Account',
      email: 'admin@example.com',
      password: adminPassword,
      address: '123 Admin Street, Admin City, 12345',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create normal users
    const userPassword = await bcrypt.hash('User@123', 10);
    const users = await User.bulkCreate([
      {
        name: 'Normal User Account Number One',
        email: 'user1@example.com',
        password: userPassword,
        address: '456 User Street, User City, 12345',
        role: 'user'
      },
      {
        name: 'Normal User Account Number Two',
        email: 'user2@example.com',
        password: userPassword,
        address: '789 User Avenue, User City, 12345',
        role: 'user'
      }
    ]);
    console.log('Normal users created');

    // Create store owners
    const ownerPassword = await bcrypt.hash('Owner@123', 10);
    const storeOwners = await User.bulkCreate([
      {
        name: 'Store Owner Account Number One',
        email: 'owner1@example.com',
        password: ownerPassword,
        address: '101 Owner Street, Owner City, 12345',
        role: 'store_owner'
      },
      {
        name: 'Store Owner Account Number Two',
        email: 'owner2@example.com',
        password: ownerPassword,
        address: '202 Owner Avenue, Owner City, 12345',
        role: 'store_owner'
      }
    ]);
    console.log('Store owners created');

    // Create stores
    const stores = await Store.bulkCreate([
      {
        name: 'Grocery Store',
        email: 'grocery@example.com',
        address: '123 Grocery Street, Store City, 12345',
        ownerId: storeOwners[0].id
      },
      {
        name: 'Electronics Store',
        email: 'electronics@example.com',
        address: '456 Electronics Avenue, Store City, 12345',
        ownerId: storeOwners[1].id
      },
      {
        name: 'Clothing Store',
        email: 'clothing@example.com',
        address: '789 Fashion Boulevard, Store City, 12345',
        ownerId: null
      }
    ]);
    console.log('Stores created');

    // Create ratings
    await Rating.bulkCreate([
      {
        value: 4,
        userId: users[0].id,
        storeId: stores[0].id
      },
      {
        value: 5,
        userId: users[1].id,
        storeId: stores[0].id
      },
      {
        value: 3,
        userId: users[0].id,
        storeId: stores[1].id
      },
      {
        value: 4,
        userId: users[1].id,
        storeId: stores[1].id
      }
    ]);
    console.log('Ratings created');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = initDb;
