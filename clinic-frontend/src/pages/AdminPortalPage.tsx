import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Activity,
  BriefcaseMedical,
  CheckCircle2,
  Users,
  DollarSign,
  CalendarDays,
  ClipboardList,
  UserRound,
  ArrowRight,
  UserCog,
  Lock,
  Unlock
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

// --- Định nghĩa Interface ---
interface Specialty { id: number; name: string; description: string; imageUrl: string; }
interface Doctor { id: number; fullName: string; degree: string; specialtyName: string; biography: string; examinationPrice: number; }
interface Schedule { id: number; timeSlot: string; currentPatients: number; maxPatients: number; }
interface AppointmentInfo { id: number; doctorName: string; patientName: string; timeSlot: string; appointmentDate: string; status: string; }
interface Patient { id: number; fullName: string; email: string; phone: string; gender: string; address: string; status: string; }

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- States Hệ thống ---
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAppointments: 0, totalRevenue: 0, pendingAppointments: 0 });
  const [allAppointments, setAllAppointments] = useState<AppointmentInfo[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // --- States Chuyên khoa & Bác sĩ & Lịch ---
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [specForm, setSpecForm] = useState<Partial<Specialty>>({ name: '', description: '', imageUrl: '' });
  const [specMode, setSpecMode] = useState<'ADD' | 'EDIT'>('ADD');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docMode, setDocMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedDocIdForEdit, setSelectedDocIdForEdit] = useState<number | null>(null);
  const [docForm, setDocForm] = useState({ email: '', password: '', fullName: '', specialtyId: '', degree: '', biography: '', examinationPrice: '' });

  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [existingSchedules, setExistingSchedules] = useState<Schedule[]>([]);
  const defaultSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // Load Data dựa theo Tab
  useEffect(() => {
    if (activeTab === 'dashboard') { fetchStats(); fetchAllAppointments(); }
    else if (activeTab === 'all_appointments') fetchAllAppointments();
    else if (activeTab === 'specialties') fetchSpecialties();
    else if (activeTab === 'doctors') { fetchDoctors(); fetchSpecialties(); }
    else if (activeTab === 'schedules') fetchDoctors();
    else if (activeTab === 'patients') fetchPatients();
  }, [activeTab]);

  useEffect(() => {
    if (selectedDocId && selectedDate) fetchExistingSchedules();
    else setExistingSchedules([]);
  }, [selectedDocId, selectedDate]);

  // --- API THỐNG KÊ & LỊCH HẸN ---
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/stats');
      setStats(res.data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const fetchAllAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/all-appointments');
      // Sắp xếp lịch hẹn mới nhất lên đầu
      const sorted = res.data.sort((a: any, b: any) => b.id - a.id);
      setAllAppointments(sorted);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  // --- API QUẢN LÝ BỆNH NHÂN ---
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/patients');
      setPatients(res.data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleTogglePatientStatus = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?')) return;
    try {
      await apiClient.put(`/admin/patients/${id}/toggle-status`);
      fetchPatients();
    } catch (error) { alert('Có lỗi xảy ra!'); }
  };

  // --- API CHUYÊN KHOA ---
  const fetchSpecialties = async () => {
    setIsLoading(true);
    try { const res = await apiClient.get('/specialties'); setSpecialties(res.data); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleSaveSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (specMode === 'ADD') await apiClient.post('/admin/specialties', specForm);
      else await apiClient.put(`/admin/specialties/${specForm.id}`, specForm);
      setIsSpecModalOpen(false); fetchSpecialties();
    } catch (error) { alert('Có lỗi xảy ra!'); }
  };

  const handleDeleteSpecialty = async (id: number) => {
    if (!window.confirm('Xóa chuyên khoa này?')) return;
    try { await apiClient.delete(`/admin/specialties/${id}`); fetchSpecialties(); } catch (error) { alert('Có lỗi xảy ra!'); }
  };

  // --- API BÁC SĨ ---
  const fetchDoctors = async () => {
    setIsLoading(true);
    try { const res = await apiClient.get('/admin/doctors'); setDoctors(res.data); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...docForm, specialtyId: parseInt(docForm.specialtyId), examinationPrice: parseFloat(docForm.examinationPrice) };
      
      if (docMode === 'ADD') {
        await apiClient.post('/admin/doctors', payload);
        alert('Tạo bác sĩ thành công!');
      } else {
        await apiClient.put(`/admin/doctors/${selectedDocIdForEdit}`, payload);
        alert('Cập nhật bác sĩ thành công!');
      }
      setIsDocModalOpen(false); 
      fetchDoctors();
    } catch (error: any) { 
      alert(error.response && error.response.status === 400 ? error.response.data : 'Có lỗi xảy ra. Vui lòng kiểm tra lại dữ liệu!'); 
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này?\nLưu ý: Không thể xóa nếu bác sĩ đã có lịch hẹn trong hệ thống!')) return;
    try { 
      await apiClient.delete(`/admin/doctors/${id}`); 
      alert('Xóa bác sĩ thành công!');
      fetchDoctors(); 
    } catch (error: any) { 
      alert(error.response?.data || 'Có lỗi xảy ra khi xóa bác sĩ!'); 
    }
  };

  const openAddDoctorModal = () => {
    setDocMode('ADD');
    setSelectedDocIdForEdit(null);
    setDocForm({ email: '', password: '', fullName: '', specialtyId: '', degree: '', biography: '', examinationPrice: '' });
    setIsDocModalOpen(true);
  };

  const openEditDoctorModal = (doc: Doctor) => {
    setDocMode('EDIT');
    setSelectedDocIdForEdit(doc.id);
    // Tìm ID chuyên khoa dựa trên tên (Vì DTO đang trả về Name)
    const spec = specialties.find(s => s.name === doc.specialtyName);
    setDocForm({ 
      email: '', // Backend thường không cho sửa email
      password: '', // Để trống = không đổi mật khẩu
      fullName: doc.fullName, 
      specialtyId: spec ? spec.id.toString() : '', 
      degree: doc.degree, 
      biography: doc.biography, 
      examinationPrice: doc.examinationPrice.toString() 
    });
    setIsDocModalOpen(true);
  };

  // --- API LỊCH LÀM VIỆC ---
  const fetchExistingSchedules = async () => {
    setIsLoading(true);
    try { const res = await apiClient.get(`/schedules/doctor/${selectedDocId}?date=${selectedDate}`); setExistingSchedules(res.data); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const toggleSlotSelection = (slot: string) => {
    if (selectedSlots.includes(slot)) setSelectedSlots(selectedSlots.filter(s => s !== slot));
    else setSelectedSlots([...selectedSlots, slot]);
  };

  const handleGenerateSchedules = async () => {
    if (!selectedDocId || !selectedDate || selectedSlots.length === 0) { alert('Vui lòng chọn Bác sĩ, Ngày và ít nhất 1 khung giờ!'); return; }
    setIsLoading(true);
    try {
      await apiClient.post('/admin/schedules/generate', { doctorId: parseInt(selectedDocId), date: selectedDate, timeSlots: selectedSlots, maxPatients: 1 });
      alert('Tạo lịch làm việc thành công!'); setSelectedSlots([]); fetchExistingSchedules(); 
    } catch (error) { alert('Có lỗi khi tạo lịch. Vui lòng kiểm tra lại!'); } finally { setIsLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('userEmail'); localStorage.removeItem('role'); navigate('/login'); };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">Chờ xác nhận</span>;
      case 'CONFIRMED': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">Đã xác nhận</span>;
      case 'COMPLETED': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Đã khám</span>;
      case 'ACTIVE': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Hoạt động</span>;
      case 'LOCKED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">Đã khóa</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // --- RENDER GIAO DIỆN CON ---
  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan Hệ thống</h2>
      
      {/* 4 Cards Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mr-4 relative z-10">
            <Stethoscope className="w-7 h-7 text-blue-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng Bác sĩ</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mr-4 relative z-10">
            <Users className="w-7 h-7 text-green-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium mb-1">Tổng Bệnh nhân</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPatients}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mr-4 relative z-10">
            <CalendarDays className="w-7 h-7 text-yellow-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium mb-1">Ca chờ xác nhận</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mr-4 relative z-10">
            <DollarSign className="w-7 h-7 text-purple-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium mb-1">Doanh thu dự kiến</p>
            <h3 className="text-xl font-bold text-green-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Lịch hẹn mới nhất hiển thị luôn trên Dashboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" /> Lịch hẹn mới phát sinh
          </h3>
          <button onClick={() => setActiveTab('all_appointments')} className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center transition">
            Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white text-gray-500 text-sm border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold">Bệnh nhân</th>
              <th className="p-4 font-semibold">Bác sĩ phụ trách</th>
              <th className="p-4 font-semibold">Thời gian hẹn</th>
              <th className="p-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             allAppointments.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">Chưa có dữ liệu.</td></tr> :
             allAppointments.slice(0, 5).map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/80 transition">
                <td className="p-4 font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-xs">
                    {app.patientName.charAt(0)}
                  </div>
                  {app.patientName}
                </td>
                <td className="p-4 text-blue-600 font-medium">BS. {app.doctorName}</td>
                <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2 font-medium">{app.timeSlot}</span> {app.appointmentDate}</td>
                <td className="p-4">{renderStatusBadge(app.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAllAppointments = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý Lịch hẹn Toàn Hệ Thống</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold">Mã</th>
              <th className="p-4 font-semibold">Bệnh nhân</th>
              <th className="p-4 font-semibold">Bác sĩ phụ trách</th>
              <th className="p-4 font-semibold">Thời gian hẹn</th>
              <th className="p-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             allAppointments.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Chưa có lịch hẹn nào.</td></tr> :
             allAppointments.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-400 font-medium">#{app.id}</td>
                <td className="p-4 font-bold text-gray-900 flex items-center"><UserRound className="w-4 h-4 mr-2 text-gray-400"/> {app.patientName}</td>
                <td className="p-4 text-blue-600 font-medium">BS. {app.doctorName}</td>
                <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2 font-medium">{app.timeSlot}</span> {app.appointmentDate}</td>
                <td className="p-4">{renderStatusBadge(app.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSpecialties = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Chuyên Khoa</h2>
        <button onClick={() => { setSpecMode('ADD'); setSpecForm({ name: '', description: '', imageUrl: '' }); setIsSpecModalOpen(true); }} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium">
          <Plus className="w-5 h-5 mr-2" /> Thêm Chuyên Khoa
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr><th className="p-4 font-semibold">Tên chuyên khoa</th><th className="p-4 font-semibold">Mô tả</th><th className="p-4 font-semibold text-center">Hành động</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={3} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             specialties.length === 0 ? <tr><td colSpan={3} className="p-6 text-center text-gray-500">Chưa có dữ liệu.</td></tr> :
             specialties.map(spec => (
              <tr key={spec.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800">{spec.name}</td>
                <td className="p-4 text-gray-500 max-w-lg truncate">{spec.description}</td>
                <td className="p-4 text-center">
                  <button onClick={() => { setSpecMode('EDIT'); setSpecForm(spec); setIsSpecModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg mr-2 transition"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteSpecialty(spec.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDoctors = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Bác Sĩ</h2>
        <button onClick={openAddDoctorModal} className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm font-medium">
          <Plus className="w-5 h-5 mr-2" /> Thêm Bác Sĩ Mới
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr><th className="p-4 font-semibold">Bác sĩ</th><th className="p-4 font-semibold">Chuyên khoa</th><th className="p-4 font-semibold">Giá khám</th><th className="p-4 font-semibold text-center">Hành động</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             doctors.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">Chưa có bác sĩ nào.</td></tr> :
             doctors.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50 transition">
                <td className="p-4 flex items-center">
                   <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3"><UserRound className="w-5 h-5 text-blue-600"/></div>
                   <div><div className="font-bold text-gray-900">{doc.degree} {doc.fullName}</div><div className="text-xs text-gray-400">ID: #{doc.id}</div></div>
                </td>
                <td className="p-4 text-gray-600"><span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">{doc.specialtyName}</span></td>
                <td className="p-4 text-green-600 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.examinationPrice)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => openEditDoctorModal(doc)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg mr-2 transition" title="Chỉnh sửa"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteDoctor(doc.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Bệnh Nhân</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold">Bệnh nhân</th>
              <th className="p-4 font-semibold">Liên hệ</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             patients.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">Chưa có bệnh nhân nào.</td></tr> :
             patients.map(patient => (
              <tr key={patient.id} className="hover:bg-gray-50 transition">
                <td className="p-4 flex items-center">
                   <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3"><UserRound className="w-5 h-5 text-gray-500"/></div>
                   <div><div className="font-bold text-gray-900">{patient.fullName}</div><div className="text-xs text-gray-400">{patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</div></div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-800">{patient.email}</div>
                  <div className="text-xs text-gray-500">{patient.phone}</div>
                </td>
                <td className="p-4">{renderStatusBadge(patient.status)}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleTogglePatientStatus(patient.id)} 
                    className={`p-2 rounded-lg transition ${patient.status === 'ACTIVE' ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`} 
                    title={patient.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  >
                    {patient.status === 'ACTIVE' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSchedules = () => {
    const existingTimeSlots = existingSchedules.map(s => s.timeSlot);

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800">Sắp xếp Lịch làm việc</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 h-fit">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Thiết lập bộ lọc</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Bác sĩ</label>
                <select value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Vui lòng chọn --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.degree} {d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Ngày</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
            {!selectedDocId ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                <Calendar className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg">Vui lòng chọn bác sĩ ở cột bên trái để xem và tạo lịch</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-lg text-gray-800">Khung giờ ngày <span className="text-blue-600">{selectedDate.split('-').reverse().join('/')}</span></h3>
                  <button onClick={handleGenerateSchedules} disabled={selectedSlots.length === 0 || isLoading} className={`px-4 py-2 rounded-xl font-medium transition flex items-center ${selectedSlots.length === 0 || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                    <Plus className="w-4 h-4 mr-2" /> Tạo {selectedSlots.length} ca khám
                  </button>
                </div>
                {isLoading && existingSchedules.length === 0 ? <p className="text-gray-500 text-center py-8">Đang tải dữ liệu...</p> : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {defaultSlots.map(slot => {
                      const isExisting = existingTimeSlots.includes(slot);
                      const isSelected = selectedSlots.includes(slot);
                      return (
                        <button key={slot} disabled={isExisting} onClick={() => toggleSlotSelection(slot)} className={`py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center justify-center relative overflow-hidden ${isExisting ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed' : isSelected ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm ring-2 ring-blue-200' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'}`}>
                          {isExisting && <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />}{slot}{isExisting && <span className="text-[10px] text-green-600 mt-1 uppercase tracking-wide">Đã mở</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    // ĐỔI h-screen THÀNH h-[calc(100vh-4rem)]
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
        <div className="h-16 shrink-0 flex items-center px-6 border-b border-gray-200 bg-blue-600 text-white">
          <Stethoscope className="w-8 h-8 mr-2 text-blue-100" />
          <span className="text-xl font-bold tracking-wide">MediAdmin</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 min-h-0">
          <nav className="space-y-1.5 px-4">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Tổng quan</button>
            <button onClick={() => setActiveTab('all_appointments')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'all_appointments' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}><ClipboardList className="w-5 h-5 mr-3" /> Lịch hẹn Hệ thống</button>
            <button onClick={() => setActiveTab('specialties')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'specialties' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}><Activity className="w-5 h-5 mr-3" /> Chuyên khoa</button>
            <button onClick={() => setActiveTab('doctors')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'doctors' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}><BriefcaseMedical className="w-5 h-5 mr-3" /> Bác sĩ</button>
            <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'patients' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}><UserCog className="w-5 h-5 mr-3" /> Bệnh nhân</button>
            <button onClick={() => setActiveTab('schedules')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'schedules' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}><Calendar className="w-5 h-5 mr-3" /> Lịch làm việc</button>
          </nav>
        </div>
        
        {/* ĐÃ CẬP NHẬT: Thêm nút Hồ sơ cá nhân vào Sidebar */}
        <div className="p-4 border-t border-gray-100 space-y-2 shrink-0">
          <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition"><UserRound className="w-5 h-5 mr-2" /> Hồ sơ cá nhân</button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"><LogOut className="w-5 h-5 mr-2" /> Đăng xuất</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm relative z-0">
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Bảng điều khiển Thống kê'}
            {activeTab === 'all_appointments' && 'Danh sách Lịch hẹn'}
            {activeTab === 'specialties' && 'Danh mục Chuyên khoa'}
            {activeTab === 'doctors' && 'Hồ sơ Đội ngũ Bác sĩ'}
            {activeTab === 'patients' && 'Quản lý Bệnh nhân'}
            {activeTab === 'schedules' && 'Phân bổ Lịch làm việc'}
          </h1>
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm">AD</div>
            <div className="ml-3 hidden md:block">
               <p className="text-sm font-bold text-gray-800 leading-tight">Quản trị viên</p>
               <p className="text-xs text-gray-500 leading-tight">Hệ thống MediCare</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'all_appointments' && renderAllAppointments()}
          {activeTab === 'specialties' && renderSpecialties()}
          {activeTab === 'doctors' && renderDoctors()}
          {activeTab === 'patients' && renderPatients()}
          {activeTab === 'schedules' && renderSchedules()}
        </main>
      </div>

      {/* MODAL THÊM/SỬA CHUYÊN KHOA */}
      {isSpecModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">{specMode === 'ADD' ? 'Thêm Chuyên Khoa Mới' : 'Chỉnh Sửa Chuyên Khoa'}</h3>
              <button onClick={() => setIsSpecModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveSpecialty} className="p-6 space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tên chuyên khoa <span className="text-red-500">*</span></label><input required type="text" value={specForm.name} onChange={(e) => setSpecForm({...specForm, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Răng Hàm Mặt" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label><textarea value={specForm.description} onChange={(e) => setSpecForm({...specForm, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3} placeholder="Mô tả các bệnh lý liên quan..."></textarea></div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setIsSpecModalOpen(false)} className="px-6 py-2.5 mr-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">Hủy</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA BÁC SĨ */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
              <h3 className="font-bold text-lg text-green-900">{docMode === 'ADD' ? 'Thêm Bác Sĩ Mới' : 'Cập Nhật Hồ Sơ Bác Sĩ'}</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5"/></button>
            </div>
            <form id="docForm" onSubmit={handleSaveDoctor} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email đăng nhập {docMode === 'ADD' && <span className="text-red-500">*</span>}</label><input required={docMode === 'ADD'} disabled={docMode === 'EDIT'} type="email" value={docForm.email} onChange={(e) => setDocForm({...docForm, email: e.target.value})} className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${docMode === 'EDIT' ? 'bg-gray-100 text-gray-500' : ''}`} placeholder={docMode === 'EDIT' ? 'Không thể đổi Email' : 'bacsia@gmail.com'} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu {docMode === 'ADD' && <span className="text-red-500">*</span>}</label><input required={docMode === 'ADD'} type="password" minLength={6} value={docForm.password} onChange={(e) => setDocForm({...docForm, password: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder={docMode === 'EDIT' ? 'Bỏ trống nếu không đổi mật khẩu' : '••••••••'} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên Bác sĩ <span className="text-red-500">*</span></label><input required type="text" value={docForm.fullName} onChange={(e) => setDocForm({...docForm, fullName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên khoa <span className="text-red-500">*</span></label>
                  <select required value={docForm.specialtyId} onChange={(e) => setDocForm({...docForm, specialtyId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Học vị <span className="text-red-500">*</span></label><input required type="text" value={docForm.degree} onChange={(e) => setDocForm({...docForm, degree: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="VD: ThS. BS." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Giá khám (VNĐ) <span className="text-red-500">*</span></label><input required type="number" min="0" value={docForm.examinationPrice} onChange={(e) => setDocForm({...docForm, examinationPrice: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu chi tiết</label><textarea value={docForm.biography} onChange={(e) => setDocForm({...docForm, biography: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" rows={3} placeholder="Kinh nghiệm làm việc, thế mạnh chuyên môn..."></textarea></div>
            </form>
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button type="button" onClick={() => setIsDocModalOpen(false)} className="px-6 py-2.5 mr-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-white transition">Hủy bỏ</button>
              <button type="submit" form="docForm" className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition shadow-sm">
                {docMode === 'ADD' ? 'Lưu Bác Sĩ Mới' : 'Cập Nhật Thay Đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}