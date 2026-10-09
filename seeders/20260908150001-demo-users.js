const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [existingUsers] = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE email = :email',
      { replacements: { email: 'admin@lms.local' } },
    );

    if (existingUsers.length > 0) {
      return;
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@lms.local',
        passwordHash,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'Users',
      { email: 'admin@lms.local' },
      {},
    );
  },
};
