'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        email: 'admin@lms.local',
        passwordHash,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.sequelize.query(
      `SELECT setval('"Users_id_seq"', 1, true);`,
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Users_id_seq" RESTART WITH 1;`,
    );
  },
};
