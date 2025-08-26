const express = require('express');
const router = express.Router();
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

router.use('/admins', adminRoutes);
router.use('/users', userRoutes);

module.exports = router;