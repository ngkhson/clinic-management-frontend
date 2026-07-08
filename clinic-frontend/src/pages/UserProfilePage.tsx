import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Phone, MapPin, Calendar as CalendarIcon, Save, Activity, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '', email: '', phone: '', gender: 'MALE', dateOfBirth: '', address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- STATE CHO TÍNH NĂNG ĐỔI MẬT KHẨU ---
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/users/profile');
        setProfile(res.data.result || res.data);
      } catch (error) {
        console.error('Lỗi tải hồ sơ:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.patch('/users/profile', profile);
      setMessage({ text: 'Cập nhật thông tin cá nhân thành công!', type: 'success' });
      // Phát sự kiện để cập nhật lại tên hiển thị trên Navbar nếu cần
      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      setMessage({ text: 'Cập nhật thất bại. Vui lòng kiểm tra lại!', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // --- HÀM XỬ LÝ GỌI API ĐỔI MẬT KHẨU ---
  const handlePwdChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if(pwdForm.newPassword !== pwdForm.confirmPassword) {
       setPwdMessage({text: 'Mật khẩu xác nhận không khớp!', type: 'error'}); return;
    }
    setIsChangingPwd(true);
    try {
        await apiClient.patch('/users/change-password', {
            oldPassword: pwdForm.oldPassword,
            newPassword: pwdForm.newPassword
        });
        setPwdMessage({text: 'Đổi mật khẩu thành công!', type: 'success'});
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Xóa trắng form sau khi thành công
    } catch (err: any) {
        // Backend ném lỗi (ví dụ: Mật khẩu cũ không đúng)
        setPwdMessage({text: err.response?.data || 'Đổi mật khẩu thất bại', type: 'error'});
    } finally {
        setIsChangingPwd(false);
        // Xóa thông báo sau 3 giây
        setTimeout(() => setPwdMessage({text: '', type: ''}), 3000);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>

        {/* --- SECTION 1: CẬP NHẬT THÔNG TIN CÁ NHÂN --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="relative z-10 flex items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 mr-6">
                <UserCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.fullName || 'Hồ sơ của bạn'}</h1>
                <p className="text-blue-100 mt-1 opacity-90 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5" /> Quản lý thông tin cá nhân
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl font-medium text-sm flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" name="fullName" required value={profile.fullName} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email đăng nhập</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" value={profile.email} disabled className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed outline-none" title="Không thể thay đổi email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="tel" name="phone" required value={profile.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giới tính</label>
                <select name="gender" value={profile.gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ liên hệ</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                  <textarea name="address" rows={3} value={profile.address} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="submit" disabled={isSaving} className={`flex items-center px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}>
                {isSaving ? 'Đang lưu...' : <><Save className="w-5 h-5 mr-2" /> Lưu Thông Tin</>}
              </button>
            </div>
          </form>
        </div>

        {/* --- SECTION 2: GIAO DIỆN ĐỔI MẬT KHẨU --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <KeyRound className="w-6 h-6 mr-2 text-blue-600" /> Đổi mật khẩu bảo mật
            </h2>
          </div>
          <form onSubmit={handlePwdChange} className="p-8">
            {pwdMessage.text && (
              <div className={`mb-6 p-4 rounded-xl font-medium text-sm flex items-center ${pwdMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {pwdMessage.text}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" required value={pwdForm.oldPassword} onChange={e => setPwdForm({...pwdForm, oldPassword: e.target.value})} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nhập mật khẩu cũ..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" required minLength={6} value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ít nhất 6 ký tự" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" required minLength={6} value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nhập lại mật khẩu mới" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="submit" disabled={isChangingPwd} className={`flex items-center px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm ${isChangingPwd ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black hover:shadow-lg'}`}>
                {isChangingPwd ? 'Đang cập nhật...' : 'Cập nhật Mật khẩu'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}