'use strict';

const courseModel = require('../models/courseModel');
const COURSE_CONSTRAINTS = require('../config/courseConstraints.json');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function renderErrorPage(res, status, message) {
  return res.status(status).render('404', {
    title: status === 404 ? 'Курс не найден' : 'Ошибка',
    path: message,
  });
}

function getPageData(req) {
  return {
    user: req.user,
    authQuery: '?auth=1',
    formatDate,
    showErrorDemo: process.env.NODE_ENV !== 'production',
    formConstraints: COURSE_CONSTRAINTS,
  };
}

function renderHome(req, res) {
  const courses = courseModel.getAll({
    status: req.query.status,
    search: req.query.search,
  });

  return res.render('index', {
    ...getPageData(req),
    title: 'Курсы',
    courses,
    filters: {
      search: req.query.search || '',
      status: req.query.status || '',
    },
  });
}

function renderCourse(req, res) {
  const id = Number(req.params.id);
  const course = Number.isInteger(id) && id > 0 ? courseModel.getById(id) : null;

  if (!course) {
    return renderErrorPage(res, 404, `Курс с идентификатором ${req.params.id} не найден`);
  }

  return res.render('item', {
    ...getPageData(req),
    title: course.title,
    course,
  });
}

function renderAddForm(req, res) {
  return res.render('add', {
    ...getPageData(req),
    title: 'Добавление курса',
    form: {},
    error: null,
  });
}

function validateForm(body = {}) {
  const durationInput =
    typeof body.durationHours === 'string'
      ? body.durationHours.trim()
      : String(body.durationHours ?? '').trim();
  const status = typeof body.status === 'string' ? body.status : 'draft';
  const data = {
    title: normalizeText(body.title),
    description: normalizeText(body.description),
    teacher: normalizeText(body.teacher),
    durationHours: Number(durationInput),
    status,
  };
  const form = { ...data, durationHours: durationInput };

  const textFields = COURSE_CONSTRAINTS.textFields;
  const missingField = Object.keys(textFields).find((field) => !data[field]);

  if (missingField) {
    return {
      error: `Поле «${textFields[missingField].label}» обязательно для заполнения`,
      data,
      form,
    };
  }

  for (const [field, constraints] of Object.entries(textFields)) {
    if (data[field].length > constraints.maxLength) {
      return {
        error: `Поле «${constraints.label}» не должно превышать ${constraints.maxLength} символов`,
        data,
        form,
      };
    }
  }

  if (!durationInput) {
    return { error: 'Поле «Продолжительность, часов» обязательно для заполнения', data, form };
  }

  if (
    !Number.isFinite(data.durationHours) ||
    data.durationHours < COURSE_CONSTRAINTS.durationHours.minimum
  ) {
    return {
      error: 'Продолжительность должна быть числом не меньше нуля',
      data,
      form,
    };
  }

  if (!COURSE_CONSTRAINTS.allowedStatuses.includes(data.status)) {
    return { error: 'Выбран недопустимый статус курса', data, form };
  }

  return { error: null, data, form };
}

function addCourse(req, res) {
  const result = validateForm(req.body);

  if (result.error) {
    return res.status(400).render('add', {
      ...getPageData(req),
      title: 'Добавление курса',
      form: result.form,
      error: result.error,
    });
  }

  courseModel.create(result.data);
  return res.redirect('/?auth=1');
}

function renderLogin(req, res) {
  return res.render('login', {
    title: 'Авторизация',
    returnTo: req.query.returnTo || '/',
  });
}

module.exports = {
  renderHome,
  renderCourse,
  renderAddForm,
  addCourse,
  renderLogin,
  formatDate,
};
