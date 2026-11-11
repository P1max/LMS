'use strict';

const courseModel = require('../models/courseModel');
const COURSE_CONSTRAINTS = require('../config/courseConstraints.json');
const validateSearchQuery = require('../utils/searchQuery');
const validateStatusQuery = require('../utils/validateStatusQuery');

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
    formConstraints: COURSE_CONSTRAINTS,
  };
}

async function renderHome(req, res) {
  const { error, search } = validateSearchQuery(
    req.query.search,
    COURSE_CONSTRAINTS.search.maxLength,
  );
  const { error: statusError, status } = validateStatusQuery(
    req.query.status,
    COURSE_CONSTRAINTS.allowedStatuses,
  );

  if (error || statusError) {
    return res.status(400).render('index', {
      ...getPageData(req),
      title: 'Курсы',
      courses: [],
      error: error || statusError,
      filters: {
        search: '',
        status,
      },
    });
  }

  const courses = await courseModel.getAll({
    status,
    search,
  });

  return res.status(200).render('index', {
    ...getPageData(req),
    title: 'Курсы',
    courses,
    error: null,
    filters: {
      search,
      status,
    },
  });
}

function parseCourseId(rawId) {
  if (typeof rawId !== 'string' || rawId.length > 16 || !/^\d+$/.test(rawId)) {
    return null;
  }

  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function renderCourse(req, res) {
  const id = parseCourseId(req.params.id);
  if (!id) {
    return renderErrorPage(res, 404, 'Указан некорректный идентификатор курса');
  }

  const course = await courseModel.getById(id);

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
  const normalizedDurationInput = durationInput.replace(',', '.');
  const validDurationFormat = /^\d+(?:[.,]\d+)?$/.test(durationInput);
  const status = body.status === undefined ? 'draft' : body.status;
  const data = {
    title: normalizeText(body.title),
    description: normalizeText(body.description),
    teacher: normalizeText(body.teacher),
    durationHours: validDurationFormat ? Number(normalizedDurationInput) : NaN,
    status,
  };
  const textFields = COURSE_CONSTRAINTS.textFields;
  const form = {
    title:
      data.title.length <= textFields.title.maxLength ? data.title : '',
    description:
      data.description.length <= textFields.description.maxLength
        ? data.description
        : '',
    teacher:
      data.teacher.length <= textFields.teacher.maxLength ? data.teacher : '',
    durationHours:
      durationInput.length <= COURSE_CONSTRAINTS.durationHours.maxInputLength
        ? durationInput
        : '',
    status:
      typeof status === 'string' && COURSE_CONSTRAINTS.allowedStatuses.includes(status)
        ? status
        : 'draft',
  };
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

  if (durationInput.length > COURSE_CONSTRAINTS.durationHours.maxInputLength) {
    return {
      error: `Продолжительность не должна превышать ${COURSE_CONSTRAINTS.durationHours.maxInputLength} символов`,
      data,
      form,
    };
  }

  if (!validDurationFormat) {
    return {
      error: 'Продолжительность должна содержать только цифры и, при необходимости, десятичный разделитель',
      data,
      form,
    };
  }

  if (
    !Number.isFinite(data.durationHours) ||
    data.durationHours < COURSE_CONSTRAINTS.durationHours.minimum ||
    data.durationHours > COURSE_CONSTRAINTS.durationHours.maximum
  ) {
    return {
      error: `Продолжительность должна быть числом от ${COURSE_CONSTRAINTS.durationHours.minimum} до ${COURSE_CONSTRAINTS.durationHours.maximum} часов`,
      data,
      form,
    };
  }

  if (!COURSE_CONSTRAINTS.allowedStatuses.includes(data.status)) {
    return {
      error: 'Поле «Статус» содержит недопустимое значение',
      data,
      form,
    };
  }

  return { error: null, data, form };
}

async function addCourse(req, res) {
  const result = validateForm(req.body);

  if (result.error) {
    return res.status(400).render('add', {
      ...getPageData(req),
      title: 'Добавление курса',
      form: result.form,
      error: result.error,
    });
  }

  await courseModel.create(result.data);
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
