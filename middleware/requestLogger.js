'use strict';

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const timestamp = new Date(startedAt).toISOString();
    const duration = Date.now() - startedAt;
    console.log(`${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}

module.exports = requestLogger;
