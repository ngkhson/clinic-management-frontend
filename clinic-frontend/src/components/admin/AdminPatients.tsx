import React, { useState, useEffect } from 'react';
import { UserRound, Lock, Unlock } from 'lucide-react';
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

interface Patient { id: number; fullName: string; email: string; phone: string; gender: string; address: string; status: string; }

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/patients');
      setPatients(res.data.result || res.data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleTogglePatientStatus = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?')) return;
    try {
      await apiClient.put(`/admin/patients/${id}/toggle-status`);
      fetchPatients();
    } catch (error) { alert('Có lỗi xảy ra!'); }
  };

  const renderStatusBadge = (status: string) => {
      if (status === 'ACTIVE') return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Hoạt động</span>;
      if (status === 'LOCKED') return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">Đã khóa</span>;
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
  };

  return (
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
}