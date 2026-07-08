import React, { useState, useEffect } from 'react';
import { UserRound } from 'lucide-react';
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

export default function AdminAppointments() {
  const [allAppointments, setAllAppointments] = useState<AppointmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllAppointments = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/admin/all-appointments');
        const sorted = res.data.sort((a: any, b: any) => b.id - a.id);
        setAllAppointments(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAppointments();
  }, []);

  // THÊM HÀM XỬ LÝ XÁC NHẬN
  const handleConfirm = async (id: number) => {
    try {
      await apiClient.put(`/admin/appointments/${id}/status?status=CONFIRMED`);
      // Cập nhật lại state cục bộ cho nhanh
      setAllAppointments(prev => prev.map(app => app.id === id ? {...app, status: 'CONFIRMED'} : app));
    } catch (error) {
      alert('Có lỗi xảy ra khi xác nhận lịch hẹn!');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">Chờ xác nhận</span>;
      case 'CONFIRMED': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">Đã xác nhận</span>;
      case 'COMPLETED': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Đã khám</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
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
              <th className="p-4 font-semibold text-center">Hành động</th>
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
                <td className="p-4 text-center">
                  {app.status === 'PENDING' && (
                    <button onClick={() => handleConfirm(app.id)} className="px-4 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold transition">
                      Xác nhận Lịch
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}