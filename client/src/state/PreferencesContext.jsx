import React, { createContext, useContext, useMemo, useState } from 'react';

const PreferencesContext = createContext(null);

const messages = {
  ru: {
    home: 'Главная', catalog: 'Каталог', favorites: 'Избранное', about: 'О проекте',
    dashboard: 'Кабинет', propDrilling: 'Передача props', language: 'Язык',
    switchLanguage: 'EN', darkTheme: 'Тёмная тема', lightTheme: 'Светлая тема',
    favorite: 'В избранное', unfavorite: 'Убрать из избранного',
    progress: 'Прогресс обучения', increaseProgress: 'Завершить ещё 25%',
    completed: 'Курс завершён',
  },
  en: {
    home: 'Home', catalog: 'Catalog', favorites: 'Favorites', about: 'About',
    dashboard: 'Dashboard', propDrilling: 'Prop drilling', language: 'Language',
    switchLanguage: 'RU', darkTheme: 'Dark theme', lightTheme: 'Light theme',
    favorite: 'Add to favorites', unfavorite: 'Remove from favorites',
    progress: 'Learning progress', increaseProgress: 'Complete another 25%',
    completed: 'Course completed',
  },
};

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('ru');
  const value = useMemo(() => ({
    theme,
    language,
    toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
    toggleLanguage: () => setLanguage((current) => current === 'ru' ? 'en' : 'ru'),
    t: (key) => messages[language][key] || key,
  }), [language, theme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
