import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { fetchCourses, getApiError } from './api.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export default function CourseChat() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [name, setName] = useState('Студент');
  const [connection, setConnection] = useState(null);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState('Выберите курс и войдите в обсуждение');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCourses({ signal: controller.signal })
      .then((data) => {
        setCourses(data);
        setCourseId(data.length ? String(data[0].id) : '');
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setError(getApiError(requestError));
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!connection) return;

    const socket = io(SOCKET_URL, { autoConnect: false, auth: { name: connection.name } });
    socketRef.current = socket;

    function appendMessage(message) {
      setMessages((current) => [...current, message].slice(-100));
    }

    function onConnect() {
      setError('');
      setStatus('Соединение установлено, подключаемся к курсу...');
      socket.timeout(5000).emit('course:join', { courseId: connection.courseId }, (timeoutError, result) => {
        if (!socket.connected) return;
        if (timeoutError || !result?.ok) {
          setError(timeoutError ? 'Сервер не подтвердил вход в обсуждение' : result.error);
          return;
        }
        setJoined(true);
        setStatus(`Подключено: ${result.course.title}`);
      });
    }

    function onMessage(message) {
      appendMessage({ ...message, type: 'message' });
    }

    function onPresence(event) {
      appendMessage({ ...event, type: 'presence' });
    }

    function onDisconnect() {
      setJoined(false);
      setSending(false);
      setStatus('Соединение потеряно. Ожидаем переподключения...');
    }

    function onConnectError(connectionError) {
      setJoined(false);
      setError(`Не удалось подключиться: ${connectionError.message}`);
    }

    socket.on('connect', onConnect);
    socket.on('chat:message', onMessage);
    socket.on('chat:presence', onPresence);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('chat:message', onMessage);
      socket.off('chat:presence', onPresence);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [connection]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  function connect(event) {
    event.preventDefault();
    if (!name.trim() || !courseId) {
      setError('Укажите имя и выберите курс');
      return;
    }
    setMessages([]);
    setError('');
    setStatus('Подключаемся...');
    setConnection({ name: name.trim(), courseId });
  }

  function disconnect(event) {
    event.preventDefault();
    setConnection(null);
    setJoined(false);
    setSending(false);
    setError('');
    setText('');
    setStatus('Вы вышли из обсуждения');
  }

  function sendMessage(event) {
    event.preventDefault();
    const socket = socketRef.current;
    if (!joined || !socket?.connected || !text.trim() || sending) return;

    setSending(true);
    setError('');
    socket.timeout(5000).emit('chat:send', { text: text.trim() }, (timeoutError, result) => {
      setSending(false);
      if (timeoutError || !result?.ok) {
        setError(timeoutError ? 'Сервер не подтвердил отправку' : result.error);
        return;
      }
      setText('');
    });
  }

  return (
    <section className="card course-chat">
      <h2>Обсуждение курса</h2>
      <p>Общайтесь с участниками выбранного курса.</p>
      <form className="chat-connect-form" onSubmit={connect}>
        <label>
          Ваше имя
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={30} required disabled={Boolean(connection)} />
        </label>
        <label>
          Курс
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} required disabled={Boolean(connection)}>
            {!courses.length && <option value="">Нет доступных курсов</option>}
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>
        {connection ? (
          <button type="button" className="secondary" onClick={disconnect}>Выйти из обсуждения</button>
        ) : (
          <button type="submit" disabled={!courses.length}>Войти в обсуждение</button>
        )}
      </form>
      <p className={joined ? 'chat-status connected' : 'chat-status'} role="status">{status}</p>
      {error && <p className="error-message" role="alert">{error}</p>}
      <ol className="chat-messages" ref={listRef} aria-label="Сообщения обсуждения">
        {!messages.length && <li className="empty-state">Сообщений пока нет</li>}
        {messages.map((message) => (
          <li key={message.id} className={message.type === 'presence' ? 'chat-presence' : 'chat-message'}>
            {message.type === 'presence' ? (
              <span>{message.name} {message.action === 'join' ? 'вошёл в обсуждение' : 'вышел из обсуждения'}</span>
            ) : (
              <><strong>{message.author}</strong><p>{message.text}</p></>
            )}
            <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString('ru-RU')}</time>
          </li>
        ))}
      </ol>
      <form className="chat-send-form" onSubmit={sendMessage}>
        <label>
          Сообщение (до 500 символов)
          <input value={text} onChange={(event) => setText(event.target.value)} maxLength={500} disabled={!joined || sending} />
        </label>
        <button type="submit" disabled={!joined || !text.trim() || sending}>{sending ? 'Отправка...' : 'Отправить'}</button>
      </form>
    </section>
  );
}
