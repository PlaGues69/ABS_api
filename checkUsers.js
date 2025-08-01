const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/abs_online');
    console.log('✅ Connected to MongoDB');

    // Get the users collection
    const User = require('./models/User');
    const users = await User.find({});

    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('\nUsers in the database:');
      users.forEach(user => {
        console.log('-------------------');
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
        console.log(`User ID: ${user.userId}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkUsers();
