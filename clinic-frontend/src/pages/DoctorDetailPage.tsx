
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
  specialtyId: number;
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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDoctorAndReviews = async () => {
      try {
        const [docRes, reviewRes] = await Promise.all([
          apiClient.get(`/doctors/${id || 1}`),
          apiClient.get(`/reviews/doctor/${id || 1}`)
        ]);
        setDoctor(docRes.data.result || docRes.data);
        setReviews(reviewRes.data.result || reviewRes.data);
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
        setSchedules(response.data.result || response.data);
        setSelectedScheduleId(null); 
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, [id, selectedDate]);

  const executeBooking = async () => {
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
    
    setIsBooking(true);
    setError('');
    
    try {
      const schedule = schedules.find(s => s.id === selectedScheduleId);
      if (!schedule || !doctor) return;

      await apiClient.post('/appointments', {
        specialtyId: doctor.specialtyId,
        appointmentDate: selectedDate,
        timeSlot: schedule.timeSlot,
        symptoms: symptoms
      });

      setSuccess(true);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        const responseData = err.response.data;
        const errorMessage = typeof responseData === 'string' 
          ? responseData : (responseData?.message || 'Ca khám này đã đầy.');
        setError(errorMessage);
      } else {
        setError('Có lỗi xảy ra khi đặt lịch.');
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
                      onClick={executeBooking}
                      disabled={!selectedScheduleId || isBooking}
                      className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold text-lg transition-all ${(!selectedScheduleId || isBooking) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40'}`}
                    >
                      {isBooking ? 'Đang xử lý...' : 'Xác nhận đặt khám'} <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    {!selectedScheduleId && <p className="text-center text-xs text-gray-400 mt-3">Vui lòng chọn khung giờ trước khi đặt khám</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-green-50/30">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 ring-8 ring-green-50"><CheckCircle2 className="w-12 h-12 text-green-600" /></div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Đặt lịch thành công!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">Lịch hẹn của bạn đã được ghi nhận. Bạn có thể theo dõi trong phần <strong>Hồ sơ của tôi</strong>.</p>
              <div className="flex justify-center space-x-4"><button onClick={() => navigate('/patient-dashboard')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition">Xem hồ sơ khám</button><button onClick={() => navigate('/')} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">Về Trang chủ</button></div>
            </div>
          )}
        </div>

      </div>



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