
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, MemoryRouter, Routes, Route } from 'react-router-dom';
import { 
  UserRound, Calendar as CalendarIcon, Clock, CreditCard, 
  ArrowRight, CheckCircle2, Star, MessageSquareQuote, ShieldCheck, X 
} from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Doctor {
  id: number;
  fullName: string;
  specialtyName: string;
  degree: string;
  biography: string;
}

interface Schedule {
  id: number;
  timeSlot: string;
  currentPatients: number;
  maxPatients: number;
  available: boolean;
}

interface Review {
  id: number;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function DoctorDetailPageContent() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); 
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Trạng thái modal Thanh toán
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDoctorAndReviews = async () => {
      try {
        const [docRes, reviewRes] = await Promise.all([
          apiClient.get(`/doctors/${id || 1}`),
          apiClient.get(`/reviews/doctor/${id || 1}`)
        ]);
        setDoctor(docRes.data);
        setReviews(reviewRes.data);
      } catch (err) {
        setError('Không thể tải thông tin bác sĩ.');
      }
    };
    fetchDoctorAndReviews();
  }, [id]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedDate) return;
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/schedules/doctor/${id || 1}?date=${selectedDate}`);
        setSchedules(response.data);
        setSelectedScheduleId(null); 
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, [id, selectedDate]);

  // BƯỚC 1: Hiện bảng chọn phương thức thanh toán
  const handleProceedToPayment = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt lịch khám!');
      navigate('/login');
      return;
    }
    if (!selectedScheduleId) {
      setError('Vui lòng chọn khung giờ khám!');
      return;
    }
    setError('');
    setShowPaymentOptions(true);
  };

  // BƯỚC 2: Gọi API lưu lịch hẹn và nhận URL thanh toán thật
  const executeBooking = async (paymentType: 'PAY_LATER' | 'PAY_NOW') => {
    setIsBooking(true);
    try {
      // Gọi API đặt lịch, gửi kèm phương thức thanh toán để Backend xử lý
      const response = await apiClient.post('/appointments', {
        doctorId: parseInt(id || '1'),
        scheduleId: selectedScheduleId,
        symptoms: symptoms,
        paymentType: paymentType // 'PAY_NOW' hoặc 'PAY_LATER'
      });

      if (paymentType === 'PAY_NOW') {
        // KIỂM TRA: Nếu Backend trả về URL thanh toán (Ví dụ từ VNPAY)
        if (response.data && response.data.paymentUrl) {
          // Điều hướng người dùng sang trang thanh toán của VNPAY/Ngân hàng
          window.location.href = response.data.paymentUrl;
        } else {
          // Fallback hiển thị nếu Backend chưa tích hợp xong phần trả URL
          alert('Đang chờ hệ thống tạo link thanh toán...');
          setTimeout(() => {
            setSuccess(true);
            setShowPaymentOptions(false);
          }, 1500);
        }
      } else {
        // Thanh toán sau tại quầy
        setSuccess(true);
        setShowPaymentOptions(false);
      }
      
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        const responseData = err.response.data;
        const errorMessage = typeof responseData === 'string' 
          ? responseData : (responseData?.message || 'Ca khám này đã đầy.');
        setError(errorMessage);
        setShowPaymentOptions(false);
      } else {
        setError('Có lỗi xảy ra khi đặt lịch.');
        setShowPaymentOptions(false);
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (error && !doctor) return <div className="text-center mt-20 text-red-500 font-medium">{error}</div>;
  if (!doctor) return <div className="text-center mt-20 text-gray-500">Đang tải thông tin...</div>;

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6 inline-block font-medium">
          &larr; Quay lại danh sách
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-fade-in">
          {/* Header Bác sĩ */}
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="w-24 h-24 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center shrink-0 relative z-10 shadow-sm"><UserRound className="w-10 h-10 text-blue-500" /></div>
            <div className="relative z-10 flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{doctor.degree} {doctor.fullName}</h1>
                  <p className="text-blue-600 font-medium mt-1">{doctor.specialtyName}</p>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1.5" />
                    <span className="font-bold text-yellow-700">{averageRating}</span>
                    <span className="text-yellow-600 text-sm ml-1.5 border-l border-yellow-200 pl-1.5">({reviews.length} đánh giá)</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-4 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{doctor.biography || 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}</p>
            </div>
          </div>

          {/* Form Đặt lịch */}
          {!success ? (
            <div className="p-8 bg-white relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-blue-600" /> Đặt lịch khám</h2>
              
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> {error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">1. Chọn ngày khám</label>
                  <div className="relative mb-6">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
                    <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 shadow-sm" />
                  </div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">2. Chọn khung giờ</label>
                  {isLoading ? <div className="text-sm text-gray-500 text-center py-4">Đang tải lịch làm việc...</div> : schedules.length === 0 ? <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 text-center">Bác sĩ không có lịch làm việc vào ngày này.</div> : (
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {schedules.map((sch) => {
                        const isAvail = sch.available !== undefined ? sch.available : (sch as any).isAvailable !== false;
                        const isSelected = selectedScheduleId === sch.id;
                        return (
                          <button key={sch.id} disabled={!isAvail} onClick={() => setSelectedScheduleId(sch.id)} className={`flex items-center justify-center px-4 py-3 rounded-xl border text-sm font-bold transition-all ${!isAvail ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200 ring-offset-1' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}>
                            <Clock className={`w-4 h-4 mr-2 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`} />{sch.timeSlot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-bold text-gray-700 mb-2">3. Triệu chứng lâm sàng (tùy chọn)</label>
                  <textarea rows={5} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Mô tả ngắn gọn lý do đi khám..." className="block w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-6 shadow-sm bg-gray-50/50"></textarea>

                  <div className="mt-auto">
                    <button
                      onClick={handleProceedToPayment}
                      disabled={!selectedScheduleId}
                      className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold text-lg transition-all ${!selectedScheduleId ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40'}`}
                    >
                      Xác nhận đặt khám <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    {!selectedScheduleId && <p className="text-center text-xs text-gray-400 mt-3">Vui lòng chọn khung giờ trước khi đặt khám</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-green-50/30">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 ring-8 ring-green-50"><CheckCircle2 className="w-12 h-12 text-green-600" /></div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Đặt lịch & Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">Lịch hẹn của bạn đã được ghi nhận. Bạn có thể theo dõi trong phần <strong>Hồ sơ của tôi</strong>.</p>
              <div className="flex justify-center space-x-4"><button onClick={() => navigate('/patient-dashboard')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition">Xem hồ sơ khám</button><button onClick={() => navigate('/')} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">Về Trang chủ</button></div>
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL CHỌN PHƯƠNG THỨC THANH TOÁN --- */}
      {showPaymentOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6 border-b border-gray-100 text-center relative">
               <button onClick={() => setShowPaymentOptions(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5"/></button>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán phí khám</h3>
               <p className="text-gray-500 text-sm">Vui lòng chọn hình thức thanh toán để giữ chỗ.</p>
             </div>
             
             <div className="p-6 bg-gray-50/50 space-y-4">
               {/* Nút thanh toán Online */}
               <button 
                 onClick={() => executeBooking('PAY_NOW')} disabled={isBooking}
                 className="w-full flex items-center p-4 bg-white border-2 border-blue-500 rounded-2xl hover:bg-blue-50 transition-colors group text-left"
               >
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-bold text-blue-700 text-lg">Thanh toán trực tuyến</h4>
                   <p className="text-sm text-gray-500 mt-1">Qua VNPAY, MoMo, Thẻ tín dụng/ATM</p>
                 </div>
                 <ArrowRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
               </button>

               {/* Nút thanh toán tại quầy */}
               <button 
                 onClick={() => executeBooking('PAY_LATER')} disabled={isBooking}
                 className="w-full flex items-center p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-400 transition-colors group text-left"
               >
                 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-gray-600" />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-bold text-gray-700 text-lg">Thanh toán tại quầy</h4>
                   <p className="text-sm text-gray-500 mt-1">Đến phòng khám thanh toán sau</p>
                 </div>
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Giữ nguyên đoạn bọc Router như trước...
const isPreviewEnv = typeof window !== 'undefined' && window.location.href.includes('usercontent.goog');
export default function DoctorDetailPage() {
  if (isPreviewEnv) {
    return (
      <MemoryRouter initialEntries={['/doctor/1']}>
        <Routes><Route path="/doctor/:id" element={<DoctorDetailPageContent />} /><Route path="*" element={<DoctorDetailPageContent />} /></Routes>
      </MemoryRouter>
    );
  }
  return <DoctorDetailPageContent />;
}