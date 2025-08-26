const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controller/adminController');
const adminController = require('../controller/adminController');

router.post('/admin-register', adminController.registerAdmin);
router.post('/admin-login', adminController.loginAdmin);
router.post('/admin-forgot-password', adminController.forgotPasswordAdmin);
router.patch('/admin-edit-profile/:adminId', adminController.editAdmin);
router.get('/get-admin-by-id/:adminId', adminController.getAdminById);

module.exports = router;
