const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Admin user details with a different email
const adminUser = {
    email: 'admin2@example.com',  // Changed email
    firstName: 'Admin',
    lastName: 'User',
    password: 'Admin@123',
    isAdmin: true
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abs_online')
    .then(() => {
        console.log('Connected to MongoDB');
        createAdmin();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);

        // Create new admin user
        const newAdmin = new User({
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            password: hashedPassword,
            isAdmin: true,
            userId: require('uuid').v4()
        });

        await newAdmin.save();
        console.log('\n✅ Admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password:', adminUser.password);
        console.log('\nYou can now use these credentials to log in.');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
}
