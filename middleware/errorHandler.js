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

function errorHandler(err, req, res, _next) {
  if (res.headersSent) {
    return _next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  console.error(err);

  if (!isApiRequest(req) && req.accepts('html')) {
    return res.status(500).render('500', {
      title: 'Ошибка сервера',
      message: 'Во время обработки запроса произошла ошибка.',
    });
  }

  return res.status(err.status || 500).json({
    error: err.status ? err.message : 'Internal server error',
  });
}

module.exports = { notFoundHandler, errorHandler };
