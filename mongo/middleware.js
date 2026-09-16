'use strict';

const { isMongoConnected } = require('./db');

function ensureMongoConnection(req, res, next) {
  if (!isMongoConnected()) {
    return res.status(503).json({
      error: 'MongoDB is not connected. Set MONGO_URI in .env and restart the server.',
    });
  }

  return next();
}

module.exports = { ensureMongoConnection };
