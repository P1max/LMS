'use strict';

const MongoCourse = require('../models/course');

async function getCourses(req, res, next) {
  try {
    const courses = await MongoCourse.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: courses.length, data: courses });
  } catch (error) {
    return next(error);
  }
}

async function getCourseById(req, res, next) {
  try {
    const course = await MongoCourse.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'MongoDB course not found' });
    }

    return res.status(200).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const course = await MongoCourse.create(req.body);
    return res.status(201).location(`/mongo/courses/${course.id}`).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const course = await MongoCourse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!course) {
      return res.status(404).json({ error: 'MongoDB course not found' });
    }

    return res.status(200).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await MongoCourse.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'MongoDB course not found' });
    }

    return res.status(200).json({ data: course });
  } catch (error) {
    return next(error);
  }
}

async function addLesson(req, res, next) {
  try {
    const course = await MongoCourse.findByIdAndUpdate(
      req.params.id,
      { $push: { lessons: req.body } },
      { new: true, runValidators: true },
    );

    if (!course) {
      return res.status(404).json({ error: 'MongoDB course not found' });
    }

    return res.status(200).json({ data: course });
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
  addLesson,
};
