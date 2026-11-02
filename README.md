# LMS — лабораторная работа 6

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
