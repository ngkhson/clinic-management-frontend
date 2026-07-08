import React, { useState, useEffect } from 'react';
import { ArrowLeft, Archive, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

interface Medicine {
  id: number;
  name: string;
  unit: string;
  category: string;
  minQuantity: number;
  currentQuantity: number;
  sellingPrice: number;
  isActive: boolean;
}

interface Props {
  onBack: () => void;
}

export default function MedicineInventory({ onBack }: Props) {
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '', unit: 'Viên', category: 'Kháng sinh', minQuantity: 10, currentQuantity: 0, sellingPrice: 0
  });

  useEffect(() => {
    fetchAllMedicines();
  }, []);

  const fetchAllMedicines = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/medicines');
      setAllMedicines(res.data.result || res.data);
    } catch (error) {
      console.error('Lỗi tải danh sách thuốc:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await apiClient.put(`/medicines/${editingMed.id}`, formData);
      } else {
        await apiClient.post('/medicines', formData);
      }
      setIsModalOpen(false);
      fetchAllMedicines();
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const openEditModal = (med: Medicine) => {
    setEditingMed(med);
    setFormData({
      name: med.name, unit: med.unit, category: med.category,
      minQuantity: med.minQuantity, currentQuantity: med.currentQuantity, sellingPrice: med.sellingPrice
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingMed(null);
    setFormData({ name: '', unit: 'Viên', category: 'Kháng sinh', minQuantity: 10, currentQuantity: 0, sellingPrice: 0 });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: number) => {
    if(!window.confirm('Bạn có chắc muốn thay đổi trạng thái thuốc này?')) return;
    try {
      await apiClient.patch(`/medicines/${id}/toggle-status`);
      fetchAllMedicines();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><Archive className="w-6 h-6 mr-2 text-blue-600" /> Quản lý Kho Thuốc</h2>
        </div>
        <button onClick={openAddModal} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium text-sm">
          <Plus className="w-4 h-4 mr-2" /> Thêm thuốc mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-bold w-16">ID</th>
                <th className="p-4 font-bold">Tên thuốc</th>
                <th className="p-4 font-bold">Phân loại</th>
                <th className="p-4 font-bold text-center">Cơ số</th>
                <th className="p-4 font-bold text-center">Hiện còn</th>
                <th className="p-4 font-bold text-right">Giá bán</th>
                <th className="p-4 font-bold text-center">Trạng thái</th>
                <th className="p-4 font-bold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Đang tải...</td></tr>
              ) : allMedicines.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Kho trống.</td></tr>
              ) : (
                allMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-500">#{med.id}</td>
                    <td className="p-4 font-semibold text-blue-900">{med.name} <span className="text-xs font-normal text-gray-400 ml-1">({med.unit})</span></td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{med.category}</span></td>
                    <td className="p-4 text-center text-gray-500">{med.minQuantity}</td>
                    <td className={`p-4 text-center font-bold ${med.currentQuantity <= med.minQuantity ? 'text-red-600' : 'text-green-600'}`}>{med.currentQuantity}</td>
                    <td className="p-4 text-right font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(med.sellingPrice)}</td>
                    <td className="p-4 text-center">
                      {med.isActive ? <span className="inline-flex items-center text-xs font-bold text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Đang dùng</span> : <span className="inline-flex items-center text-xs font-bold text-red-500"><XCircle className="w-3 h-3 mr-1" /> Tạm ngưng</span>}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => openEditModal(med)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => toggleStatus(med.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center"><Archive className="w-5 h-5 mr-2 text-blue-600" /> {editingMed ? 'Cập nhật thuốc' : 'Thêm thuốc mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Tên thuốc</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Nhóm thuốc</label><input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">Đơn vị</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500">
                    <option value="Viên">Viên</option><option value="Gói">Gói</option><option value="Chai">Chai</option><option value="Ống">Ống</option><option value="Vỉ">Vỉ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Cơ số</label><input required type="number" min={1} value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1">SL Ban đầu</label><input required type="number" min={0} disabled={!!editingMed} value={formData.currentQuantity} onChange={e => setFormData({...formData, currentQuantity: parseInt(e.target.value)})} className={`w-full px-4 py-2 border rounded-lg outline-none ${editingMed ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500'}`} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Giá bán</label><input required type="number" min={0} value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{editingMed ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}