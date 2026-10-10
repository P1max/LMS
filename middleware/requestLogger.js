'use strict';

const fs = require('fs').promises;
const path = require('path');

const logDirectory = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDirectory, 'requests.log');

function getSafeUrl(req) {
  const url = new URL(req.originalUrl, 'http://localhost');

  for (const key of url.searchParams.keys()) {
    if (/token|password|secret|authorization|username|login|^user$/i.test(key)) {
      url.searchParams.set(key, '[REDACTED]');
    }
  }

  return `${url.pathname}${url.search}`;
}

async function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} ${req.method} ${getSafeUrl(req)}\n`;

  try {
    await fs.mkdir(logDirectory, { recursive: true });
    await fs.appendFile(logFile, line, 'utf8');
    console.log(line.trimEnd());
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = requestLogger;
