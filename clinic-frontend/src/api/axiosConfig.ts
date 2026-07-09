// src/api/axiosConfig.ts
import axios from 'axios';

// Tạo một instance (bản sao) của axios với cấu hình riêng
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', // Địa chỉ Spring Boot từ biến môi trường
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor (Kẻ đánh chặn): Tự động lấy token từ LocalStorage gắn vào Request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;