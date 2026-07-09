import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, Activity } from 'lucide-react';
import axios from 'axios';
import apiClient from '../api/axiosConfig';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bước 1: Gửi Email nhận OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setSuccess('');
    try {
      await apiClient.post(`/auth/forgot-password?email=${email}`);
      setSuccess('Mã OTP đã được gửi! Vui lòng kiểm tra Email (hoặc Terminal của Spring Boot).');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data || 'Không thể gửi yêu cầu. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP & Đổi mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!'); return;
    }
    
    setIsLoading(true); setError(''); setSuccess('');
    try {
      await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data || 'Mã OTP không hợp lệ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* Trang trí nền */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full opacity-50 -translate-y-1/2 translate-x-1/2"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 shadow-sm border border-blue-50">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Quên Mật Khẩu</h2>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 ? 'Nhập email của bạn để nhận mã khôi phục.' : 'Nhập mã OTP và mật khẩu mới của bạn.'}
          </p>
        </div>

        {error && <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-200 font-medium relative z-10">{error}</div>}
        {success && <div className="mb-6 p-3 rounded-xl bg-green-50 text-green-700 text-sm text-center border border-green-200 font-medium relative z-10">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email đã đăng ký</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-12 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@example.com" />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-white font-bold bg-blue-600 hover:bg-blue-700 transition">
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP (6 số)</label>
              <div className="relative">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input required type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="block w-full pl-12 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono tracking-widest text-lg" placeholder="••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input required type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full pl-12 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input required type="password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full pl-12 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-white font-bold bg-blue-600 hover:bg-blue-700 transition">
              {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'} <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2 font-medium">
              Sử dụng Email khác
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-600 relative z-10 border-t border-gray-100 pt-4">
          Nhớ mật khẩu? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}