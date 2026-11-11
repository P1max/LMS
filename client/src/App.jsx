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
import { useLearningDispatch, useLearningState } from './state/LearningContext.jsx';
import { usePreferences } from './state/PreferencesContext.jsx';

const courses = [
  { id: 1, title: 'Основы веб-разработки', description: 'HTML, CSS и первые интерактивные страницы.', teacher: 'Анна Петрова', durationHours: 36, status: 'Опубликован' },
  { id: 2, title: 'Node.js и Express', description: 'Серверные приложения и интерфейсы для клиентов.', teacher: 'Иван Соколов', durationHours: 48, status: 'Черновик' },
  { id: 3, title: 'Основы баз данных', description: 'Модели данных, запросы и связи между сущностями.', teacher: 'Мария Орлова', durationHours: 42, status: 'Опубликован' },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Routes>
      <Route element={<MainLayout userName="Алексей Перко" />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/:id" element={<CoursePage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="prop-drilling" element={<PropDrillingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="login" element={<LoginPage isAuthenticated={isAuthenticated} onLogin={() => setIsAuthenticated(true)} />} />
        <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function MainLayout({ userName }) {
  const preferences = usePreferences();
  return (
    <div className={`app-shell theme-${preferences.theme}`}>
      <Header userName={userName} preferences={preferences} />
      <main className="page-content"><Outlet /></main>
      <footer className="site-footer">LMS · {preferences.language === 'ru' ? 'состояние учебного каталога' : 'learning catalog state'}</footer>
    </div>
  );
}

function Header({ userName, preferences }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/">LMS Courses</Link>
        <Navigation userName={userName} preferences={preferences} />
      </div>
    </header>
  );
}

function Navigation({ userName, preferences }) {
  const { t, theme, toggleTheme, toggleLanguage } = preferences;
  return (
    <nav className="main-nav" aria-label={t('home')}>
      <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('home')}</NavLink>
      <NavLink to="/catalog" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('catalog')}</NavLink>
      <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('favorites')}</NavLink>
      <NavLink to="/prop-drilling" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('propDrilling')}</NavLink>
      <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('about')}</NavLink>
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('dashboard')}</NavLink>
      <button className="header-control" type="button" onClick={toggleTheme}>
        {theme === 'light' ? t('darkTheme') : t('lightTheme')}
      </button>
      <button className="header-control" type="button" onClick={toggleLanguage}>
        {t('language')}: {t('switchLanguage')}
      </button>
      <UserMenu userName={userName} />
    </nav>
  );
}

function UserMenu({ userName }) {
  return <div className="user-menu"><UserAvatar userName={userName} /></div>;
}

function UserAvatar({ userName }) {
  return (
    <span className="user-avatar" aria-label={`Пользователь: ${userName}`}>
      <span className="avatar-mark" aria-hidden="true">{userName.slice(0, 1)}</span>
      <span>{userName}</span>
    </span>
  );
}

function HomePage() {
  const { t } = usePreferences();
  return (
    <section className="hero panel">
      <p className="eyebrow">Learning management system</p>
      <h1>Учитесь в удобном темпе</h1>
      <p className="lead">Каталог курсов, подробные страницы и общее состояние обучения собраны в одном приложении.</p>
      <Link className="button" to="/catalog">{t('catalog')}</Link>
    </section>
  );
}

function CatalogPage() {
  const { t } = usePreferences();
  const { favorites } = useLearningState();
  return (
    <section>
      <div className="section-heading">
        <div><p className="eyebrow">Обучение</p><h1>{t('catalog')}</h1></div>
        <span className="count-badge">{courses.length} курса · {favorites.length} в избранном</span>
      </div>
      <div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
    </section>
  );
}

function CourseCard({ course }) {
  const { favorites } = useLearningState();
  const dispatch = useLearningDispatch();
  const { t } = usePreferences();
  const isFavorite = favorites.includes(course.id);
  return (
    <article className="course-card panel">
      <div className="card-topline"><span className="status-badge">{course.status}</span><span className="course-id">#{course.id}</span></div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <dl className="course-meta">
        <div><dt>Преподаватель</dt><dd>{course.teacher}</dd></div>
        <div><dt>Продолжительность</dt><dd>{course.durationHours} ч.</dd></div>
      </dl>
      <div className="card-actions">
        <Link className="text-link" to={`/catalog/${course.id}`}>Подробнее <span aria-hidden="true">→</span></Link>
        <button className={`favorite-button${isFavorite ? ' selected' : ''}`} type="button" aria-pressed={isFavorite}
          onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', courseId: course.id })}>
          {isFavorite ? '★' : '☆'} {isFavorite ? t('unfavorite') : t('favorite')}
        </button>
      </div>
    </article>
  );
}

function CoursePage() {
  const { id } = useParams();
  const course = courses.find((item) => item.id === Number(id));
  const { t } = usePreferences();
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
      <CourseFavoriteButton courseId={course.id} />
      <CourseProgress courseId={course.id} t={t} />
    </article>
  );
}

function CourseFavoriteButton({ courseId }) {
  const { favorites } = useLearningState();
  const dispatch = useLearningDispatch();
  const { t } = usePreferences();
  const isFavorite = favorites.includes(courseId);
  return (
    <button className={`favorite-button detail-favorite${isFavorite ? ' selected' : ''}`} type="button" aria-pressed={isFavorite}
      onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', courseId })}>
      {isFavorite ? '★' : '☆'} {isFavorite ? t('unfavorite') : t('favorite')}
    </button>
  );
}

function CourseProgress({ courseId, t }) {
  const { progress } = useLearningState();
  const dispatch = useLearningDispatch();
  const value = progress[courseId] || 0;
  return (
    <section className="progress-card" aria-label={t('progress')}>
      <div className="progress-heading"><h2>{t('progress')}</h2><strong>{value}%</strong></div>
      <progress max="100" value={value}>{value}%</progress>
      {value === 100
        ? <p className="completed-message" role="status">{t('completed')}</p>
        : <button className="button secondary-button" type="button"
            onClick={() => dispatch({ type: 'SET_PROGRESS', courseId, value: value + 25 })}>{t('increaseProgress')}</button>}
    </section>
  );
}

function FavoritesPage() {
  const { favorites } = useLearningState();
  const { t } = usePreferences();
  const favoriteCourses = courses.filter((course) => favorites.includes(course.id));
  return (
    <section>
      <div className="section-heading"><div><p className="eyebrow">LMS</p><h1>{t('favorites')}</h1></div></div>
      {favoriteCourses.length
        ? <div className="course-grid">{favoriteCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
        : <div className="panel empty-panel"><p>В избранном пока нет курсов.</p><Link className="button" to="/catalog">{t('catalog')}</Link></div>}
    </section>
  );
}

function PropDrillingPage() {
  return (
    <section className="panel content-panel">
      <p className="eyebrow">Передача данных через свойства</p>
      <h1>Цепочка prop drilling</h1>
      <p>Имя пользователя доходит до аватара через промежуточные компоненты. Шапка и меню передают значение дальше, хотя сами не используют имя для своей логики.</p>
      <ol className="drilling-chain">
        <li>App передаёт userName в MainLayout.</li>
        <li>MainLayout передаёт его в Header.</li>
        <li>Header передаёт его в Navigation.</li>
        <li>Navigation передаёт его в UserMenu.</li>
        <li>UserMenu передаёт его в UserAvatar.</li>
      </ol>
      <p>Цепочка показана намеренно. Для темы и языка используется контекст, который позволяет нужным компонентам получить значение напрямую.</p>
    </section>
  );
}

function AboutPage() {
  const { t } = usePreferences();
  return (
    <section className="panel content-panel">
      <p className="eyebrow">LMS</p>
      <h1>{t('about')}</h1>
      <p>Учебное приложение показывает каталог курсов, динамические страницы и инструменты персонального обучения.</p>
      <p>Тема, язык, избранные курсы и прогресс доступны на разных страницах без передачи одинаковых свойств через всё дерево компонентов.</p>
    </section>
  );
}

function RequireAuth({ isAuthenticated }) {
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function LoginPage({ isAuthenticated, onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.from?.pathname || '/dashboard';
  if (isAuthenticated) return <Navigate to={destination} replace />;
  return (
    <section className="panel login-panel">
      <p className="eyebrow">Вход</p>
      <h1>Демонстрационная авторизация</h1>
      <p>Кнопка устанавливает локальный флаг входа и возвращает на запрошенную страницу.</p>
      <button className="button" type="button" onClick={() => { onLogin(); navigate(destination, { replace: true }); }}>
        Войти в учебный кабинет
      </button>
    </section>
  );
}

function DashboardPage() {
  return <section className="panel content-panel"><p className="eyebrow">Доступ после входа</p><h1>Личный кабинет</h1><p>Маршрут доступен после демонстрационной авторизации.</p></section>;
}

function NotFoundPage() {
  return (
    <section className="panel message-panel">
      <p className="eyebrow">404</p><h1>Страница не найдена</h1>
      <p>В приложении нет маршрута с таким адресом.</p><Link className="button" to="/">На главную</Link>
    </section>
  );
}

export default App;
