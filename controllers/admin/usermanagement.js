const User = require("../../models/User");
const bcryptjs = require("bcrypt");
const { v4: generateUUID } = require("uuid");

// Register new user
exports.registerUser = async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({
            success: false,
            message: "Required fields are missing",
        });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const encryptedPassword = await bcryptjs.hash(password, 10);

        const userToCreate = new User({
            userId: generateUUID(),
            email,
            firstName,
            lastName,
            password: encryptedPassword,
        });

        await userToCreate.save();

        return res.status(201).json({
            success: true,
            message: "User has been registered successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Fetch all users
exports.fetchAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({});
        return res.status(200).json({
            success: true,
            message: "Users retrieved",
            data: allUsers,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve users",
        });
    }
};

// Fetch single user
exports.fetchSingleUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const foundUser = await User.findById(userId);
        return res.status(200).json({
            success: true,
            message: "User found",
            data: foundUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving user",
        });
    }
};

// Update user by ID
exports.modifyUser = async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName } = req.body;

    try {
        await User.updateOne(
            { _id: userId },
            { $set: { firstName, lastName } }
        );
        return res.status(200).json({
            success: true,
            message: "User info updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update user",
        });
    }
};

// Delete user by ID
exports.removeUser = async (req, res) => {
    const userId = req.params.id;

    try {
        await User.deleteOne({ _id: userId });
        return res.status(200).json({
            success: true,
            message: "User has been deleted",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
        });
    }
};
