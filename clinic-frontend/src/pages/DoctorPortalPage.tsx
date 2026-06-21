import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  LogOut, 
  User, 
  CalendarCheck, 
  ClipboardEdit, 
  CheckCircle2, 
  Clock, 
  X, 
  Save, 
  FileText, 
  Pill,
  LayoutDashboard
} from 'lucide-react';
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

// --- Interfaces ---
interface Appointment {
  id: number;
  patientName: string;
  timeSlot: string;
  appointmentDate: string;
  status: string;
  symptoms: string;
}

export default function DoctorPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States cho Modal Bệnh Án
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    treatmentPlan: '',
    prescription: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const userEmail = localStorage.getItem('userEmail') || 'Bác sĩ';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'DOCTOR') {
      navigate('/login');
    } else {
      fetchAppointments();
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/doctor/appointments');
      // Sắp xếp ngày gần nhất & id lớn nhất lên đầu
      const sorted = res.data.sort((a: any, b: any) => b.id - a.id);
      setAppointments(sorted);
    } catch (error) {
      console.error('Lỗi tải lịch hẹn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xác nhận lịch hẹn (PENDING -> CONFIRMED)
  const handleConfirmAppointment = async (id: number) => {
    try {
      await apiClient.put(`/doctor/appointments/${id}/status?status=CONFIRMED`);
      fetchAppointments();
    } catch (error) {
      alert('Có lỗi xảy ra khi xác nhận!');
    }
  };

  // Mở Form viết Bệnh án
  const handleOpenRecordModal = (appt: Appointment) => {
    setSelectedAppt(appt);
    setRecordForm({ diagnosis: '', treatmentPlan: '', prescription: '', notes: '' });
    setIsRecordModalOpen(true);
  };

  // Lưu Bệnh án & Chuyển trạng thái sang COMPLETED
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    
    setIsSaving(true);
    try {
      // 1. Lưu hồ sơ bệnh án
      await apiClient.post('/doctor/medical-records', {
        appointmentId: selectedAppt.id,
        diagnosis: recordForm.diagnosis,
        treatmentPlan: recordForm.treatmentPlan,
        prescription: recordForm.prescription,
        notes: recordForm.notes
      });
      
      // 2. Chuyển trạng thái thành COMPLETED
      await apiClient.put(`/doctor/appointments/${selectedAppt.id}/status?status=COMPLETED`);
      
      alert('Đã lưu hồ sơ bệnh án thành công!');
      setIsRecordModalOpen(false);
      fetchAppointments();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu bệnh án!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Lọc dữ liệu thống kê
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const completedTodayCount = todayAppointments.filter(a => a.status === 'COMPLETED').length;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">Chờ xác nhận</span>;
      case 'CONFIRMED': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">Sắp khám</span>;
      case 'COMPLETED': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">Đã xong</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan công việc</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mr-4 relative z-10 text-blue-600">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium">Lịch khám hôm nay</p>
            <h3 className="text-2xl font-bold text-gray-900">{todayAppointments.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-50 rounded-full opacity-50"></div>
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mr-4 relative z-10 text-yellow-600">
            <Clock className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium">Ca chờ xác nhận</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full opacity-50"></div>
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mr-4 relative z-10 text-green-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium">Đã khám hôm nay</p>
            <h3 className="text-2xl font-bold text-gray-900">{completedTodayCount}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800">Lịch khám trong ngày ({todayStr.split('-').reverse().join('/')})</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white text-gray-500 text-sm border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold">Bệnh nhân</th>
              <th className="p-4 font-semibold">Khung giờ</th>
              <th className="p-4 font-semibold">Triệu chứng</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             todayAppointments.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Hôm nay chưa có lịch khám nào.</td></tr> :
             todayAppointments.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-900">{app.patientName}</td>
                <td className="p-4 text-blue-600 font-medium flex items-center"><Clock className="w-4 h-4 mr-1.5"/> {app.timeSlot}</td>
                <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{app.symptoms || 'Không có'}</td>
                <td className="p-4">{renderStatusBadge(app.status)}</td>
                <td className="p-4 text-center">
                  {app.status === 'PENDING' && (
                    <button onClick={() => handleConfirmAppointment(app.id)} className="px-4 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold transition">Nhận ca</button>
                  )}
                  {app.status === 'CONFIRMED' && (
                    <button onClick={() => handleOpenRecordModal(app)} className="px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold shadow-sm transition">Tiến hành khám</button>
                  )}
                  {app.status === 'COMPLETED' && (
                    <span className="text-gray-400 text-sm">Đã hoàn thành</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAllAppointments = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Tất cả lịch hẹn</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold">Mã</th>
              <th className="p-4 font-semibold">Bệnh nhân</th>
              <th className="p-4 font-semibold">Thời gian hẹn</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             appointments.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Chưa có lịch hẹn nào.</td></tr> :
             appointments.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-400 font-medium">#{app.id}</td>
                <td className="p-4 font-bold text-gray-900">{app.patientName}</td>
                <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2 font-medium">{app.timeSlot}</span> {app.appointmentDate}</td>
                <td className="p-4">{renderStatusBadge(app.status)}</td>
                <td className="p-4 text-center">
                  {app.status === 'PENDING' && (
                    <button onClick={() => handleConfirmAppointment(app.id)} className="px-4 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold transition">Nhận ca</button>
                  )}
                  {app.status === 'CONFIRMED' && (
                    <button onClick={() => handleOpenRecordModal(app)} className="px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold shadow-sm transition">Khám bệnh</button>
                  )}
                  {app.status === 'COMPLETED' && (
                    <span className="text-gray-400 text-sm">Đã hoàn thành</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm h-full">
        {/* <div className="h-16 shrink-0 flex items-center px-6 border-b border-gray-200 bg-blue-50">
          <Activity className="w-8 h-8 mr-2 text-blue-600" />
          <span className="text-xl font-black text-gray-900 tracking-tight">Medi<span className="text-blue-600">Care</span></span>
        </div> */}
        <div className="flex-1 overflow-y-auto py-6 min-h-0">
          <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Không gian làm việc</p>
          <nav className="space-y-1.5 px-4">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Bàn làm việc</button>
            <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}><ClipboardEdit className="w-5 h-5 mr-3" /> Tất cả ca khám</button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100 space-y-2 shrink-0">
          <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition"><User className="w-5 h-5 mr-2" /> Hồ sơ cá nhân</button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"><LogOut className="w-5 h-5 mr-2" /> Đăng xuất</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm relative z-0">
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Bàn làm việc Bác sĩ'}
            {activeTab === 'appointments' && 'Quản lý Ca khám'}
          </h1>
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mr-3">BS</div>
            <div>
               <p className="text-sm font-bold text-gray-800 leading-tight">{userEmail}</p>
               <p className="text-xs text-green-600 leading-tight flex items-center mt-0.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> Đang trực tuyến</p>
            </div>
          </div>
        </header> */}
        
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'appointments' && renderAllAppointments()}
        </main>
      </div>

      {/* MODAL VIẾT HỒ SƠ BỆNH ÁN */}
      {isRecordModalOpen && selectedAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <h3 className="font-bold text-xl text-blue-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Viết Hồ sơ & Kê Đơn Thuốc
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center space-x-6 text-sm">
              <p><span className="text-gray-500">Bệnh nhân:</span> <strong className="text-gray-900">{selectedAppt.patientName}</strong></p>
              <p><span className="text-gray-500">Khung giờ:</span> <strong className="text-gray-900">{selectedAppt.timeSlot} ({selectedAppt.appointmentDate})</strong></p>
            </div>

            <form id="recordForm" onSubmit={handleSubmitRecord} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Chẩn đoán bệnh <span className="text-red-500">*</span></label>
                <input required type="text" value={recordForm.diagnosis} onChange={(e) => setRecordForm({...recordForm, diagnosis: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Viêm họng cấp..." />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kế hoạch điều trị <span className="text-red-500">*</span></label>
                <input required type="text" value={recordForm.treatmentPlan} onChange={(e) => setRecordForm({...recordForm, treatmentPlan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Uống thuốc 5 ngày, nghỉ ngơi..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center">
                  <Pill className="w-4 h-4 mr-1 text-blue-600" /> Kê đơn thuốc <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea required value={recordForm.prescription} onChange={(e) => setRecordForm({...recordForm, prescription: e.target.value})} className="w-full px-4 py-3 border border-blue-200 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={4} placeholder="- Paracetamol 500mg: 10 viên (Ngày 2 viên sáng/tối)&#10;- Alpha Choay: 20 viên..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lời dặn dò thêm (Tùy chọn)</label>
                <textarea value={recordForm.notes} onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} placeholder="Kiêng đồ ăn lạnh, uống nhiều nước ấm..."></textarea>
              </div>
            </form>
            
            <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button type="button" onClick={() => setIsRecordModalOpen(false)} className="px-6 py-3 mr-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-white transition">Hủy bỏ</button>
              <button type="submit" form="recordForm" disabled={isSaving} className={`flex items-center px-6 py-3 font-bold rounded-xl text-white shadow-sm transition ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSaving ? 'Đang lưu...' : <><Save className="w-5 h-5 mr-2" /> Lưu Bệnh Án & Hoàn Thành</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}