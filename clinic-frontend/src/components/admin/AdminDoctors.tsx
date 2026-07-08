import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, UserRound } from 'lucide-react';
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

interface Doctor { id: number; fullName: string; degree: string; specialtyName: string; biography: string; }
interface Specialty { id: number; name: string; }

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docMode, setDocMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedDocIdForEdit, setSelectedDocIdForEdit] = useState<number | null>(null);
  const [docForm, setDocForm] = useState({ email: '', password: '', fullName: '', specialtyId: '', degree: '', biography: '' });

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try { const res = await apiClient.get('/admin/doctors'); setDoctors(res.data); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const fetchSpecialties = async () => {
    try { const res = await apiClient.get('/specialties'); setSpecialties(res.data); } catch (e) { console.error(e); }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...docForm, specialtyId: parseInt(docForm.specialtyId) };
      
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
    setDocForm({ email: '', password: '', fullName: '', specialtyId: '', degree: '', biography: '' });
    setIsDocModalOpen(true);
  };

  const openEditDoctorModal = (doc: Doctor) => {
    setDocMode('EDIT');
    setSelectedDocIdForEdit(doc.id);
    const spec = specialties.find(s => s.name === doc.specialtyName);
    setDocForm({ 
      email: '', 
      password: '', 
      fullName: doc.fullName, 
      specialtyId: spec ? spec.id.toString() : '', 
      degree: doc.degree, 
      biography: doc.biography
    });
    setIsDocModalOpen(true);
  };

  return (
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
            <tr><th className="p-4 font-semibold">Bác sĩ</th><th className="p-4 font-semibold">Chuyên khoa</th><th className="p-4 font-semibold text-center">Hành động</th></tr>
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

                <td className="p-4 text-center">
                  <button onClick={() => openEditDoctorModal(doc)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg mr-2 transition" title="Chỉnh sửa"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteDoctor(doc.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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