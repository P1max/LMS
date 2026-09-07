'use strict';

const express = require('express');
const courseRoutes = require('./routes/courseRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'LMS Courses API is running',
    endpoints: '/courses',
  });
});

app.use('/courses', courseRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
