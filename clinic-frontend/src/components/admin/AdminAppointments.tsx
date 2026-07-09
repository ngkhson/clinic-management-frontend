import React, { useState, useEffect } from 'react';
import { UserRound, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../api/axiosConfig';

interface AppointmentInfo { id: number; doctorName: string; patientName: string; timeSlot: string; appointmentDate: string; status: string; }

export default function AdminAppointments() {
  const [allAppointments, setAllAppointments] = useState<AppointmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  useEffect(() => {
    fetchAllAppointments();
  }, [page, searchTerm, statusFilter]);

  const fetchAllAppointments = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);

      const res = await apiClient.get(`/admin/all-appointments?${queryParams.toString()}`);
      const pageData = res.data.result || res.data;
      setAllAppointments(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">Đã hủy</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Lịch hẹn Toàn Hệ Thống</h2>
      </div>
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên bệnh nhân, bác sĩ hoặc mã lịch hẹn..." 
            value={searchTerm} 
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }} 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Đã khám</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

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
            {isLoading ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
             allAppointments.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">Không tìm thấy lịch hẹn nào.</td></tr> :
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
        
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))} 
                disabled={page === 0}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={page >= totalPages - 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}