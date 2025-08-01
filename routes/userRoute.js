const express = require("express");
const userRoutes = express.Router();
const User = require("../models/User");
const { signUp, signIn, getCurrentUser, updateProfile, updatePassword } = require("../controllers/userController");
const jwtAuth = require("../middlewares/jwtAuth");
const upload = require("../middlewares/imageUploader");

// ✅ AUTH routes
userRoutes.post("/register", signUp);
userRoutes.post("/login", signIn);

// 👤 PROFILE routes (protected)
userRoutes.get("/me", jwtAuth, getCurrentUser);
userRoutes.put("/me", jwtAuth, updateProfile);
userRoutes.put("/me/password", jwtAuth, updatePassword);
userRoutes.post("/me/avatar", jwtAuth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.avatar = req.file ? req.file.path : null;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: { avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Get all users (for admin)
userRoutes.get("/all", jwtAuth, async (req, res) => {
  try {
    // Only allow admins to access all users
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource"
      });
    }
    
    const users = await User.find({}, '-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: err.message
    });
  }
});

// ✅ GET all users with pagination and search
userRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query, '-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch users", 
      error: err.message 
    });
  }
});

// ✅ DELETE user by ID
userRoutes.delete("/:id", jwtAuth, async (req, res) => {
  try {
    // Only allow admins or the user themselves to delete
    if (!req.user.isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to perform this action"
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: err.message
    });
  }
});

// ✅ GET current user (profile)
userRoutes.get("/me", jwtAuth, async (req, res) => {
  try {
    // req.user is set by jwtAuth middleware
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: err.message
    });
  }
});

module.exports = userRoutes;
