import { useEffect, useState } from 'react';
import {
  addCourse,
  fetchCourses,
  getApiError,
  login,
  removeCourse,
  updateCourse,
} from './api.js';

const emptyForm = {
  title: '',
  description: '',
  teacher: '',
  durationHours: '',
  status: 'draft',
  startDate: '',
};

function App() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lms-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timerId);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchCourses({
          search: debouncedSearch,
          status: filter,
          signal: controller.signal,
        });
        setCourses(data);
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(getApiError(requestError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => controller.abort();
  }, [debouncedSearch, filter, reloadKey]);

  useEffect(() => {
    document.title = `LMS — курсов: ${courses.length}`;
  }, [courses.length]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice('');
    setError('');

    if (!form.title.trim() || !form.teacher.trim() || !form.durationHours) {
      setError('Заполните название, преподавателя и количество часов.');
      return;
    }

    const courseData = {
      title: form.title.trim(),
      description: form.description.trim(),
      teacher: form.teacher.trim(),
      durationHours: Number(form.durationHours),
      status: form.status,
      startDate: form.startDate || null,
    };

    setSaving(true);

    if (editingId !== null) {
      const previousCourse = courses.find((course) => course.id === editingId);
      const optimisticCourse = { ...previousCourse, ...courseData };
      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === editingId ? optimisticCourse : course,
        ),
      );

      try {
        const savedCourse = await updateCourse(editingId, courseData);
        setCourses((currentCourses) =>
          currentCourses.map((course) =>
            course.id === editingId ? savedCourse : course,
          ),
        );
        setNotice('Курс обновлён.');
        resetForm();
      } catch (requestError) {
        setCourses((currentCourses) =>
          currentCourses.map((course) =>
            course.id === editingId ? previousCourse : course,
          ),
        );
        setError(getApiError(requestError));
      } finally {
        setSaving(false);
      }

      return;
    }

    const temporaryId = `temporary-${Date.now()}`;
    const optimisticCourse = { id: temporaryId, ...courseData };
    setCourses((currentCourses) => [...currentCourses, optimisticCourse]);

    try {
      const savedCourse = await addCourse(courseData);
      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === temporaryId ? savedCourse : course,
        ),
      );
      setNotice('Курс добавлен.');
      resetForm();
    } catch (requestError) {
      setCourses((currentCourses) =>
        currentCourses.filter((course) => course.id !== temporaryId),
      );
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    setNotice('');
    setError('');
    setCourses((currentCourses) =>
      currentCourses.filter((currentCourse) => currentCourse.id !== course.id),
    );

    try {
      await removeCourse(course.id);
      setNotice('Курс удалён.');
    } catch (requestError) {
      setCourses((currentCourses) => [...currentCourses, course]);
      setError(getApiError(requestError));
    }
  }

  function startEditing(course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      teacher: course.teacher,
      durationHours: String(course.durationHours),
      status: course.status,
      startDate: course.startDate ? course.startDate.slice(0, 10) : '',
    });
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await login(authForm);
      localStorage.setItem('token', response.token);
      localStorage.setItem('lms-user', JSON.stringify(response.user));
      setUser(response.user);
      setAuthForm({ email: '', password: '' });
    } catch (requestError) {
      setAuthError(getApiError(requestError));
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('lms-user');
    setUser(null);
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Learning management system</p>
          <h1>Курсы LMS</h1>
        </div>
        {user ? (
          <div className="user-panel">
            <span>{user.email}</span>
            <button className="secondary" onClick={logout}>Выйти</button>
          </div>
        ) : (
          <span className="course-count">Гость</span>
        )}
      </header>

      {!user && (
        <section className="card">
          <h2>Вход в систему</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <input
              type="password"
              placeholder="Пароль"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <button type="submit" disabled={authLoading}>
              {authLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          {authError && <p className="error-message">{authError}</p>}
          <small>Для проверки: admin@lms.local / Admin123!</small>
        </section>
      )}

      <section className="card">
        <h2>{editingId === null ? 'Добавить курс' : 'Редактировать курс'}</h2>
        <form className="course-form" onSubmit={handleSubmit}>
          <label>
            Название
            <input name="title" value={form.title} onChange={handleChange} />
          </label>
          <label>
            Преподаватель
            <input name="teacher" value={form.teacher} onChange={handleChange} />
          </label>
          <label>
            Часы
            <input
              name="durationHours"
              type="number"
              min="1"
              value={form.durationHours}
              onChange={handleChange}
            />
          </label>
          <label>
            Дата начала
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
            />
          </label>
          <label>
            Статус
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
              <option value="archived">Архив</option>
            </select>
          </label>
          <label className="wide-field">
            Описание
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="2"
            />
          </label>
          <div className="form-actions wide-field">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Сохранение...'
                : editingId === null
                  ? 'Добавить курс'
                  : 'Сохранить изменения'}
            </button>
            {editingId !== null && (
              <button type="button" className="secondary" onClick={resetForm}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск на сервере"
          />
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="published">Опубликованные</option>
            <option value="archived">Архив</option>
          </select>
          <button
            className="secondary"
            onClick={() => {
              setDebouncedSearch(search.trim());
              setReloadKey((currentKey) => currentKey + 1);
            }}
          >
            Обновить
          </button>
        </div>

        {notice && <p className="success-message">{notice}</p>}
        {error && (
          <div className="error-box">
            <p className="error-message">{error}</p>
            <button
              className="secondary"
              onClick={() => setReloadKey((currentKey) => currentKey + 1)}
            >
              Повторить
            </button>
          </div>
        )}

        {loading ? (
          <p className="loading-message">Загрузка курсов...</p>
        ) : (
          <div className="course-list">
            {courses.length === 0 ? (
              <p className="empty-state">Курсы не найдены.</p>
            ) : (
              courses.map((course) => (
                <article className="course-item" key={course.id}>
                  <div>
                    <div className="course-title-row">
                      <h3>{course.title}</h3>
                      <span className={`status status-${course.status}`}>
                        {course.status}
                      </span>
                    </div>
                    <p>{course.description}</p>
                    <small>
                      {course.teacher} · {course.durationHours} ч.
                      {course.startDate &&
                        ` · начало: ${course.startDate.slice(0, 10)}`}
                    </small>
                  </div>
                  <div className="item-actions">
                    <button className="secondary" onClick={() => startEditing(course)}>
                      Изменить
                    </button>
                    <button className="danger" onClick={() => handleDelete(course)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
