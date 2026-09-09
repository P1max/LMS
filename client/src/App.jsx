import { useEffect, useState } from 'react';

const STORAGE_KEY = 'lms-courses';

const initialCourses = [
  {
    id: 1,
    title: 'Web Development Basics',
    description: 'HTML, CSS и JavaScript',
    teacher: 'Анна Петрова',
    durationHours: 36,
    status: 'published',
    startDate: '2026-09-15',
  },
  {
    id: 2,
    title: 'Node.js и Express',
    description: 'Создание серверных приложений',
    teacher: 'Иван Соколов',
    durationHours: 48,
    status: 'draft',
    startDate: '2026-10-01',
  },
];

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
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCourses = localStorage.getItem(STORAGE_KEY);

    if (savedCourses) {
      try {
        const parsedCourses = JSON.parse(savedCourses);
        setCourses(Array.isArray(parsedCourses) ? parsedCourses : initialCourses);
      } catch (_error) {
        setCourses(initialCourses);
      }
    } else {
      setCourses(initialCourses);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    }
  }, [courses, isLoaded]);

  useEffect(() => {
    document.title = `LMS — курсов: ${courses.length}`;
  }, [courses.length]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.teacher.trim() || !form.durationHours) {
      return;
    }

    const courseData = {
      title: form.title.trim(),
      description: form.description.trim(),
      teacher: form.teacher.trim(),
      durationHours: Number(form.durationHours),
      status: form.status,
      startDate: form.startDate,
    };

    if (editingId !== null) {
      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === editingId ? { ...course, ...courseData } : course,
        ),
      );
      setEditingId(null);
    } else {
      setCourses((currentCourses) => [
        ...currentCourses,
        { id: Date.now(), ...courseData },
      ]);
    }

    setForm(emptyForm);
  }

  function startEditing(course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      teacher: course.teacher,
      durationHours: String(course.durationHours),
      status: course.status,
      startDate: course.startDate || '',
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function removeCourse(id) {
    setCourses((currentCourses) =>
      currentCourses.filter((course) => course.id !== id),
    );
  }

  const visibleCourses = courses.filter((course) => {
    const matchesStatus = filter === 'all' || course.status === filter;
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      [course.title, course.description, course.teacher].some((field) =>
        field.toLowerCase().includes(normalizedSearch),
      );

    return matchesStatus && matchesSearch;
  });

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Learning management system</p>
          <h1>Курсы LMS</h1>
        </div>
        <span className="course-count">Всего: {courses.length}</span>
      </header>

      <section className="card">
        <h2>{editingId === null ? 'Добавить курс' : 'Редактировать курс'}</h2>
        <form className="course-form" onSubmit={handleSubmit}>
          <label>
            Название
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Название курса"
            />
          </label>
          <label>
            Преподаватель
            <input
              name="teacher"
              value={form.teacher}
              onChange={handleChange}
              placeholder="Имя преподавателя"
            />
          </label>
          <label>
            Часы
            <input
              name="durationHours"
              type="number"
              min="1"
              value={form.durationHours}
              onChange={handleChange}
              placeholder="40"
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
              placeholder="Краткое описание курса"
              rows="2"
            />
          </label>
          <div className="form-actions wide-field">
            <button type="submit">
              {editingId === null ? 'Добавить курс' : 'Сохранить изменения'}
            </button>
            {editingId !== null && (
              <button type="button" className="secondary" onClick={cancelEditing}>
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
            placeholder="Поиск по курсам"
          />
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="published">Опубликованные</option>
            <option value="archived">Архив</option>
          </select>
        </div>

        <div className="course-list">
          {visibleCourses.length === 0 ? (
            <p className="empty-state">Курсы не найдены.</p>
          ) : (
            visibleCourses.map((course) => (
              <article className="course-item" key={course.id}>
                <div>
                  <div className="course-title-row">
                    <h3>{course.title}</h3>
                    <span className={`status status-${course.status}`}>
                      {course.status}
                    </span>
                  </div>
                  <p>{course.description || 'Описание не указано'}</p>
                  <small>
                    {course.teacher} · {course.durationHours} ч.
                    {course.startDate && ` · начало: ${course.startDate}`}
                  </small>
                </div>
                <div className="item-actions">
                  <button className="secondary" onClick={() => startEditing(course)}>
                    Изменить
                  </button>
                  <button className="danger" onClick={() => removeCourse(course.id)}>
                    Удалить
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
