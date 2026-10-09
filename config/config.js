require('dotenv').config({ quiet: true });

const commonConfig = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: commonConfig,
  test: commonConfig,
  production: commonConfig,
};
