import React from 'react';
import { LearningProvider } from './LearningContext.jsx';
import { PreferencesProvider } from './PreferencesContext.jsx';

export default function AppProviders({ children }) {
  return (
    <PreferencesProvider>
      <LearningProvider>{children}</LearningProvider>
    </PreferencesProvider>
  );
}
