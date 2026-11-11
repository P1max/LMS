'use strict';

const fs = require('fs').promises;
const path = require('path');

const coursesFile = path.join(__dirname, '..', 'data', 'courses.json');
const FILE_SYSTEM_ERROR_CODES = new Set([
  'ENOENT',
  'EISDIR',
  'ENOTDIR',
  'EACCES',
  'EPERM',
  'EBUSY',
  'EIO',
]);
let mutationQueue = Promise.resolve();

function createCourseDataError(code, message, cause) {
  const error = new Error(message, { cause });
  error.code = code;
  error.status = 500;
  return error;
}

async function readCourses() {
  let fileContent;

  try {
    fileContent = await fs.readFile(coursesFile, 'utf8');
  } catch (error) {
    if (FILE_SYSTEM_ERROR_CODES.has(error.code)) {
      throw createCourseDataError(
        'COURSE_DATA_UNAVAILABLE',
        'Course data file is missing or is not an accessible regular file',
        error,
      );
    }

    throw error;
  }

  let courses;
  try {
    courses = JSON.parse(fileContent);
  } catch (error) {
    throw createCourseDataError(
      'COURSE_DATA_INVALID',
      'Course data file contains invalid JSON',
      error,
    );
  }

  if (!Array.isArray(courses)) {
    throw createCourseDataError(
      'COURSE_DATA_INVALID',
      'Course data file must contain an array',
    );
  }

  return courses;
}

async function writeCourses(courses) {
  const temporaryFile = coursesFile + '.' + process.pid + '.tmp';
  const fileContent = JSON.stringify(courses, null, 2) + '\n';

  try {
    await fs.writeFile(temporaryFile, fileContent, 'utf8');
    await fs.rename(temporaryFile, coursesFile);
  } catch (error) {
    throw createCourseDataError(
      'COURSE_DATA_UNAVAILABLE',
      'Course data file cannot be updated',
      error,
    );
  }
}

function changeCourses(change) {
  const operation = mutationQueue.then(async () => {
    const courses = await readCourses();
    const result = change(courses);

    if (result.changed) {
      await writeCourses(courses);
    }

    return result.value;
  });

  mutationQueue = operation.catch(() => {});
  return operation;
}

async function getAll({ status, search } = {}) {
  let result = await readCourses();

  if (status) {
    result = result.filter((course) => course.status === status);
  }

  if (search) {
    const normalizedSearch = String(search).toLowerCase();
    result = result.filter(
      (course) =>
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.description.toLowerCase().includes(normalizedSearch) ||
        course.teacher.toLowerCase().includes(normalizedSearch),
    );
  }

  return result;
}

async function getById(id) {
  const courses = await readCourses();
  return courses.find((course) => course.id === id);
}

async function create(data) {
  return changeCourses((courses) => {
    const nextId = courses.reduce((maxId, course) => Math.max(maxId, course.id), 0) + 1;
    const now = new Date().toISOString();
    const course = {
      id: nextId,
      title: data.title.trim(),
      description: data.description.trim(),
      teacher: data.teacher.trim(),
      durationHours: data.durationHours,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
    };

    courses.push(course);
    return { value: course, changed: true };
  });
}

async function update(id, data) {
  return changeCourses((courses) => {
    const index = courses.findIndex((course) => course.id === id);

    if (index === -1) {
      return { value: null, changed: false };
    }

    const course = {
      id,
      title: data.title.trim(),
      description: data.description.trim(),
      teacher: data.teacher.trim(),
      durationHours: data.durationHours,
      status: data.status || 'draft',
      createdAt: courses[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    courses[index] = course;
    return { value: course, changed: true };
  });
}

async function remove(id) {
  return changeCourses((courses) => {
    const index = courses.findIndex((course) => course.id === id);

    if (index === -1) {
      return { value: false, changed: false };
    }

    courses.splice(index, 1);
    return { value: true, changed: true };
  });
}

module.exports = { getAll, getById, create, update, remove };
