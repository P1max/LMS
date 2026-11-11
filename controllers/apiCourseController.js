'use strict';

const courseModel = require('../models/courseModel');
const lessonModel = require('../models/lessonModel');
const { parseId, validatePayload } = require('../utils/validation');

const courseSchema = {
  title: { type: 'string', required: true, maxLength: 30 },
  description: { type: 'string', required: true, maxLength: 50 },
  teacher: { type: 'string', required: true, maxLength: 25 },
  durationHours: { type: 'positiveNumber', required: true, minimum: 0, maximum: 10000 },
  status: { type: 'string', values: ['draft', 'published', 'archived'] },
};

async function getCourses(req, res, next) {
  const { status, search } = req.query;
  if (status !== undefined && !courseSchema.status.values.includes(status)) {
    return res.status(400).json({ error: 'Invalid course status filter' });
  }
  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ error: 'Search must be a string' });
  }
  if (typeof search === 'string' && search.length > 100) {
    return res.status(400).json({ error: 'Search must not exceed 100 characters' });
  }

  try {
    const courses = await courseModel.getAll({ status, search });
    return res.status(200).json({ count: courses.length, data: courses });
  } catch (error) {
    return next(error);
  }
}

async function getCourseById(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  try {
    const course = await courseModel.getById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function createCourse(req, res, next) {
  const validationError = validatePayload(req.body, courseSchema, {
    requireAll: true,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const course = await courseModel.create(req.body);
    return res.status(201).location(`/api/v1/courses/${course.id}`).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function updateCourse(req, res, next) {
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

  try {
    const course = await courseModel.update(id, req.body);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function patchCourse(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const validationError = validatePayload(req.body, courseSchema);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const course = await courseModel.patch(id, req.body);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function deleteCourse(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  try {
    if (!(await courseModel.getById(id))) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (lessonModel.hasForCourse(id)) {
      return res.status(409).json({ error: 'Course has lessons and cannot be deleted' });
    }

    await courseModel.remove(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  patchCourse,
  deleteCourse,
};
