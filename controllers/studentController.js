'use strict';

const studentModel = require('../models/studentModel');
const { parseId, validatePayload } = require('../utils/validation');

const studentSchema = {
  fullName: { type: 'string', required: true },
  email: { type: 'email', required: true },
  group: { type: 'string', required: true },
};

function getStudents(req, res) {
  const { group, search } = req.query;
  if (group !== undefined && typeof group !== 'string') {
    return res.status(400).json({ error: 'Group must be a string' });
  }
  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ error: 'Search must be a string' });
  }

  const students = studentModel.getAll({ group, search });
  return res.status(200).json({ count: students.length, data: students });
}

function getStudentById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Student ID must be a positive integer' });
  }

  const student = studentModel.getById(id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  return res.status(200).json({ data: student });
}

function checkEmail(email, exceptId, res) {
  if (studentModel.emailExists(email, exceptId)) {
    res.status(409).json({ error: 'Email already registered' });
    return false;
  }
  return true;
}

function createStudent(req, res) {
  const validationError = validatePayload(req.body, studentSchema, {
    requireAll: true,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  if (!checkEmail(req.body.email, null, res)) {
    return undefined;
  }

  const student = studentModel.create(req.body);
  return res.status(201).location(`/api/v1/students/${student.id}`).json({ data: student });
}

function updateStudent(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Student ID must be a positive integer' });
  }

  const validationError = validatePayload(req.body, studentSchema, {
    requireAll: true,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  if (!checkEmail(req.body.email, id, res)) {
    return undefined;
  }

  const student = studentModel.update(id, req.body);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  return res.status(200).json({ data: student });
}

function patchStudent(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Student ID must be a positive integer' });
  }

  const validationError = validatePayload(req.body, studentSchema);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  if (req.body.email && !checkEmail(req.body.email, id, res)) {
    return undefined;
  }

  const student = studentModel.patch(id, req.body);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  return res.status(200).json({ data: student });
}

function deleteStudent(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Student ID must be a positive integer' });
  }

  if (!studentModel.remove(id)) {
    return res.status(404).json({ error: 'Student not found' });
  }

  return res.status(204).send();
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  patchStudent,
  deleteStudent,
};
