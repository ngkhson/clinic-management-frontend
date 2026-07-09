import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, X, TestTube, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../api/axiosConfig';

interface MedicalService {
  id: number;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

export default function MedicalServiceManager() {
  const [services, setServices] = useState<MedicalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MedicalService | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'XÉT NGHIỆM',
    price: 0
  });

  // ĐÃ CẬP NHẬT: Danh sách các nhóm dịch vụ chuẩn y khoa
  const categories = [
    'XÉT NGHIỆM',
    'X-QUANG',
    'SIÊU ÂM',
    'ĐIỆN TIM',
    'ĐIỆN NÃO',
    'NỘI SOI',
    'THỦ THUẬT'
  ];

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 10;

  useEffect(() => {
    fetchServices();
  }, [page, search]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      // ĐÃ THÊM PHÂN TRANG VÀ TÌM KIẾM
      const res = await apiClient.get(`/services/page?page=${page}&size=${pageSize}&search=${encodeURIComponent(search)}`);
      if (res.data.result) {
        setServices(res.data.result.content);
        setTotalPages(res.data.result.totalPages || 1);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách dịch vụ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await apiClient.put(`/services/${editingService.id}`, formData);
      } else {
        await apiClient.post('/services', formData);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu dịch vụ!');
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({ name: '', category: 'XÉT NGHIỆM', price: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (srv: MedicalService) => {
    setEditingService(srv);
    setFormData({ name: srv.name, category: srv.category, price: srv.price });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn đổi trạng thái dịch vụ này?')) return;
    try {
      await apiClient.patch(`/services/${id}/toggle-status`);
      fetchServices();
    } catch (error) {
      alert('Lỗi đổi trạng thái!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <TestTube className="w-6 h-6 mr-2 text-blue-600" /> Quản lý Dịch vụ & Cận lâm sàng
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm tên dịch vụ..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
          </div>
          <button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium whitespace-nowrap">
            <Plus className="w-5 h-5 mr-2" /> Thêm Dịch Vụ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold w-16">ID</th>
                <th className="p-4 font-semibold">Tên dịch vụ</th>
                <th className="p-4 font-semibold text-center">Phân loại</th>
                <th className="p-4 font-semibold text-right">Giá tiền (VNĐ)</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr> :
                services.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">Không tìm thấy dịch vụ nào.</td></tr> :
                  services.map(srv => (
                    <tr key={srv.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-400 font-medium">#{srv.id}</td>
                      <td className="p-4 font-bold text-gray-800">{srv.name}</td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                          {srv.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(srv.price)}
                      </td>
                      <td className="p-4 text-center">
                        {srv.isActive ? (
                          <span className="inline-flex items-center text-xs font-bold text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Đang dùng</span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold text-red-500"><XCircle className="w-3 h-3 mr-1" /> Tạm ngưng</span>
                        )}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button onClick={() => openEditModal(srv)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Sửa"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => toggleStatus(srv.id)} className={`p-2 rounded-lg transition ${srv.isActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`} title="Đổi trạng thái">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            Trang <span className="font-bold text-blue-600">{page + 1}</span> / {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex items-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex items-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <TestTube className="w-5 h-5 mr-2 text-blue-600" />
                {editingService ? 'Cập nhật Dịch vụ' : 'Thêm Dịch vụ mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Điện tâm đồ (ECG)" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm dịch vụ <span className="text-red-500">*</span></label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền (VNĐ) <span className="text-red-500">*</span></label>
                  <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 mr-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">Hủy</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm">
                  {editingService ? 'Lưu thay đổi' : 'Thêm dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}