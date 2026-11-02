#!/bin/sh
set -e

npx --no-install sequelize-cli db:migrate
npx --no-install sequelize-cli db:seed:all
exec node server.js
