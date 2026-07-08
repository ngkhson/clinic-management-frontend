import React, { useState, useEffect } from 'react';
import { Stethoscope, Users, CalendarDays, DollarSign, Activity, ArrowRight } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface AppointmentInfo { id: number; doctorName: string; patientName: string; timeSlot: string; appointmentDate: string; status: string; }

export default function AdminDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAppointments: 0, totalRevenue: 0, pendingAppointments: 0 });
  const [allAppointments, setAllAppointments] = useState<AppointmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, appRes] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/admin/all-appointments/all')
        ]);
        setStats(statsRes.data.result || statsRes.data);
        const sorted = (appRes.data.result || appRes.data).sort((a: any, b: any) => b.id - a.id);
        setAllAppointments(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">Chờ xác nhận</span>;
      case 'CONFIRMED': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">Đã xác nhận</span>;
      case 'COMPLETED': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Đã khám</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
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
          <button onClick={() => onNavigate('all_appointments')} className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center transition">
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
}