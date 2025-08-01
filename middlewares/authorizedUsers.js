const jwtLib = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyAuth = async (req, res, next) => {
    try {
        const tokenHeader = req.headers.authorization;

        if (!tokenHeader) {
            return res.status(403).json({
                success: false,
                message: "Authorization token missing",
            });
        }

        const extractedToken = tokenHeader.split(" ")[1];

        if (!extractedToken) {
            return res.status(400).json({
                success: false,
                message: "Token not provided",
            });
        }

        const decodedPayload = jwtLib.verify(extractedToken, process.env.JWT_SECRET);


        const foundUser = await User.findById(decodedPayload._id);

        if (!foundUser) {
            return res.status(401).json({
                success: false,
                message: "User does not exist",
            });
        }

        req.user = foundUser;
        return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to authenticate user",
        });
    }
};

exports.checkAdminRole = (req, res, next) => {
    if (req.user?.isAdmin) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Forbidden: Admins only",
    });
};
