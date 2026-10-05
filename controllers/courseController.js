const { Op } = require('sequelize');
const { Course } = require('../models');

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

  if (
    body.startDate !== undefined &&
    body.startDate !== null &&
    Number.isNaN(Date.parse(body.startDate))
  ) {
    return 'Field "startDate" must contain a valid date';
  }

  return null;
}

function getCourseData(body) {
  const data = {
    title: body.title.trim(),
    description: body.description.trim(),
    teacher: body.teacher.trim(),
    durationHours: body.durationHours,
    status: body.status || 'draft',
  };

  if (body.startDate !== undefined) {
    data.startDate = body.startDate === null ? null : new Date(body.startDate);
  }

  return data;
}

async function getCourses(req, res, next) {
  try {
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.search) {
      const search = `%${req.query.search}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: search } },
        { description: { [Op.iLike]: search } },
        { teacher: { [Op.iLike]: search } },
      ];
    }

    const courses = await Course.findAll({
      where,
      order: [['id', 'ASC']],
    });

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
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function createCourse(req, res, next) {
  const validationError = validateCourse(req.body, { requireAllFields: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const course = await Course.create(getCourseData(req.body));
    return res.status(201).location(`/courses/${course.id}`).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function updateCourse(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Course ID must be a positive integer' });
  }

  const validationError = validateCourse(req.body, { requireAllFields: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const [updatedCount, updatedCourses] = await Course.update(getCourseData(req.body), {
      where: { id },
      returning: true,
    });

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json({ data: updatedCourses[0] });
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
    const deletedCount = await Course.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

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
  deleteCourse,
};
