const express = require('express');
const http = require('node:http');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const mongoCourseRoutes = require('./mongo/routes/courseRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { sequelize } = require('./models');
const { connectMongo, isMongoConnected } = require('./mongo/db');
const { attachChat } = require('./realtime/chat');

const app = express();
const server = http.createServer(app);
attachChat(server);
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/mongo/courses', mongoCourseRoutes);

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    const mongoReady = !process.env.MONGO_URI || isMongoConnected();
    return res.status(mongoReady ? 200 : 503).json({
      status: mongoReady ? 'ok' : 'degraded',
      databases: {
        postgres: 'connected',
        mongo: process.env.MONGO_URI ? (mongoReady ? 'connected' : 'disconnected') : 'disabled',
      },
    });
  } catch (_error) {
    return res.status(503).json({ status: 'degraded', error: 'PostgreSQL is unavailable' });
  }
});

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

    if (process.env.MONGO_URI) {
      await connectMongo();
    } else {
      console.warn('MONGO_URI is not configured; MongoDB routes are disabled.');
    }

    server.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

startServer();
