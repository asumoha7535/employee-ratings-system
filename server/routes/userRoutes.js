const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Register a new user
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.get('/get-all-users', userController.getAllUsers);
router.get('/get-user-by-id/:id', userController.getUserById);
router.post('/update-by-user-id/:id', userController.updateUserById);
router.post('/change-password/:id', userController.ChangePassword);
module.exports = router;
