import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization header from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('career_mentor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle validation errors and session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend provided validation errors list, produce a clear, human-readable message
    if (error.response?.data) {
      const data = error.response.data;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const readableMessages = data.errors.map((e) => {
          if (!e.field || e.field === 'input') return e.message;
          const cleanField = e.field.replace(/_/g, ' ');
          if (e.message.toLowerCase().includes(cleanField.toLowerCase())) {
            return e.message;
          }
          return `${cleanField.charAt(0).toUpperCase() + cleanField.slice(1)}: ${e.message}`;
        });
        data.message = readableMessages.join('. ');
      }
    }

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register') &&
      window.location.pathname !== '/'
    ) {
      console.warn('Authentication expired or unauthorized access.');
    }
    return Promise.reject(error);
  }
);

export default api;
