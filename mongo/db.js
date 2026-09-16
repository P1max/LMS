'use strict';

const mongoose = require('mongoose');

async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectMongo, isMongoConnected };
