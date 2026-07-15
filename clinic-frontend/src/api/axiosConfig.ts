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

// Setup cờ để biết xem hệ thống có đang gọi refresh token không
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor: Bắt các response có HTTP 200 nhưng bên trong chứa code báo lỗi (VD: code 400)
apiClient.interceptors.response.use(
  (response) => {
    // Nếu backend trả về code báo lỗi (VD: 400, 404, 500) mà không phải 1000 (success) hoặc 200
    if (response.data && typeof response.data.code === 'number' && response.data.code !== 1000 && response.data.code !== 200) {
      // Xử lý riêng biệt cho lỗi 401 Unauthorized từ code tùy chỉnh của Backend (dù HTTP có thể là 200)
      if (response.data.code === 401) {
         // Trả về error để catch ở interceptor bên dưới
         return Promise.reject({ response: { status: 401, data: response.data } });
      }

      return Promise.reject({
        response: {
          status: response.data.code,
          data: response.data
        }
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu HTTP code thực sự là 401 (Unauthorized) HOẶC mã code backend là 401 (như đã bọc ở trên)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Bỏ qua nếu là đường dẫn đăng nhập hoặc đang gọi chính refresh-token (để tránh vòng lặp vô hạn)
      if (originalRequest.url.includes('/auth/authenticate') || originalRequest.url.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      // Nếu đang trong quá trình refresh, đưa request vào hàng chờ
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest); // Chạy lại request đã được gán token mới
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Đánh dấu request này đã retry để tránh lặp vô hạn
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
         isRefreshing = false;
         // Văng ra trang login luôn nếu ko có refresh token
         localStorage.clear();
         window.location.href = '/login';
         return Promise.reject(error);
      }

      try {
        // GỌI API LẤY TOKEN MỚI (chú ý dùng axios mặc định để không bị interceptor bọc lại sinh vòng lặp)
        const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        // Lấy token mới
        const newResult = data.result || data;
        const newToken = newResult.token;
        const newRefreshToken = newResult.refreshToken || refreshToken; // Giữ token cũ nếu ko có cái mới

        // Cập nhật lại kho lưu trữ
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Gán token mới cho default header và request hiện tại
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Xử lý các request đang xếp hàng
        processQueue(null, newToken);

        // Chạy lại request hiện tại
        return apiClient(originalRequest);

      } catch (err) {
        processQueue(err, null);
        // Nếu refresh token cũng thất bại (ví dụ: refreshToken đã hết hạn), bắt buộc đăng nhập lại
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        // Xong xuôi thì reset cờ
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;