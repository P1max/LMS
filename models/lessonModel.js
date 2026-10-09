'use strict';

const lessons = [
  {
    id: 1,
    courseId: 1,
    title: 'Введение в HTML',
    description: 'Структура HTML-документа и основные элементы',
    orderNumber: 1,
    durationMinutes: 90,
    createdAt: new Date('2026-09-15T09:00:00.000Z'),
    updatedAt: new Date('2026-09-15T09:00:00.000Z'),
  },
  {
    id: 2,
    courseId: 2,
    title: 'Первый сервер на Express',
    description: 'Создание сервера и обработка маршрутов',
    orderNumber: 1,
    durationMinutes: 120,
    createdAt: new Date('2026-09-16T09:00:00.000Z'),
    updatedAt: new Date('2026-09-16T09:00:00.000Z'),
  },
];

let nextId = 3;

function getAll({ courseId, search } = {}) {
  const normalizedSearch = String(search || '').trim().toLowerCase();

  return lessons.filter((lesson) => {
    const matchesCourse = courseId === undefined || lesson.courseId === courseId;
    const matchesSearch =
      !normalizedSearch ||
      [lesson.title, lesson.description].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );

    return matchesCourse && matchesSearch;
  });
}

function getById(id) {
  return lessons.find((lesson) => lesson.id === id) || null;
}

function hasForCourse(courseId) {
  return lessons.some((lesson) => lesson.courseId === courseId);
}

function create(data) {
  const now = new Date();
  const lesson = { id: nextId++, ...data, createdAt: now, updatedAt: now };
  lessons.push(lesson);
  return lesson;
}

function update(id, data) {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  if (index === -1) {
    return null;
  }

  const lesson = { ...lessons[index], ...data, id, updatedAt: new Date() };
  lessons[index] = lesson;
  return lesson;
}

function patch(id, data) {
  const currentLesson = getById(id);
  if (!currentLesson) {
    return null;
  }

  return update(id, { ...currentLesson, ...data });
}

function remove(id) {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  if (index === -1) {
    return false;
  }

  lessons.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, hasForCourse, create, update, patch, remove };
