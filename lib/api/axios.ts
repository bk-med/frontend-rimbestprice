import axios from 'axios';

// Create an axios instance with the base URL for our API
const api = axios.create({
  baseURL: 'http://44.203.171.26:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token to the headers
api.interceptors.request.use(
  (config) => {
    // Liste des routes publiques qui ne nécessitent pas de token
    const publicRoutes = ['/auth/signin', '/auth/signup'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors for protected routes but allow public routes to continue
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error:', error.response.data);
      // We don't redirect or clear token here - let the application handle it contextually
    }
    return Promise.reject(error);
  }
);

export default api; 