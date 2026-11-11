import React, { createContext, useContext, useEffect, useReducer } from 'react';

const STORAGE_KEY = 'lms-learning-state';
const LearningStateContext = createContext(null);
const LearningDispatchContext = createContext(null);
const emptyState = { favorites: [], progress: {} };

function readInitialState() {
  if (typeof localStorage === 'undefined') return emptyState;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return emptyState;
    const favorites = Array.isArray(saved.favorites)
      ? [...new Set(saved.favorites.filter(Number.isSafeInteger))]
      : [];
    const progress = {};
    if (saved.progress && typeof saved.progress === 'object') {
      for (const [id, value] of Object.entries(saved.progress)) {
        const number = Number(value);
        if (/^[1-9]\d*$/.test(id) && Number.isFinite(number)) {
          progress[id] = Math.min(100, Math.max(0, Math.round(number)));
        }
      }
    }
    return { favorites, progress };
  } catch (_error) {
    return emptyState;
  }
}

export function learningReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.includes(action.courseId);
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((id) => id !== action.courseId)
          : [...state.favorites, action.courseId],
      };
    }
    case 'SET_PROGRESS': {
      const value = Math.min(100, Math.max(0, Math.round(Number(action.value) || 0)));
      return { ...state, progress: { ...state.progress, [action.courseId]: value } };
    }
    default:
      return state;
  }
}

export function LearningProvider({ children }) {
  const [state, dispatch] = useReducer(learningReducer, undefined, readInitialState);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      // Browser storage can be unavailable; in-memory state still works.
    }
  }, [state]);

  return (
    <LearningStateContext.Provider value={state}>
      <LearningDispatchContext.Provider value={dispatch}>{children}</LearningDispatchContext.Provider>
    </LearningStateContext.Provider>
  );
}

export function useLearningState() {
  const context = useContext(LearningStateContext);
  if (!context) throw new Error('useLearningState must be used inside LearningProvider');
  return context;
}

export function useLearningDispatch() {
  const context = useContext(LearningDispatchContext);
  if (!context) throw new Error('useLearningDispatch must be used inside LearningProvider');
  return context;
}
