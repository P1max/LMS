'use strict';

const { User } = require('../models');

const PUBLIC_USER_ATTRIBUTES = ['id', 'email', 'role', 'createdAt', 'updatedAt'];

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: PUBLIC_USER_ATTRIBUTES,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: PUBLIC_USER_ATTRIBUTES,
      order: [['id', 'ASC']],
    });

    return res.status(200).json({ count: users.length, data: users });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getProfile, getUsers };
