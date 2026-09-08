'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate() {}
  }

  Course.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      teacher: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      durationHours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
        validate: { isIn: [['draft', 'published', 'archived']] },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Course',
    },
  );

  return Course;
};
