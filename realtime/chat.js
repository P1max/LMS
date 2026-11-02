const { randomUUID } = require('node:crypto');
const { Server } = require('socket.io');
const { Course } = require('../models');

const NAME_LIMIT = 30;
const MESSAGE_LIMIT = 500;

function attachChat(server) {
  const io = new Server(server, {
    cors: { origin: '*' },
    maxHttpBufferSize: 8 * 1024,
  });

  io.use((socket, next) => {
    const name = socket.handshake.auth?.name;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > NAME_LIMIT) {
      return next(new Error(`Укажите имя от 1 до ${NAME_LIMIT} символов`));
    }
    socket.data.name = name.trim();
    return next();
  });

  function presence(room, name, action) {
    io.to(room).emit('chat:presence', {
      id: randomUUID(),
      name,
      action,
      createdAt: new Date().toISOString(),
    });
  }

  function reply(ack, result) {
    if (typeof ack === 'function') ack(result);
  }

  io.on('connection', (socket) => {
    socket.on('course:join', async (payload, ack) => {
      try {
        const courseId = Number(payload?.courseId);
        if (!Number.isSafeInteger(courseId) || courseId <= 0) {
          return reply(ack, { ok: false, error: 'Некорректный идентификатор курса' });
        }

        const course = await Course.findByPk(courseId, { attributes: ['id', 'title'] });
        if (!course) {
          return reply(ack, { ok: false, error: 'Курс не найден' });
        }
        if (!socket.connected) return;

        if (socket.data.room) {
          await socket.leave(socket.data.room);
          presence(socket.data.room, socket.data.name, 'leave');
        }

        const room = `course:${course.id}`;
        await socket.join(room);
        socket.data.room = room;
        socket.data.courseId = course.id;
        presence(room, socket.data.name, 'join');
        return reply(ack, { ok: true, course: { id: course.id, title: course.title } });
      } catch (error) {
        console.error('Chat room error:', error.message);
        return reply(ack, { ok: false, error: 'Не удалось открыть обсуждение курса' });
      }
    });

    socket.on('chat:send', (payload, ack) => {
      if (!socket.data.room) {
        return reply(ack, { ok: false, error: 'Сначала выберите обсуждение курса' });
      }

      const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
      if (!text || text.length > MESSAGE_LIMIT) {
        return reply(ack, { ok: false, error: `Сообщение должно содержать от 1 до ${MESSAGE_LIMIT} символов` });
      }

      const now = Date.now();
      if (now - (socket.data.lastMessageAt || 0) < 300) {
        return reply(ack, { ok: false, error: 'Отправляйте сообщения не чаще одного раза в 300 мс' });
      }
      socket.data.lastMessageAt = now;

      const message = {
        id: randomUUID(),
        courseId: socket.data.courseId,
        author: socket.data.name,
        text,
        createdAt: new Date(now).toISOString(),
      };
      io.to(socket.data.room).emit('chat:message', message);
      return reply(ack, { ok: true, id: message.id });
    });

    socket.on('disconnect', () => {
      if (socket.data.room) presence(socket.data.room, socket.data.name, 'leave');
    });
  });

  return io;
}

module.exports = { attachChat };
