const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authorization = req.get('Authorization');
  const [type, token] = authorization ? authorization.split(' ') : [];

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  return next();
}

module.exports = { authenticate, isAdmin };
