import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Home, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [amount, setAmount] = useState<string>('0');
  const [orderInfo, setOrderInfo] = useState<string>('');

  useEffect(() => {
    // VNPAY trả về rất nhiều tham số, ta lấy các tham số quan trọng nhất
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_Amount = searchParams.get('vnp_Amount');
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    
    if (vnp_Amount) {
      // VNPAY nhân số tiền lên 100 lần, nên ta cần chia lại cho 100
      const actualAmount = parseInt(vnp_Amount) / 100;
      setAmount(new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(actualAmount));
    }
    
    if (vnp_OrderInfo) {
      setOrderInfo(vnp_OrderInfo);
    }

    if (vnp_ResponseCode === '00') {
      // Giao dịch thành công, gọi API để Backend cập nhật CSDL
      const queryStr = searchParams.toString();
      apiClient.get(`/payment/vnpay-return?${queryStr}`)
        .then(() => setStatus('SUCCESS'))
        .catch(() => setStatus('ERROR')); // Lỗi khi lưu CSDL
    } else {
      // Các mã khác 00 đều là thất bại hoặc hủy giao dịch
      setStatus('ERROR');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center animate-fade-in">
        
        {status === 'LOADING' && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Đang xử lý giao dịch...</h2>
            <p className="text-gray-500 mt-2 text-sm">Vui lòng không đóng trình duyệt lúc này.</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã sử dụng dịch vụ của MediCare. Lịch hẹn của bạn đã được xác nhận tự động.</p>
            
            <div className="bg-gray-50 w-full p-4 rounded-2xl mb-8 text-left space-y-2 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Số tiền thanh toán:</span>
                <span className="font-bold text-green-600 text-base">{amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nội dung:</span>
                <span className="font-medium text-gray-800 text-right line-clamp-2 w-2/3">{orderInfo}</span>
              </div>
            </div>

            <div className="flex flex-col w-full space-y-3">
              <button onClick={() => navigate('/patient-dashboard')} className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition">
                <Calendar className="w-5 h-5 mr-2" /> Xem lịch hẹn của tôi
              </button>
              <button onClick={() => navigate('/')} className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                <Home className="w-5 h-5 mr-2" /> Về Trang chủ
              </button>
            </div>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-8">Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán. Lịch hẹn chưa được xác nhận.</p>
            
            <div className="flex flex-col w-full space-y-3">
              <button onClick={() => navigate(-1)} className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition">
                Thử thanh toán lại
              </button>
              <button onClick={() => navigate('/')} className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                <Home className="w-5 h-5 mr-2" /> Về Trang chủ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}