'use strict';

const courseModel = require('../models/courseModel');
const lessonModel = require('../models/lessonModel');
const { parseId, validatePayload } = require('../utils/validation');

const lessonSchema = {
  courseId: { type: 'positiveInteger', required: true },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  orderNumber: { type: 'positiveInteger', required: true },
  durationMinutes: { type: 'positiveInteger', required: true },
};

function validateCourseReference(courseId) {
  return courseModel.getById(courseId)
    ? null
    : `Course with ID ${courseId} not found`;
}

function getLessons(req, res) {
  const { courseId, search } = req.query;
  let parsedCourseId;

  if (courseId !== undefined) {
    parsedCourseId = parseId(courseId);
    if (!parsedCourseId) {
      return res.status(400).json({ error: 'courseId must be a positive integer' });
    }
  }
  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ error: 'Search must be a string' });
  }

  const lessons = lessonModel.getAll({ courseId: parsedCourseId, search });
  return res.status(200).json({ count: lessons.length, data: lessons });
}

function getLessonById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Lesson ID must be a positive integer' });
  }

  const lesson = lessonModel.getById(id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  return res.status(200).json({ data: lesson });
}

function createLesson(req, res) {
  const validationError = validatePayload(req.body, lessonSchema, {
    requireAll: true,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const referenceError = validateCourseReference(req.body.courseId);
  if (referenceError) {
    return res.status(400).json({ error: referenceError });
  }

  const lesson = lessonModel.create(req.body);
  return res.status(201).location(`/api/v1/lessons/${lesson.id}`).json({ data: lesson });
}

function updateLesson(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Lesson ID must be a positive integer' });
  }

  const validationError = validatePayload(req.body, lessonSchema, {
    requireAll: true,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const referenceError = validateCourseReference(req.body.courseId);
  if (referenceError) {
    return res.status(400).json({ error: referenceError });
  }

  const lesson = lessonModel.update(id, req.body);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  return res.status(200).json({ data: lesson });
}

function patchLesson(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Lesson ID must be a positive integer' });
  }

  const validationError = validatePayload(req.body, lessonSchema);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const currentLesson = lessonModel.getById(id);
  if (!currentLesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const courseId = req.body.courseId || currentLesson.courseId;
  const referenceError = validateCourseReference(courseId);
  if (referenceError) {
    return res.status(400).json({ error: referenceError });
  }

  const lesson = lessonModel.patch(id, req.body);
  return res.status(200).json({ data: lesson });
}

function deleteLesson(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Lesson ID must be a positive integer' });
  }

  if (!lessonModel.remove(id)) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  return res.status(204).send();
}

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  patchLesson,
  deleteLesson,
};
