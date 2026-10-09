'use strict';

const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDirectory, 'requests.log');

fs.mkdirSync(logDirectory, { recursive: true });

function getSafeUrl(req) {
  const url = new URL(req.originalUrl, 'http://localhost');

  for (const key of url.searchParams.keys()) {
    if (/token|password|secret|authorization|username|login|^user$/i.test(key)) {
      url.searchParams.set(key, '[REDACTED]');
    }
  }

  return `${url.pathname}${url.search}`;
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const timestamp = new Date(startedAt).toISOString();
    const duration = Date.now() - startedAt;
    const line = `${timestamp} ${req.method} ${getSafeUrl(req)} ${res.statusCode} ${duration}ms\n`;

    fs.appendFile(logFile, line, (error) => {
      if (error) {
        console.error('Failed to write request log:', error);
      }
    });
  });

  next();
}

module.exports = requestLogger;
