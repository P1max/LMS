'use strict';

function isApiRequest(req) {
  const path = req.path;
  return (
    path === '/api' ||
    path.startsWith('/api/') ||
    path === '/courses' ||
    path.startsWith('/courses/') ||
    path === '/auth' ||
    path.startsWith('/auth/') ||
    path === '/profile' ||
    path === '/admin' ||
    path.startsWith('/admin/')
  );
}

function notFoundHandler(req, res) {
  if (!isApiRequest(req) && req.accepts('html')) {
    return res.status(404).render('404', {
      title: 'Страница не найдена',
      path: req.originalUrl,
    });
  }

  return res.status(404).json({ error: 'Route not found' });
}

function getPublicErrorDetails(error) {
  switch (error.code) {
    case 'COURSE_DATA_UNAVAILABLE':
      return {
        title: 'Файл данных недоступен',
        message: [
          'Не удалось прочитать или сохранить данные в файле data/courses.json.',
          'Убедитесь, что путь не занят каталогом и у приложения есть права чтения и записи.',
        ].join(' '),
      };
    case 'COURSE_DATA_INVALID':
      return {
        title: 'Файл данных повреждён',
        message: [
          'Не удалось обработать данные курсов.',
          'Проверьте формат JSON и наличие массива записей.',
        ].join(' '),
      };
    case 'REQUEST_LOG_UNAVAILABLE':
      return {
        title: 'Журнал запросов недоступен',
        message: [
          'Не удалось записать журнал logs/requests.log.',
          'Проверьте, что по этому пути находится доступный для записи файл, а не каталог.',
        ].join(' '),
      };
    default:
      return null;
  }
}

function errorHandler(err, req, res, _next) {
  if (res.headersSent) {
    return _next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors[0].message });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: err.fields?.email ? 'Email already registered' : 'Resource already exists',
    });
  }

  const isOversizedRequest =
    err.status === 413 ||
    err.type === 'entity.too.large' ||
    err.type === 'parameters.too.many';

  if (isOversizedRequest) {
    const message = [
      'Размер запроса или число полей превышает допустимый предел.',
      'Сократите данные и повторите отправку.',
    ].join(' ');

    if (!isApiRequest(req) && req.accepts('html')) {
      return res.status(413).render('500', {
        statusCode: 413,
        title: 'Слишком большой запрос',
        message,
      });
    }

    return res.status(413).json({ error: message });
  }

  console.error(err);
  const publicDetails = getPublicErrorDetails(err);

  if (!isApiRequest(req) && req.accepts('html')) {
    return res.status(500).render('500', {
      statusCode: 500,
      title: publicDetails?.title || 'Ошибка сервера',
      message:
        publicDetails?.message || 'Во время обработки запроса произошла ошибка.',
    });
  }

  return res.status(err.status || 500).json({
    error: publicDetails?.message || (err.status ? err.message : 'Internal server error'),
  });
}

module.exports = { notFoundHandler, errorHandler };
