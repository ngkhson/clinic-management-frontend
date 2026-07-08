import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, LogOut, User, Calendar } from 'lucide-react';
import axios from 'axios';

// Import các component con đã tách
import PatientAppointmentList from '../components/patient/PatientAppointmentList';
import PatientRecordModal, { type MedicalRecord } from '../components/patient/PatientRecordModal';
import PatientReviewModal from '../components/patient/PatientReviewModal';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Appointment {
  id: number;
  doctorName: string;
  timeSlot: string;
  appointmentDate: string;
  status: string;
  symptoms: string;
}

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States cho Record Modal (Xem bệnh án)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isRecordLoading, setIsRecordLoading] = useState(false);

  // States cho Review Modal (Đánh giá)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedApptForReview, setSelectedApptForReview] = useState<Appointment | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const userEmail = localStorage.getItem('userEmail') || 'Bệnh nhân';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'PATIENT') {
      navigate('/login');
    } else {
      fetchAppointments();
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/patient/appointments');
      // Sắp xếp ngày gần nhất & id lớn nhất lên đầu
      const sorted = (res.data.result || res.data).sort((a: any, b: any) => b.id - a.id);
      setAppointments(sorted);
    } catch (error) {
      console.error('Lỗi tải lịch hẹn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- XỬ LÝ XEM HỒ SƠ BỆNH ÁN ---
  const handleViewRecord = async (id: number) => {
    setIsRecordModalOpen(true);
    setIsRecordLoading(true);
    setSelectedRecord(null);
    try {
      const res = await apiClient.get(`/patient/appointments/${id}/record`);
      setSelectedRecord(res.data.result || res.data);
    } catch (error) {
      alert('Lịch hẹn này chưa có hồ sơ bệnh án hoặc đã xảy ra lỗi!');
      setIsRecordModalOpen(false);
    } finally {
      setIsRecordLoading(false);
    }
  };

  // --- XỬ LÝ ĐÁNH GIÁ BÁC SĨ ---
  const handleOpenReview = (appt: Appointment) => {
    setSelectedApptForReview(appt);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedApptForReview) return;
    setIsSubmittingReview(true);
    try {
      await apiClient.post('/reviews', {
        appointmentId: selectedApptForReview.id,
        rating: rating,
        comment: comment
      });
      alert('Cảm ơn bạn đã gửi đánh giá!');
      setIsReviewModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data || 'Có lỗi xảy ra khi gửi đánh giá!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // --- ĐĂNG XUẤT ---
  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm h-full shrink-0">
        <div className="flex-1 overflow-y-auto py-6 min-h-0">
          <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hồ sơ sức khỏe</p>
          <nav className="space-y-1.5 px-4">
            <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Calendar className="w-5 h-5 mr-3" /> Lịch sử khám bệnh
            </button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm relative z-0">
          <h1 className="text-xl font-bold text-gray-800">
            Hồ sơ Bệnh nhân
          </h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {activeTab === 'appointments' && (
             <PatientAppointmentList 
                appointments={appointments}
                isLoading={isLoading}
                onViewRecord={handleViewRecord}
                onReview={handleOpenReview}
                onNavigateHome={() => navigate('/')}
             />
          )}
        </main>
      </div>

      {/* MODALS */}
      <PatientRecordModal 
        isOpen={isRecordModalOpen}
        record={selectedRecord}
        isLoading={isRecordLoading}
        onClose={() => setIsRecordModalOpen(false)}
      />

      <PatientReviewModal 
        isOpen={isReviewModalOpen}
        appointment={selectedApptForReview}
        isSubmitting={isSubmittingReview}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}