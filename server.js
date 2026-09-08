'use strict';

const express = require('express');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { sequelize } = require('./models');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'LMS Courses API is running',
    endpoints: '/courses',
  });
});

app.use('/courses', courseRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    await sequelize.authenticate();
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

startServer();
