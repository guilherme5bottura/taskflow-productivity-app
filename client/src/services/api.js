import axios from 'axios';

// Utiliza variável de ambiente VITE_API_URL se definida, ou '/api' por padrão
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL
});

// Interceptor para injetar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para redirecionar para login caso o token tenha expirado (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (localStorage.getItem('taskflow_token')) {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
