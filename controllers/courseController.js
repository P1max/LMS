'use strict';

const courseModel = require('../models/courseModel');

const ALLOWED_STATUSES = ['draft', 'published', 'archived'];
const REQUIRED_FIELDS = ['title', 'description', 'teacher', 'durationHours'];

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateCourse(body, { requireAllFields }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }

  if (requireAllFields) {
    const missingField = REQUIRED_FIELDS.find(
      (field) => body[field] === undefined || body[field] === null,
    );

    if (missingField) {
      return `Field "${missingField}" is required`;
    }
  }

  for (const field of ['title', 'description', 'teacher']) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== 'string' || body[field].trim() === '')
    ) {
      return `Field "${field}" must be a non-empty string`;
    }
  }

  if (
    body.durationHours !== undefined &&
    (typeof body.durationHours !== 'number' || body.durationHours <= 0)
  ) {
    return 'Field "durationHours" must be a positive number';
  }

  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status)) {
    return `Field "status" must be one of: ${ALLOWED_STATUSES.join(', ')}`;
  }

  return null;
}

function getCourses(req, res) {
  const courses = courseModel.getAll({
    status: req.query.status,
    search: req.query.search,
  });

  res.status(200).json({ count: courses.length, data: courses });
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
  const validationError = validateCourse(req.body, { requireAllFields: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const course = courseModel.create(req.body);
  return res.status(201).location(`/courses/${course.id}`).json({ data: course });
}

function updateCourse(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const validationError = validateCourse(req.body, { requireAllFields: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const course = courseModel.update(id, req.body);
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

  const deleted = courseModel.remove(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Course not found' });
  }

  return res.status(204).send();
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
