require('dotenv').config({ quiet: true });

const commonConfig = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  logging: false,
  seederStorage: process.env.NODE_ENV === 'production' ? 'sequelize' : 'none',
};

module.exports = {
  development: commonConfig,
  test: commonConfig,
  production: commonConfig,
};
