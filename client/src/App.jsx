import React, { useState } from 'react';
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

const courses = [
  {
    id: 1,
    title: 'Основы веб-разработки',
    description: 'HTML, CSS и первые интерактивные страницы.',
    teacher: 'Анна Петрова',
    durationHours: 36,
    status: 'Опубликован',
  },
  {
    id: 2,
    title: 'Node.js и Express',
    description: 'Серверные приложения и интерфейсы для клиентов.',
    teacher: 'Иван Соколов',
    durationHours: 48,
    status: 'Черновик',
  },
  {
    id: 3,
    title: 'Основы баз данных',
    description: 'Модели данных, запросы и связи между сущностями.',
    teacher: 'Мария Орлова',
    durationHours: 42,
    status: 'Опубликован',
  },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/:id" element={<CoursePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="login"
          element={
            <LoginPage
              isAuthenticated={isAuthenticated}
              onLogin={() => setIsAuthenticated(true)}
            />
          }
        />
        <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function MainLayout() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">LMS Courses</Link>
          <nav className="main-nav" aria-label="Основная навигация">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Главная</NavLink>
            <NavLink to="/catalog" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Каталог</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>О проекте</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Кабинет</NavLink>
          </nav>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="site-footer">Учебный каталог LMS · маршруты открываются без полной перезагрузки</footer>
    </>
  );
}

function HomePage() {
  return (
    <section className="hero panel">
      <p className="eyebrow">Learning management system</p>
      <h1>Учитесь в удобном темпе</h1>
      <p className="lead">Каталог курсов, подробные страницы и личный кабинет собраны в одном приложении.</p>
      <Link className="button" to="/catalog">Открыть каталог</Link>
    </section>
  );
}

function CatalogPage() {
  return (
    <section>
      <div className="section-heading">
        <div><p className="eyebrow">Обучение</p><h1>Каталог курсов</h1></div>
        <span className="count-badge">{courses.length} курса</span>
      </div>
      <div className="course-grid">
        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </section>
  );
}

function CourseCard({ course }) {
  return (
    <article className="course-card panel">
      <div className="card-topline"><span className="status-badge">{course.status}</span><span className="course-id">#{course.id}</span></div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <dl className="course-meta">
        <div><dt>Преподаватель</dt><dd>{course.teacher}</dd></div>
        <div><dt>Продолжительность</dt><dd>{course.durationHours} ч.</dd></div>
      </dl>
      <Link className="text-link" to={`/catalog/${course.id}`}>Подробнее <span aria-hidden="true">→</span></Link>
    </article>
  );
}

function CoursePage() {
  const { id } = useParams();
  const course = courses.find((item) => item.id === Number(id));

  if (!course) {
    return (
      <section className="panel message-panel">
        <p className="eyebrow">Курс не найден</p>
        <h1>В каталоге нет записи с таким номером</h1>
        <p>Параметр маршрута: <strong>{id}</strong></p>
        <Link className="button" to="/catalog">Вернуться в каталог</Link>
      </section>
    );
  }

  return (
    <article className="panel detail-panel">
      <Link className="back-link" to="/catalog">← Все курсы</Link>
      <p className="eyebrow">Курс №{course.id}</p>
      <h1>{course.title}</h1>
      <p className="lead">{course.description}</p>
      <div className="detail-grid">
        <div><span>Преподаватель</span><strong>{course.teacher}</strong></div>
        <div><span>Продолжительность</span><strong>{course.durationHours} часов</strong></div>
        <div><span>Статус</span><strong>{course.status}</strong></div>
      </div>
    </article>
  );
}

function AboutPage() {
  return (
    <section className="panel content-panel">
      <p className="eyebrow">О проекте</p>
      <h1>Каталог учебных курсов</h1>
      <p className="lead">Учебное приложение показывает, как маршрутизация делит одностраничный интерфейс на страницы.</p>
      <p>Переходы между каталогом и карточкой курса выполняются без полной перезагрузки браузера. Адрес страницы отражает выбранный раздел.</p>
    </section>
  );
}

function RequireAuth({ isAuthenticated }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

function LoginPage({ isAuthenticated, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  function handleLogin() {
    onLogin();
    navigate(destination, { replace: true });
  }

  return (
    <section className="panel login-panel">
      <p className="eyebrow">Демонстрационный вход</p>
      <h1>Вход в личный кабинет</h1>
      <p>Кнопка имитирует успешную аутентификацию. После входа приложение вернёт вас на запрошенный защищённый маршрут.</p>
      <button className="button" type="button" onClick={handleLogin}>Войти в демонстрационном режиме</button>
    </section>
  );
}

function DashboardPage() {
  return (
    <section className="panel content-panel">
      <p className="eyebrow">Защищённый маршрут</p>
      <h1>Личный кабинет</h1>
      <p className="lead">Эта страница отображается после имитации входа.</p>
      <p>Компонент маршрута проверяет состояние авторизации до отображения вложенной страницы.</p>
      <Link className="text-link" to="/catalog">Перейти к курсам →</Link>
    </section>
  );
}

function NotFoundPage() {
  const location = useLocation();
  return (
    <section className="panel message-panel">
      <p className="eyebrow">Ошибка 404</p>
      <h1>Страница не найдена</h1>
      <p>Маршрут <strong>{location.pathname}</strong> не зарегистрирован в приложении.</p>
      <Link className="button" to="/">На главную</Link>
    </section>
  );
}

export default App;
