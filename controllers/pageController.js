'use strict';

const courseModel = require('../models/courseModel');

const ALLOWED_STATUSES = ['draft', 'published', 'archived'];
const REQUIRED_FIELDS = ['title', 'description', 'teacher', 'durationHours'];

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

function validateForm(body) {
  const data = {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    teacher: String(body.teacher || '').trim(),
    durationHours: Number(body.durationHours),
    status: body.status || 'draft',
  };

  const missingField = REQUIRED_FIELDS.find((field) => {
    if (field === 'durationHours') {
      return !body.durationHours;
    }
    return !data[field];
  });

  if (missingField) {
    return { error: `Поле «${missingField}» обязательно для заполнения`, data };
  }

  if (!Number.isFinite(data.durationHours) || data.durationHours <= 0) {
    return { error: 'Продолжительность должна быть положительным числом', data };
  }

  if (!ALLOWED_STATUSES.includes(data.status)) {
    return { error: 'Выбран недопустимый статус курса', data };
  }

  return { error: null, data };
}

function addCourse(req, res) {
  const result = validateForm(req.body);

  if (result.error) {
    return res.status(400).render('add', {
      ...getPageData(req),
      title: 'Добавление курса',
      form: req.body,
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
