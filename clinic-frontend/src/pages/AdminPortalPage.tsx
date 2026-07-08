import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  ClipboardList, 
  Activity, 
  TestTube, 
  BriefcaseMedical, 
  UserCog, 
  Calendar, 
  UserRound, 
  LogOut, 
  Stethoscope,
  Receipt,
  Pill // THÊM ICON KHO DƯỢC
} from 'lucide-react';

// Import các component con đã tách
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminReception from '../components/admin/AdminReception';
import AdminAppointments from '../components/admin/AdminAppointments';
import AdminSpecialties from '../components/admin/AdminSpecialties';
import MedicalServiceManager from '../components/admin/MedicalServiceManager';
import AdminDoctors from '../components/admin/AdminDoctors';
import AdminPatients from '../components/admin/AdminPatients';
import AdminSchedules from '../components/admin/AdminSchedules';
import AdminBilling from '../components/admin/AdminBilling';
import AdminMedicinePage from './AdminMedicinePage'; // IMPORT KHO DƯỢC

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const handleLogout = () => { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('userEmail'); 
    localStorage.removeItem('role'); 
    navigate('/login'); 
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm shrink-0">
        <div className="flex-1 overflow-y-auto py-6 min-h-0 custom-scrollbar">
          <nav className="space-y-1.5 px-4">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Tổng quan
            </button>
            <button onClick={() => setActiveTab('reception')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'reception' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <UserPlus className="w-5 h-5 mr-3" /> Tiếp nhận bệnh nhân
            </button>
            <button onClick={() => setActiveTab('all_appointments')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'all_appointments' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <ClipboardList className="w-5 h-5 mr-3" /> Lịch hẹn Hệ thống
            </button>
            <button onClick={() => setActiveTab('specialties')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'specialties' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <Activity className="w-5 h-5 mr-3" /> Chuyên khoa
            </button>
            <button onClick={() => setActiveTab('services')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <TestTube className="w-5 h-5 mr-3" /> Dịch vụ & CLS
            </button>
            <button onClick={() => setActiveTab('doctors')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'doctors' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <BriefcaseMedical className="w-5 h-5 mr-3" /> Bác sĩ
            </button>
            <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'patients' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <UserCog className="w-5 h-5 mr-3" /> Bệnh nhân
            </button>
            <button onClick={() => setActiveTab('schedules')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'schedules' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <Calendar className="w-5 h-5 mr-3" /> Lịch làm việc
            </button>
            
            {/* THÊM TAB KHO DƯỢC */}
            <button onClick={() => setActiveTab('medicine')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'medicine' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <Pill className="w-5 h-5 mr-3" /> Kho Dược & Vật tư
            </button>

            <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'billing' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>
              <Receipt className="w-5 h-5 mr-3" /> Thu ngân & Hóa đơn
            </button>
          </nav>
        </div>
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH (ROUTER) */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm relative z-0">
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Bảng điều khiển Thống kê'}
            {activeTab === 'reception' && 'Quầy Lễ Tân - Tiếp nhận Bệnh nhân'}
            {activeTab === 'all_appointments' && 'Danh sách Lịch hẹn'}
            {activeTab === 'specialties' && 'Danh mục Chuyên khoa'}
            {activeTab === 'services' && 'Danh mục Dịch vụ Cận lâm sàng'}
            {activeTab === 'doctors' && 'Hồ sơ Đội ngũ Bác sĩ'}
            {activeTab === 'patients' && 'Quản lý Bệnh nhân'}
            {activeTab === 'schedules' && 'Phân bổ Lịch làm việc'}
            {activeTab === 'medicine' && 'Quản trị Kho Dược phẩm'} {/* TIÊU ĐỀ KHO DƯỢC */}
            {activeTab === 'billing' && 'Thu ngân & Viện phí'}
          </h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
          {activeTab === 'reception' && <AdminReception />}
          {activeTab === 'all_appointments' && <AdminAppointments />}
          {activeTab === 'specialties' && <AdminSpecialties />}
          {activeTab === 'services' && <MedicalServiceManager />}
          {activeTab === 'doctors' && <AdminDoctors />}
          {activeTab === 'patients' && <AdminPatients />}
          {activeTab === 'schedules' && <AdminSchedules />}
          {/* RENDER COMPONENT KHO DƯỢC TẠI ĐÂY */}
          {activeTab === 'medicine' && (
             <div className="-m-4 md:-m-8 h-full"> 
               {/* Reset margin để AdminMedicinePage tự bung full width */}
               <AdminMedicinePage />
             </div>
          )}
          {activeTab === 'billing' && <AdminBilling />}
        </main>
      </div>
    </div>
  );
}