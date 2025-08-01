const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const validateUser = require('../middlewares/validateUser');

// Register route
router.post('/register', validateUser, userController.signUp);

// Login route
router.post('/login', validateUser, userController.signIn);

module.exports = router;
