const express = require("express");
const userRoutes = express.Router();
const User = require("../models/User");
const { signUp, signIn } = require("../controllers/userController");
const jwtAuth = require("../middlewares/jwtAuth");

// REGISTER and LOGIN routes
userRoutes.post("/register", signUp);
userRoutes.post("/login", signIn);

// GET all users
userRoutes.get("/all", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// DELETE user by ID
userRoutes.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// GET current user (profile)
userRoutes.get("/me", jwtAuth, async (req, res) => {
  try {
    // req.user is set by jwtAuth middleware
    const user = await User.findOne({ userId: req.user.userId }, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

module.exports = userRoutes;
