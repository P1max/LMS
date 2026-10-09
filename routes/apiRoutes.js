'use strict';

const express = require('express');
const courseController = require('../controllers/apiCourseController');
const studentController = require('../controllers/studentController');
const lessonController = require('../controllers/lessonController');

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'LMS API',
    resources: ['/api/v1/courses', '/api/v1/students', '/api/v1/lessons'],
    documentation: 'API.md in the project root',
  });
});

router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourseById);
router.post('/courses', courseController.createCourse);
router.put('/courses/:id', courseController.updateCourse);
router.patch('/courses/:id', courseController.patchCourse);
router.delete('/courses/:id', courseController.deleteCourse);

router.get('/students', studentController.getStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students', studentController.createStudent);
router.put('/students/:id', studentController.updateStudent);
router.patch('/students/:id', studentController.patchStudent);
router.delete('/students/:id', studentController.deleteStudent);

router.get('/lessons', lessonController.getLessons);
router.get('/lessons/:id', lessonController.getLessonById);
router.post('/lessons', lessonController.createLesson);
router.put('/lessons/:id', lessonController.updateLesson);
router.patch('/lessons/:id', lessonController.patchLesson);
router.delete('/lessons/:id', lessonController.deleteLesson);

module.exports = router;
