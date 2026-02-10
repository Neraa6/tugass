// Import express dan controller
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// Route untuk registrasi user
router.post('/register', registerUser);

// Route untuk login user
router.post('/login', loginUser);

module.exports = router;