'use strict';

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
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

  return res.status(err.status || 500).json({
    error: err.status ? err.message : 'Internal server error',
  });
}

module.exports = { notFoundHandler, errorHandler };
