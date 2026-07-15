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

// Interceptor: Bắt các response có HTTP 200 nhưng bên trong chứa code báo lỗi (VD: code 400)
apiClient.interceptors.response.use(
  (response) => {
    // Nếu backend trả về code báo lỗi (VD: 400, 404, 500) mà không phải 1000 (success) hoặc 200
    if (response.data && typeof response.data.code === 'number' && response.data.code !== 1000 && response.data.code !== 200) {
      return Promise.reject({
        response: {
          status: response.data.code,
          data: response.data
        }
      });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;