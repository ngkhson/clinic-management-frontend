
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, MemoryRouter, Routes, Route } from 'react-router-dom';
import { 
  UserRound, Calendar as CalendarIcon, Clock, CreditCard, 
  ArrowRight, CheckCircle2, Star, MessageSquareQuote, ShieldCheck, X 
} from 'lucide-react';
import axios from 'axios';
import apiClient from '../api/axiosConfig';

interface Doctor {
  id: number;
  fullName: string;
  specialtyId: number;
  specialtyName: string;
  degree: string;
  biography: string;
  imageUrl?: string;
  averageRating: number;
  reviewCount: number;
  clinicAddress: string;
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

  const isTimeSlotValid = (dateStr: string, timeSlotStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateStr);
    selected.setHours(0, 0, 0, 0);
    
    if (selected > today) return true;
    if (selected < today) return false;
    
    const startStr = timeSlotStr.split('-')[0].trim();
    const [hours, minutes] = startStr.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    return slotTime.getTime() >= Date.now() - 15 * 60 * 1000;
  };

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
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-70 -translate-y-1/2 translate-x-1/4 pointer-events-none blur-3xl"></div>
            <div className="w-28 h-28 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center shrink-0 relative z-10 shadow-lg overflow-hidden">
              {doctor.imageUrl ? (
                <img src={doctor.imageUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
              ) : (
                <UserRound className="w-12 h-12 text-indigo-400" />
              )}
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{doctor.degree} {doctor.fullName}</h1>
                  <p className="text-indigo-600 font-semibold mt-1">{doctor.specialtyName}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1.5" />
                    <span className="font-bold text-amber-700">{doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : 'Chưa có'}</span>
                    <span className="text-amber-600/70 text-sm ml-1.5 border-l border-amber-200/50 pl-1.5">({doctor.reviewCount} đánh giá)</span>
                  </div>
                  <div className="text-sm text-gray-500 font-medium flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                    {doctor.clinicAddress || 'Cơ sở chính'}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-5 leading-relaxed bg-gray-50/80 p-5 rounded-2xl border border-gray-100/80 text-sm">
                {doctor.biography || 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
              </p>
            </div>
          </div>

          {/* Form Đặt lịch */}
          {!success ? (
            <div className="p-8 bg-white relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><CalendarIcon className="w-6 h-6 mr-2 text-indigo-600 p-1 bg-indigo-50 rounded-lg" /> Đặt lịch khám</h2>
              
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> {error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <label className="block text-sm font-bold text-gray-800 mb-3">1. Chọn ngày khám</label>
                  <div className="relative mb-8 group">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                    <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-gray-700 shadow-sm transition-all" />
                  </div>

                  <label className="block text-sm font-bold text-gray-800 mb-3">2. Chọn khung giờ</label>
                  {isLoading ? <div className="text-sm text-gray-500 text-center py-6 bg-white rounded-2xl border border-gray-100">Đang tải lịch làm việc...</div> : schedules.length === 0 ? <div className="text-sm text-rose-500 bg-rose-50 p-5 rounded-2xl border border-rose-100 text-center font-medium">Bác sĩ không có lịch làm việc vào ngày này.</div> : (
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {schedules.map((sch) => {
                        let isAvail = sch.available !== undefined ? sch.available : (sch as any).isAvailable !== false;
                        if (isAvail) {
                          isAvail = isTimeSlotValid(selectedDate, sch.timeSlot);
                        }
                        const isSelected = selectedScheduleId === sch.id;
                        return (
                          <button key={sch.id} disabled={!isAvail} onClick={() => setSelectedScheduleId(sch.id)} className={`flex items-center justify-center px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all ${!isAvail ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-70' : isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_8px_16px_rgb(79,70,229,0.2)] scale-[1.02]' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 hover:scale-[1.02]'}`}>
                            <Clock className={`w-4 h-4 mr-2 ${isSelected ? 'text-indigo-200' : 'text-gray-400 group-hover:text-indigo-400'}`} />{sch.timeSlot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-bold text-gray-800 mb-3">3. Triệu chứng lâm sàng (tùy chọn)</label>
                  <textarea rows={6} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Mô tả ngắn gọn lý do đi khám để bác sĩ chuẩn bị tốt hơn..." className="block w-full px-5 py-4 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none mb-8 shadow-sm bg-white transition-all text-gray-700"></textarea>

                  <div className="mt-auto bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                    <button
                      onClick={executeBooking}
                      disabled={!selectedScheduleId || isBooking}
                      className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold text-lg transition-all ${(!selectedScheduleId || isBooking) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_20px_rgb(79,70,229,0.25)] hover:-translate-y-0.5'}`}
                    >
                      {isBooking ? 'Đang xử lý...' : 'Xác nhận đặt khám'} <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    {!selectedScheduleId && <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center"><CalendarIcon className="w-3 h-3 mr-1" /> Vui lòng chọn khung giờ trước khi đặt khám</p>}
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

        {/* Đánh giá của bệnh nhân */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <MessageSquareQuote className="w-6 h-6 mr-2 text-indigo-600 p-1 bg-indigo-50 rounded-lg" /> 
            Phản hồi từ bệnh nhân ({reviews.length})
          </h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Chưa có đánh giá nào cho bác sĩ này.
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{review.patientName}</h4>
                      <div className="text-xs text-gray-500 mt-0.5">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && review.comment.trim() !== "" && (
                    <p className="text-gray-600 text-sm mt-3 bg-gray-50 p-4 rounded-xl">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))}
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