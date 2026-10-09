/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Courses', [
      {
        id: 1,
        title: 'Web Development Basics',
        description: 'HTML, CSS and JavaScript fundamentals',
        teacher: 'Anna Petrova',
        durationHours: 36,
        status: 'published',
        startDate: new Date('2026-09-15T09:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: 'Node.js and Express',
        description: 'Server-side JavaScript and REST API development',
        teacher: 'Ivan Sokolov',
        durationHours: 48,
        status: 'draft',
        startDate: new Date('2026-10-01T10:30:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.sequelize.query(
      `SELECT setval('"Courses_id_seq"', 2, true);`,
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Courses', null, {});
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Courses_id_seq" RESTART WITH 1;`,
    );
  }
};
