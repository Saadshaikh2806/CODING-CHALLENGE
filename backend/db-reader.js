const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
  
  // Display all users one by one to ensure we see all output
  db.each(`SELECT id, name, email, password, role FROM users`, (err, row) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return;
    }
    
    console.log('\nUSER RECORD:');
    console.log('==================');
    console.log(`ID: ${row.id}`);
    console.log(`Name: ${row.name}`);
    console.log(`Email: ${row.email}`);
    console.log(`Password: ${row.password}`);
    console.log(`Role: ${row.role}`);
    console.log('==================');
  }, (err, count) => {
    if (err) {
      console.error('Error completing query:', err.message);
    } else {
      console.log(`\nTotal users found: ${count}`);
      
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  });
}); 