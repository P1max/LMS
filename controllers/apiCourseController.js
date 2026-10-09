'use strict';

const courseModel = require('../models/courseModel');
const lessonModel = require('../models/lessonModel');
const { parseId, validatePayload } = require('../utils/validation');

const courseSchema = {
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  teacher: { type: 'string', required: true },
  durationHours: { type: 'positiveNumber', required: true },
  status: { type: 'string', values: ['draft', 'published', 'archived'] },
};

function getCourses(req, res) {
  const { status, search } = req.query;
  if (status !== undefined && !courseSchema.status.values.includes(status)) {
    return res.status(400).json({ error: 'Invalid course status filter' });
  }
  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ error: 'Search must be a string' });
  }

  const courses = courseModel.getAll({ status, search });
  return res.status(200).json({ count: courses.length, data: courses });
}

function getCourseById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const course = courseModel.getById(id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  return res.status(200).json({ data: course });
}

function createCourse(req, res) {
  const validationError = validatePayload(req.body, courseSchema, {
    requireAll: true,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const course = courseModel.create(req.body);
  return res.status(201).location(`/api/v1/courses/${course.id}`).json({ data: course });
}

function updateCourse(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const validationError = validatePayload(req.body, courseSchema, {
    requireAll: true,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const course = courseModel.update(id, req.body);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  return res.status(200).json({ data: course });
}

function patchCourse(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const validationError = validatePayload(req.body, courseSchema);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const course = courseModel.patch(id, req.body);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  return res.status(200).json({ data: course });
}

function deleteCourse(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  if (!courseModel.getById(id)) {
    return res.status(404).json({ error: 'Course not found' });
  }
  if (lessonModel.hasForCourse(id)) {
    return res.status(409).json({ error: 'Course has lessons and cannot be deleted' });
  }

  courseModel.remove(id);
  return res.status(204).send();
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  patchCourse,
  deleteCourse,
};
