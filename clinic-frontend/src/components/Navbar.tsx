import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, User, Calendar, LogIn, ChevronDown, UserRound, Bell, Clock } from 'lucide-react';
import axios from 'axios';

// --- Cấu hình Axios ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Định nghĩa kiểu dữ liệu cho Thông báo
interface AppNotification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State cho Menu User
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State cho Menu Thông báo
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Kiểm tra đăng nhập bằng LocalStorage
  const userEmail = localStorage.getItem('userEmail');
  const role = localStorage.getItem('role');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Xử lý đóng các dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy thông báo định kỳ (Chỉ khi đã đăng nhập)
  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
      // Tự động quét thông báo mới mỗi 10 giây
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data.result || response.data);
    } catch (error) {
      console.error('Lỗi tải thông báo', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put(`/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsOpen(false);
    setIsNotifOpen(false);
    window.dispatchEvent(new Event('authChange')); // Báo cho ChatWidget biết để ngắt kết nối
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo bên trái */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
              <Activity className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="ml-3 text-2xl font-black text-gray-900 tracking-tight">
              Medi<span className="text-blue-600">Care</span>
            </span>
          </Link>

          {/* Menu chính ở giữa (Chỉ hiện trên desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className={`font-semibold transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Trang chủ</Link>
            <Link to="/doctors" className={`font-semibold transition-colors ${location.pathname === '/doctors' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Tìm Bác sĩ</Link>
            <a href="#footer" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Liên hệ</a>
          </div>

          {/* Khu vực Đăng nhập / Cá nhân bên phải */}
          <div className="flex items-center">
            {userEmail ? (
              <div className="flex items-center">
                
                {/* --- QUẢ CHUÔNG THÔNG BÁO --- */}
                <div className="relative mr-2 sm:mr-4" ref={notifRef}>
                  <button 
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsOpen(false); }}
                    className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full transition"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/80 rounded-t-xl">
                        <h3 className="font-bold text-gray-800">Thông báo</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline font-medium">Đánh dấu đã đọc tất cả</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                         {notifications.length === 0 ? (
                           <div className="p-8 text-center text-gray-500 text-sm">
                              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              Chưa có thông báo nào.
                           </div>
                         ) : (
                           notifications.map(n => (
                             <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)} className={`p-4 hover:bg-gray-50 cursor-pointer transition ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                               <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                               <p className="text-xs text-gray-400 mt-2 flex items-center">
                                 <Clock className="w-3 h-3 mr-1" /> {new Date(n.createdAt).toLocaleString('vi-VN')}
                               </p>
                             </div>
                           ))
                         )}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- MENU NGƯỜI DÙNG --- */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => { setIsOpen(!isOpen); setIsNotifOpen(false); }}
                    className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors border border-gray-200"
                  >
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-700 hidden sm:block max-w-[120px] truncate">{userEmail}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 animate-fade-in origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50 rounded-t-xl">
                        <p className="text-xs text-gray-500 font-medium">Đang đăng nhập với</p>
                        <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{userEmail}</p>
                      </div>

                      {role === 'ADMIN' ? (
                         <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition font-medium">
                           <Activity className="w-4 h-4 mr-3" /> Trang Quản trị
                         </Link>
                      ) : role === 'DOCTOR' ? (
                         <Link to="/doctor-portal" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition font-medium">
                           <Activity className="w-4 h-4 mr-3" /> Bảng Điều Khiển
                         </Link>
                      ) : (
                         <Link to="/patient-dashboard" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition font-medium">
                           <Calendar className="w-4 h-4 mr-3 text-blue-500" /> Hồ sơ & Lịch khám
                         </Link>
                      )}

                      <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition font-medium">
                        <UserRound className="w-4 h-4 mr-3 text-green-500" /> Thông tin cá nhân
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="hidden sm:flex items-center px-4 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
                  <LogIn className="w-4 h-4 mr-2" /> Đăng ký ngay
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}