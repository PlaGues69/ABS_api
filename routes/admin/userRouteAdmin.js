const express = require("express");
const userRoutes = express.Router();

const {
    registerUser,
    fetchAllUsers,
    fetchSingleUser,
    modifyUser,
    removeUser,
} = require("../../controllers/admin/usermanagement");

const {
    verifyAuth,
    checkAdminRole,
} = require("../../middlewares/authorizedUsers");

//  Create a user (admin only)
userRoutes.post("/", verifyAuth, checkAdminRole, registerUser);

// Get all users (admin only)
userRoutes.get("/", verifyAuth, checkAdminRole, fetchAllUsers);

// ✅ Get a specific user (admin only)
userRoutes.get("/:id", verifyAuth, checkAdminRole, fetchSingleUser);

// ✅ Update a user (admin only)
userRoutes.put("/:id", verifyAuth, checkAdminRole, modifyUser);

// ✅ Delete a user (admin only)
userRoutes.delete("/:id", verifyAuth, checkAdminRole, removeUser);

module.exports = userRoutes;
