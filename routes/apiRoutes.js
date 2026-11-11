'use strict';

const express = require('express');
const courseController = require('../controllers/apiCourseController');
const studentController = require('../controllers/studentController');
const lessonController = require('../controllers/lessonController');

const router = express.Router();
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'LMS API',
    resources: ['/api/v1/courses', '/api/v1/students', '/api/v1/lessons'],
    documentation: 'API.md in the project root',
  });
});

router.get('/courses', asyncHandler(courseController.getCourses));
router.get('/courses/:id', asyncHandler(courseController.getCourseById));
router.post('/courses', asyncHandler(courseController.createCourse));
router.put('/courses/:id', asyncHandler(courseController.updateCourse));
router.patch('/courses/:id', asyncHandler(courseController.patchCourse));
router.delete('/courses/:id', asyncHandler(courseController.deleteCourse));

router.get('/students', studentController.getStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students', studentController.createStudent);
router.put('/students/:id', studentController.updateStudent);
router.patch('/students/:id', studentController.patchStudent);
router.delete('/students/:id', studentController.deleteStudent);

router.get('/lessons', asyncHandler(lessonController.getLessons));
router.get('/lessons/:id', asyncHandler(lessonController.getLessonById));
router.post('/lessons', asyncHandler(lessonController.createLesson));
router.put('/lessons/:id', asyncHandler(lessonController.updateLesson));
router.patch('/lessons/:id', asyncHandler(lessonController.patchLesson));
router.delete('/lessons/:id', asyncHandler(lessonController.deleteLesson));

module.exports = router;
