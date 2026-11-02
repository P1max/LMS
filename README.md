# LMS — лабораторная работа 8

Ветка `lab28` продолжает `lab27`. Backend, frontend, PostgreSQL и MongoDB запускаются через Docker Compose.
Выбранное дополнительное задание — **healthcheck backend по `/health`**. PostgreSQL и MongoDB тоже проверяются перед запуском backend. Nginx раздаёт собранный React и проксирует API и Socket.IO.

## Запуск в Docker

Запустить Docker Desktop. Подготовить корневой `.env` по `.env.example`: нужны `JWT_SECRET`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. Пароль PostgreSQL в примере предназначен для локальной демонстрации; можно задать свой пароль из букв и цифр.

```bash
docker compose up --build -d
docker compose ps
```

Сайт: `http://localhost`. API напрямую: `http://localhost:5001`. Проверка состояния: `http://localhost:5001/health` или `http://localhost/api/health`.
Порт `5001` выбран потому, что `5000` на macOS может занимать AirPlay. Порты можно изменить через `FRONTEND_PORT` и `BACKEND_PORT` в `.env`.

Локальные команды `npm run dev` для этого режима не нужны. Адреса внутри Compose — `postgres:5432`, `mongo:27017`, `backend:3000`. Базы контейнерной версии отдельные от локальных баз; старые данные автоматически не копируются.

При первом запуске backend выполняет SQL-миграции и сиды. В production имена выполненных сидов хранятся в таблице `SequelizeData`, поэтому повторный старт не дублирует курсы. Данные PostgreSQL и MongoDB сохраняются в именованных томах.

```bash
docker compose logs --tail=50 backend
docker compose exec backend node --version
docker compose stop
```

`stop` сохраняет контейнеры и данные. `docker compose down` удаляет контейнеры и сеть, но сохраняет именованные тома. Для обычной остановки не добавлять `-v`, иначе будут удалены тома с контейнерными данными.

Образы: официальные `node:24-alpine`, `nginx:stable-alpine`, `postgres:15-alpine`, `mongo:7`. Используется стандартный Docker Hub; отдельное зеркало не требуется, если загрузка образов доступна.

## Возможности ЛР7

Ветка `lab27` продолжает `lab26`. Добавлен чат обсуждения курсов на Socket.IO.
Выбранное дополнительное задание — **комнаты по курсам**: сообщения получают только участники выбранного курса.

## Проверка чата

Запустить API и клиент по инструкции ниже. Открыть `http://localhost:5173` в двух окнах и перейти к блоку «Обсуждение курса».
В первом окне указать имя «Анна», во втором — «Иван». Выбрать один курс и нажать «Войти в обсуждение». Отправить сообщение и убедиться, что оно появилось в обоих окнах. Выход второго участника отображается в первом окне.

Затем во втором окне выбрать другой курс. Сообщение первого курса туда не попадёт. Для повторного выбора курса сначала выйти из обсуждения.

- `realtime/chat.js` — Socket.IO-сервер, комнаты, сообщения и уведомления о входе/выходе;
- `client/src/CourseChat.jsx` — React-интерфейс чата;
- `server.js` — общий HTTP-сервер для Express и Socket.IO;
- `VITE_SOCKET_URL` — необязательный адрес Socket.IO; локально используется `http://localhost:3000`.

События: `course:join` — вход в комнату с подтверждением, `chat:send` — отправка с подтверждением, `chat:message` — доставка, `chat:presence` — вход/выход участника. Имя ограничено 30 символами, сообщение — 500. Сообщения чаще одного раза в 300 мс отклоняются. История чата не записывается в БД и после перезагрузки окна очищается. Каждое окно хранит последние 100 событий.

## Возможности ЛР6

Ветка `lab26`. PostgreSQL/Sequelize и MongoDB/Mongoose работают параллельно:

- `/courses` — реляционные курсы, которые показывает React-клиент;
- `/mongo/courses` — документы MongoDB с массивами `tags` и вложенных занятий `lessons`.

## Подготовка

Нужны Node.js, PostgreSQL и MongoDB. Для локальной MongoDB можно использовать Docker:

```bash
docker run -d --name lms-mongo-local -p 127.0.0.1:27017:27017 -v lms-mongo-local-data:/data/db mongo:7
```

Эта команда выполняется один раз. Для уже созданного контейнера: `docker start lms-mongo-local`.

Установить зависимости и подготовить `.env` по `.env.example`:

```bash
npm install
```

В `.env` задать `DATABASE_URL`, `JWT_SECRET`, `MONGO_URI` и при необходимости `PORT`.
Локальная MongoDB: `MONGO_URI=mongodb://127.0.0.1:27017/lms_db`.
Настоящий `.env` не попадает в Git.

Для новой PostgreSQL-базы:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Повторно запускать сиды поверх заполненной SQL-базы не нужно. Миграции уже выполненной базы можно проверить через `npx sequelize-cli db:migrate:status`.

## Запуск

В корне проекта:

```bash
npm run dev
```

API: `http://localhost:3000`. Отсутствие MongoDB-подключения даёт `503` на MongoDB-маршрутах.

React-клиент из ЛР5 запускается в другом терминале:

```bash
cd client
npm install
npm run dev
```

Интерфейс: `http://localhost:5173`. Он продолжает использовать PostgreSQL. MongoDB демонстрируется через `requests.http` и MongoDB Compass.

## Проверка MongoDB

В VS Code с расширением REST Client открыть `requests.http`. Выполнить именованный запрос `createMongoCourse`, затем остальные MongoDB-запросы. REST Client подставит `_id` курса и первого занятия из ответа автоматически.

| Метод | Путь | Действие |
| --- | --- | --- |
| GET | `/mongo/courses` | Список документов |
| GET | `/mongo/courses/:id` | Один курс |
| POST | `/mongo/courses` | Создать курс |
| PUT | `/mongo/courses/:id` | Изменить поля курса |
| DELETE | `/mongo/courses/:id` | Удалить курс |
| POST | `/mongo/courses/:id/lessons` | Добавить вложенное занятие через `$push` |
| PATCH | `/mongo/courses/:id/lessons/:lessonId` | Изменить занятие через `$set` и позиционный `$` |

Неверный идентификатор/данные дают `400`, отсутствующий документ — `404`.

В Compass подключиться к `mongodb://127.0.0.1:27017`, открыть базу `lms_db` и коллекцию `mongocourses`. Развернуть `lessons`: занятия хранятся внутри документа курса.
