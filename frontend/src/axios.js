import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: log outgoing requests
instance.interceptors.request.use(
  (config) => {
    console.log('[Axios][Request]', config);
    return config;
  },
  (error) => {
    console.error('[Axios][Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Axios][Response Error]', error);
    if (typeof toast === 'function') {
      const message = error.response?.data?.message || error.message || 'An error occurred.';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default instance;
