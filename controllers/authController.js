'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

async function register(req, res, next) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: 'student' });

    return res.status(201).json({ data: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    return res.status(200).json({ token, expiresIn: '1h', user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };
