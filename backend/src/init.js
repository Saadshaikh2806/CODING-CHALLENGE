const dotenv = require('dotenv');
dotenv.config();

const initDb = require('./config/init-db');

// Initialize database
initDb()
  .then(() => {
    console.log('Database initialization completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
