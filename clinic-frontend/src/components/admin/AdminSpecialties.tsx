import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
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

interface Specialty { id: number; name: string; description: string; imageUrl: string; }

export default function AdminSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [specForm, setSpecForm] = useState<Partial<Specialty>>({ name: '', description: '', imageUrl: '' });
  const [specMode, setSpecMode] = useState<'ADD' | 'EDIT'>('ADD');

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/specialties');
      setSpecialties(res.data.result || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (specMode === 'ADD') await apiClient.post('/admin/specialties', specForm);
      else await apiClient.put(`/admin/specialties/${specForm.id}`, specForm);
      setIsSpecModalOpen(false);
      fetchSpecialties();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDeleteSpecialty = async (id: number) => {
    if (!window.confirm('Xóa chuyên khoa này?')) return;
    try {
      await apiClient.delete(`/admin/specialties/${id}`);
      fetchSpecialties();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  return (
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
    </div>
  );
}