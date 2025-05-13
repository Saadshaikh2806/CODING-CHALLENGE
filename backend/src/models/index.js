const dbConfig = require('../config/db.config');
const Sequelize = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

// Initialize db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model')(sequelize, Sequelize);
db.store = require('./store.model')(sequelize, Sequelize);
db.rating = require('./rating.model')(sequelize, Sequelize);

// Define relationships
db.user.hasMany(db.rating, { as: 'ratings' });
db.rating.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'user'
});

db.store.hasMany(db.rating, { as: 'ratings' });
db.rating.belongsTo(db.store, {
  foreignKey: 'storeId',
  as: 'store'
});

// Store owner relationship
db.user.hasOne(db.store, { as: 'ownedStore' });
db.store.belongsTo(db.user, {
  foreignKey: 'ownerId',
  as: 'owner'
});

module.exports = db;
