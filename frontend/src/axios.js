import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: 'Request timed out. The server might be overloaded or unavailable.'
});

// Request interceptor: log outgoing requests
instance.interceptors.request.use(
  (config) => {
    console.log('[Axios][Request]', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    console.error('[Axios][Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle errors and log successful responses
instance.interceptors.response.use(
  (response) => {
    console.log('[Axios][Response Success]', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('[Axios][Response Error]', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
    if (typeof toast === 'function' && error.response) {
      const message = error.response?.data?.message || error.message || 'An error occurred.';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default instance;
