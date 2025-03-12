import axios from 'axios';
import https from 'https';

const baseURL = process.env.NODE_ENV === 'development'
  ? 'https://54.163.197.147:8443/api'
  : 'https://54.163.197.147:8443/api';

// Create an axios instance with the base URL for our API
const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    requestCert: false
  })
});

// Add a request interceptor to add the token to the headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 