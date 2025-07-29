const User = require("../models/User");
const bcryptjs = require("bcrypt");
const jwtLib = require("jsonwebtoken");
const { v4: generateUuid } = require("uuid"); // 👈 Make sure this is here

// ✅ REGISTER controller
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
      userId: generateUuid(), // Always auto-generate userId
      email,
      firstName,
      lastName,
      password: encryptedPassword,
      isAdmin: !!isAdmin,
    });

    await userRecord.save();

    const token = jwtLib.sign(
      { userId: userRecord.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User successfully created",
      token, // ✅ include token in response
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ✅ LOGIN controller
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
      { userId: foundUser.userId },
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
    });
  }
};
