'use strict';

const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
} = require('../controllers/courseController');
const { ensureMongoConnection } = require('../middleware');

const router = express.Router();

router.use(ensureMongoConnection);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.post('/:id/lessons', addLesson);
router.patch('/:id/lessons/:lessonId', updateLesson);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
