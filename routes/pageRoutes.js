'use strict';

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  renderHome,
  renderCourse,
  renderAddForm,
  addCourse,
  renderLogin,
} = require('../controllers/pageController');

const router = express.Router();

router.get('/login', renderLogin);
router.get('/', authMiddleware, renderHome);
router.get('/item/:id', authMiddleware, renderCourse);
router.get('/add', authMiddleware, renderAddForm);
router.post('/add', authMiddleware, addCourse);

module.exports = router;
