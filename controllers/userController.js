const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwtLib = require("jsonwebtoken");
const { v4: generateUuid } = require("uuid");
const fs = require('fs');
const path = require('path');

// REGISTER controller
exports.signUp = async (req, res) => {
  const { email, firstName, lastName, password, isAdmin } = req.body;

  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const encryptedPassword = await bcryptjs.hash(password, 10);

    const userRecord = new User({
      userId: generateUuid(),
      email,
      firstName,
      lastName,
      password: encryptedPassword,
      isAdmin: !!isAdmin,
    });

    await userRecord.save();

    const token = jwtLib.sign(
      {
        _id: userRecord._id,
        isAdmin: userRecord.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User successfully created",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// LOGIN controller
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const isMatch = await bcryptjs.compare(password, foundUser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const token = jwtLib.sign(
      {
        _id: foundUser._id,
        isAdmin: foundUser.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        userId: foundUser.userId,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const updates = {};
    
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};
