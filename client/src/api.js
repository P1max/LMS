import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiError(error) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.code === 'ERR_CANCELED') {
    return 'Запрос отменён';
  }

  return 'Сервер недоступен. Проверьте, запущен ли API.';
}

export async function login(credentials) {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

export async function fetchCourses({ search = '', status = 'all', signal } = {}) {
  const params = {};

  if (search) {
    params.search = search;
  }

  if (status !== 'all') {
    params.status = status;
  }

  const response = await api.get('/courses', { params, signal });
  return response.data.data;
}

export async function addCourse(course) {
  const response = await api.post('/courses', course);
  return response.data.data;
}

export async function updateCourse(id, course) {
  const response = await api.put(`/courses/${id}`, course);
  return response.data.data;
}

export async function removeCourse(id) {
  await api.delete(`/courses/${id}`);
}
