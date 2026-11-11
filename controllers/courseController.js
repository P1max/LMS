'use strict';

const courseModel = require('../models/courseModel');
const COURSE_CONSTRAINTS = require('../config/courseConstraints.json');
const validateSearchQuery = require('../utils/searchQuery');
const validateStatusQuery = require('../utils/validateStatusQuery');

const REQUIRED_FIELDS = ['title', 'description', 'teacher', 'durationHours'];

function parseId(rawId) {
  if (typeof rawId !== 'string' || rawId.length > 16 || !/^\d+$/.test(rawId)) {
    return null;
  }

  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
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

    if (
      body[field] !== undefined &&
      body[field].length > COURSE_CONSTRAINTS.textFields[field].maxLength
    ) {
      return `Field "${field}" must not exceed ${COURSE_CONSTRAINTS.textFields[field].maxLength} characters`;
    }
  }

  if (
    body.durationHours !== undefined &&
    (typeof body.durationHours !== 'number' ||
      !Number.isFinite(body.durationHours) ||
      body.durationHours < COURSE_CONSTRAINTS.durationHours.minimum ||
      body.durationHours > COURSE_CONSTRAINTS.durationHours.maximum)
  ) {
    return 'Field "durationHours" must be between ' + COURSE_CONSTRAINTS.durationHours.minimum + ' and ' + COURSE_CONSTRAINTS.durationHours.maximum;
  }

  if (
    body.status !== undefined &&
    !COURSE_CONSTRAINTS.allowedStatuses.includes(body.status)
  ) {
    return `Field "status" must be one of: ${COURSE_CONSTRAINTS.allowedStatuses.join(', ')}`;
  }

  return null;
}

async function getCourses(req, res) {
  const { error, search } = validateSearchQuery(
    req.query.search,
    COURSE_CONSTRAINTS.search.maxLength,
  );
  const { error: statusError, status } = validateStatusQuery(
    req.query.status,
    COURSE_CONSTRAINTS.allowedStatuses,
  );

  if (error || statusError) {
    return res.status(400).json({ error: error || statusError });
  }

  const courses = await courseModel.getAll({
    status,
    search,
  });

  res.status(200).json({ count: courses.length, data: courses });
}

async function getCourseById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const course = await courseModel.getById(id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  return res.status(200).json({ data: course });
}

async function createCourse(req, res) {
  const validationError = validateCourse(req.body, { requireAllFields: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const course = await courseModel.create(req.body);
  return res.status(201).location(`/courses/${course.id}`).json({ data: course });
}

async function updateCourse(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const validationError = validateCourse(req.body, { requireAllFields: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const course = await courseModel.update(id, req.body);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  return res.status(200).json({ data: course });
}

async function deleteCourse(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const deleted = await courseModel.remove(id);
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
