'use strict';

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  console.error(err);

  return res.status(err.status || 500).json({
    error: err.status ? err.message : 'Internal server error',
  });
}

module.exports = { notFoundHandler, errorHandler };
