const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Potential passwords to check
const possiblePasswords = [
  'Admin@123', 
  'User@123', 
  'Owner@123', 
  'Mobile001@', 
  'MOBILE001@'
];

// Open the database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
  
  // Get all users
  db.all(`SELECT id, name, email, password, role FROM users`, [], async (err, rows) => {
    if (err) {
      console.error('Error executing query', err.message);
      return;
    }
    
    console.log(`Found ${rows.length} users to check.`);
    console.log('CHECKING PASSWORDS:');
    console.log('===================');
    
    // Check each user's password against possible passwords
    for (const user of rows) {
      console.log(`\nUser #${user.id}: ${user.name} (${user.email})`);
      console.log(`Role: ${user.role}`);
      
      let foundMatch = false;
      for (const testPassword of possiblePasswords) {
        try {
          console.log(`Testing password: "${testPassword}"`);
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log(`✓ PASSWORD MATCH: "${testPassword}"`);
            foundMatch = true;
            break;
          } else {
            console.log(`✗ Password "${testPassword}" does not match`);
          }
        } catch (error) {
          console.error(`Error comparing password for ${user.email}:`, error.message);
        }
      }
      
      if (!foundMatch) {
        console.log('✗ NO PASSWORD MATCH FOUND among the test candidates');
      }
      
      console.log('-----------------');
    }
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database', err.message);
      } else {
        console.log('\nDatabase connection closed.');
      }
    });
  });
}); 