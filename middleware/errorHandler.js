'use strict';

function isApiRequest(req) {
  return req.path === '/courses' || req.path.startsWith('/courses/');
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
          'Не удалось получить доступ к файлу data/courses.json.',
          'Проверьте, что это доступный для чтения файл, а не каталог.',
        ].join(' '),
      };
    case 'COURSE_DATA_INVALID':
      return {
        title: 'Файл данных повреждён',
        message:
          'Не удалось обработать данные курсов. Проверьте формат JSON и наличие массива записей.',
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

  console.error(err);
  const publicDetails = getPublicErrorDetails(err);

  if (!isApiRequest(req) && req.accepts('html')) {
    return res.status(500).render('500', {
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
