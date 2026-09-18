'use strict';

function authMiddleware(req, res, next) {
  if (req.query.auth === '1') {
    req.user = { name: 'Пользователь' };
    return next();
  }

  const returnTo = encodeURIComponent(req.originalUrl);
  return res.redirect(`/login?returnTo=${returnTo}`);
}

module.exports = authMiddleware;
