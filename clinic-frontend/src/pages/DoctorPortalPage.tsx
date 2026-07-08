import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, LogOut, User, LayoutDashboard, ClipboardEdit } from 'lucide-react';
import axios from 'axios';

// Import các file Component đã chia nhỏ
import DoctorDashboard from '../components/doctor/DoctorDashboard';
import DoctorAppointments from '../components/doctor/DoctorAppointments';
import MedicalRecordModal from '../components/doctor/MedicalRecordModal';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Appointment { id: number; patientName: string; timeSlot: string; appointmentDate: string; status: string; symptoms: string; }
interface MedicalService { id: number; name: string; category: string; price: number; isActive: boolean; }

export default function DoctorPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dữ liệu chung
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Quản lý Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const userEmail = localStorage.getItem('userEmail') || 'Bác sĩ';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'DOCTOR') navigate('/login');
    else {
      fetchAppointments();
      fetchServices();
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/doctor/appointments');
      setAppointments((res.data.result || res.data).sort((a: any, b: any) => b.id - a.id));
    } catch (error) { console.error('Lỗi tải lịch hẹn:', error); } 
    finally { setIsLoading(false); }
  };

  const fetchServices = async () => {
    try {
      const res = await apiClient.get('/services');
      setServices(res.data.result || res.data);
    } catch (error) { console.error('Lỗi tải dịch vụ:', error); }
  };

  const handleConfirmAppointment = async (id: number) => {
    try {
      await apiClient.put(`/doctor/appointments/${id}/status?status=CONFIRMED`);
      fetchAppointments();
    } catch (error) { alert('Có lỗi xảy ra khi xác nhận!'); }
  };

  const handleOpenRecordModal = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsRecordModalOpen(true);
  };

  const handleRecordSuccess = () => {
    setIsRecordModalOpen(false);
    fetchAppointments(); // Load lại danh sách sau khi khám xong
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm h-full shrink-0">
        <div className="h-16 shrink-0 flex items-center px-6 border-b border-gray-200 bg-blue-50">
          <Activity className="w-8 h-8 mr-2 text-blue-600" />
          <span className="text-xl font-black text-gray-900 tracking-tight">Medi<span className="text-blue-600">Care</span></span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 min-h-0">
          <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Không gian làm việc</p>
          <nav className="space-y-1.5 px-4">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Bàn làm việc
            </button>
            <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              <ClipboardEdit className="w-5 h-5 mr-3" /> Tất cả ca khám
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100 space-y-2 shrink-0">
          <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition"><User className="w-5 h-5 mr-2" /> Hồ sơ cá nhân</button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"><LogOut className="w-5 h-5 mr-2" /> Đăng xuất</button>
        </div>
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH (ROUTER) */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm relative z-0">
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'dashboard' ? 'Bàn làm việc Bác sĩ' : 'Quản lý Ca khám'}
          </h1>
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mr-3">BS</div>
            <div>
               <p className="text-sm font-bold text-gray-800 leading-tight">{userEmail}</p>
               <p className="text-xs text-green-600 leading-tight flex items-center mt-0.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> Đang trực tuyến</p>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
             <DoctorDashboard 
                appointments={appointments} 
                isLoading={isLoading} 
                onConfirm={handleConfirmAppointment} 
                onOpenModal={handleOpenRecordModal} 
             />
          )}
          {activeTab === 'appointments' && (
             <DoctorAppointments 
                appointments={appointments} 
                isLoading={isLoading} 
                onConfirm={handleConfirmAppointment} 
                onOpenModal={handleOpenRecordModal} 
             />
          )}
        </main>
      </div>

      {/* POPUP BỆNH ÁN HIỂN THỊ KHI ĐƯỢC GỌI */}
      {isRecordModalOpen && selectedAppt && (
        <MedicalRecordModal 
           appointment={selectedAppt} 
           services={services} 
           onClose={() => setIsRecordModalOpen(false)} 
           onSuccess={handleRecordSuccess} 
        />
      )}
    </div>
  );
}