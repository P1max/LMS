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

function errorHandler(err, req, res, _next) {
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
