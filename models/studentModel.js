'use strict';

const students = [
  {
    id: 1,
    fullName: 'Алексей Смирнов',
    email: 'alexey.smirnov@lms.local',
    group: 'ИТ-21',
    createdAt: new Date('2026-09-10T09:00:00.000Z'),
    updatedAt: new Date('2026-09-10T09:00:00.000Z'),
  },
  {
    id: 2,
    fullName: 'Мария Иванова',
    email: 'maria.ivanova@lms.local',
    group: 'ИТ-22',
    createdAt: new Date('2026-09-11T10:30:00.000Z'),
    updatedAt: new Date('2026-09-11T10:30:00.000Z'),
  },
];

let nextId = 3;

function getAll({ group, search } = {}) {
  const normalizedSearch = String(search || '').trim().toLowerCase();

  return students.filter((student) => {
    const matchesGroup = !group || student.group === group;
    const matchesSearch =
      !normalizedSearch ||
      [student.fullName, student.email].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );

    return matchesGroup && matchesSearch;
  });
}

function getById(id) {
  return students.find((student) => student.id === id) || null;
}

function emailExists(email, exceptId = null) {
  const normalizedEmail = email.trim().toLowerCase();
  return students.some(
    (student) =>
      student.id !== exceptId && student.email.toLowerCase() === normalizedEmail,
  );
}

function create(data) {
  const now = new Date();
  const student = {
    id: nextId++,
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    group: data.group.trim(),
    createdAt: now,
    updatedAt: now,
  };

  students.push(student);
  return student;
}

function update(id, data) {
  const index = students.findIndex((student) => student.id === id);
  if (index === -1) {
    return null;
  }

  const student = {
    ...students[index],
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    group: data.group.trim(),
    updatedAt: new Date(),
  };

  students[index] = student;
  return student;
}

function patch(id, data) {
  const currentStudent = getById(id);
  if (!currentStudent) {
    return null;
  }

  return update(id, { ...currentStudent, ...data });
}

function remove(id) {
  const index = students.findIndex((student) => student.id === id);
  if (index === -1) {
    return false;
  }

  students.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, emailExists, create, update, patch, remove };
