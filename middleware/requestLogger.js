'use strict';

const fs = require('fs').promises;
const path = require('path');

const logDirectory = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDirectory, 'requests.log');
const MAX_LOGGED_URL_LENGTH = 512;

function createLogError(cause) {
  const error = new Error('Request log is not writable', { cause });
  error.code = 'REQUEST_LOG_UNAVAILABLE';
  error.status = 500;
  return error;
}

function getSafeUrl(req) {
  const url = new URL(req.originalUrl, 'http://localhost');

  for (const key of url.searchParams.keys()) {
    if (/token|password|secret|authorization|username|login|^user$/i.test(key)) {
      url.searchParams.set(key, '[REDACTED]');
    }
  }

  const safeUrl = `${url.pathname}${url.search}`;
  return safeUrl.length > MAX_LOGGED_URL_LENGTH
    ? `${safeUrl.slice(0, MAX_LOGGED_URL_LENGTH)}…[truncated]`
    : safeUrl;
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
    if (req.method === 'GET' && req.path === '/styles.css') {
      return next();
    }

    return next(createLogError(error));
  }
}

module.exports = requestLogger;
