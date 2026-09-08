'use strict';

const express = require('express');
const { getProfile, getUsers } = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.get('/admin/users', authenticate, isAdmin, getUsers);

module.exports = router;
