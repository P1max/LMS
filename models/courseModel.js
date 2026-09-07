'use strict';

const courses = [
  {
    id: 1,
    title: 'Web Development Basics',
    description: 'HTML, CSS and JavaScript fundamentals',
    teacher: 'Anna Petrova',
    durationHours: 36,
    status: 'published',
    createdAt: new Date('2026-09-01T09:00:00.000Z'),
    updatedAt: new Date('2026-09-01T09:00:00.000Z'),
  },
  {
    id: 2,
    title: 'Node.js and Express',
    description: 'Server-side JavaScript and REST API development',
    teacher: 'Ivan Sokolov',
    durationHours: 48,
    status: 'draft',
    createdAt: new Date('2026-09-02T10:30:00.000Z'),
    updatedAt: new Date('2026-09-02T10:30:00.000Z'),
  },
];

let nextId = 3;

function getAll({ status, search } = {}) {
  let result = courses;

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

function getById(id) {
  return courses.find((course) => course.id === id);
}

function create(data) {
  const now = new Date();
  const course = {
    id: nextId++,
    title: data.title.trim(),
    description: data.description.trim(),
    teacher: data.teacher.trim(),
    durationHours: data.durationHours,
    status: data.status || 'draft',
    createdAt: now,
    updatedAt: now,
  };

  courses.push(course);
  return course;
}

function update(id, data) {
  const index = courses.findIndex((course) => course.id === id);
  if (index === -1) {
    return null;
  }

  const course = {
    id,
    title: data.title.trim(),
    description: data.description.trim(),
    teacher: data.teacher.trim(),
    durationHours: data.durationHours,
    status: data.status || 'draft',
    createdAt: courses[index].createdAt,
    updatedAt: new Date(),
  };

  courses[index] = course;
  return course;
}

function remove(id) {
  const index = courses.findIndex((course) => course.id === id);
  if (index === -1) {
    return false;
  }

  courses.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
