import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ArrowLeft, Archive, PlusSquare, Truck, 
  ShoppingBag, BarChart2, FileText, AlertTriangle, 
  Plus, Edit, Trash2, CheckCircle, XCircle 
} from 'lucide-react';
import axios from 'axios';

// --- Cấu hình API ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Interfaces ---
interface Medicine {
  id: number;
  name: string;
  unit: string;
  category: string;
  minQuantity: number;
  currentQuantity: number;
  sellingPrice: number;
  active: boolean;
}

export default function AdminMedicinePage() {
  const navigate = useNavigate();
  
  // States điều hướng các màn hình con
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'INVENTORY'>('DASHBOARD');
  
  // States dữ liệu
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States Modal Thêm/Sửa Thuốc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '', unit: 'Viên', category: 'Kháng sinh', minQuantity: 10, currentQuantity: 0, sellingPrice: 0
  });

  // Load dữ liệu khi vào trang
  useEffect(() => {
    fetchLowStock();
  }, []);

  // Fetch khi đổi view
  useEffect(() => {
    if (activeView === 'INVENTORY') fetchAllMedicines();
    if (activeView === 'DASHBOARD') fetchLowStock();
  }, [activeView]);

  const fetchLowStock = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/medicines/alerts/low-stock');
      setLowStockMedicines(res.data);
    } catch (error) {
      console.error('Lỗi tải cảnh báo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllMedicines = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/medicines');
      setAllMedicines(res.data);
    } catch (error) {
      console.error('Lỗi tải danh sách thuốc:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Form Submit (Thêm/Sửa)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await apiClient.put(`/medicines/${editingMed.id}`, formData);
      } else {
        await apiClient.post('/medicines', formData);
      }
      setIsModalOpen(false);
      fetchAllMedicines(); // Refresh data
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  // Mở modal Sửa
  const openEditModal = (med: Medicine) => {
    setEditingMed(med);
    setFormData({
      name: med.name, unit: med.unit, category: med.category,
      minQuantity: med.minQuantity, currentQuantity: med.currentQuantity, sellingPrice: med.sellingPrice
    });
    setIsModalOpen(true);
  };

  // Mở modal Thêm mới
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

  // ==================== RENDER: DASHBOARD (MÀN HÌNH CHÍNH) ====================
  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Khung Header xanh đen */}
      <div className="bg-[#0f4a6b] text-white text-center py-3 rounded-t-xl font-bold uppercase tracking-wider shadow-sm">
        Quản lý thuốc
      </div>

      {/* Grid 6 Nút Chức Năng (Giống hệt ảnh) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
        <button onClick={() => setActiveView('INVENTORY')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-pink-100 transition">
            <Archive className="w-8 h-8" />
          </div>
          <span className="font-bold text-blue-600 text-lg">Kho thuốc</span>
        </button>

        <button className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition">
            <PlusSquare className="w-8 h-8" />
          </div>
          <span className="font-bold text-blue-600 text-lg">Nhập thuốc</span>
        </button>

        <button className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition">
            <Truck className="w-8 h-8" />
          </div>
          <span className="font-bold text-blue-600 text-lg">Nhà cung cấp</span>
        </button>

        <button className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <span className="font-bold text-blue-600 text-lg">Bán thuốc</span>
        </button>

        <button className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition">
            <BarChart2 className="w-8 h-8" />
          </div>
          <span className="font-bold text-blue-600 text-lg">Báo cáo</span>
        </button>

        <button className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition">
            <FileText className="w-8 h-8" />
          </div>
          <span className="font-bold text-blue-600 text-lg">Ghi chú</span>
        </button>
      </div>

      {/* Bảng Cảnh báo thuốc sắp hết */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="bg-[#fbbf24] text-white text-center py-2.5 font-bold flex items-center justify-center tracking-wide">
          <AlertTriangle className="w-5 h-5 mr-2" /> Cảnh báo thuốc sắp hết
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-yellow-50/50 border-b border-gray-200 text-gray-700 text-sm">
                <th className="p-4 font-bold w-16 text-center">TT</th>
                <th className="p-4 font-bold">Tên thuốc</th>
                <th className="p-4 font-bold w-32 text-center">Cơ số</th>
                <th className="p-4 font-bold w-32 text-center">Hiện còn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : lowStockMedicines.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-green-600 font-medium">Tuyệt vời! Kho thuốc đang dồi dào, không có thuốc nào sắp hết.</td></tr>
              ) : (
                lowStockMedicines.map((med, index) => (
                  <tr key={med.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-center text-gray-500 font-medium">{index + 1}</td>
                    <td className="p-4 font-semibold text-gray-900">{med.name}</td>
                    <td className="p-4 text-center text-gray-600">{med.minQuantity}</td>
                    <td className="p-4 text-center font-bold text-red-600 bg-red-50/30">{med.currentQuantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER: KHO THUỐC (INVENTORY VIEW) ====================
  const renderInventory = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveView('DASHBOARD')} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Archive className="w-6 h-6 mr-2 text-blue-600" /> Quản lý Kho Thuốc
          </h2>
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
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : allMedicines.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Chưa có thuốc nào trong kho.</td></tr>
              ) : (
                allMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-500">#{med.id}</td>
                    <td className="p-4 font-semibold text-blue-900">{med.name} <span className="text-xs font-normal text-gray-400 ml-1">({med.unit})</span></td>
                    <td className="p-4 text-gray-600">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{med.category}</span>
                    </td>
                    <td className="p-4 text-center text-gray-500">{med.minQuantity}</td>
                    <td className={`p-4 text-center font-bold ${med.currentQuantity <= med.minQuantity ? 'text-red-600' : 'text-green-600'}`}>
                      {med.currentQuantity}
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(med.sellingPrice)}
                    </td>
                    <td className="p-4 text-center">
                      {med.active ? (
                        <span className="inline-flex items-center text-xs font-bold text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Đang dùng</span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold text-red-500"><XCircle className="w-3 h-3 mr-1" /> Tạm ngưng</span>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => openEditModal(med)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(med.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="Đổi trạng thái">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100/50 py-8">
      {/* Gắn chung layout với Admin nếu cần */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Render View động */}
        {activeView === 'DASHBOARD' ? renderDashboard() : renderInventory()}

        {/* MODAL THÊM / SỬA THUỐC */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Archive className="w-5 h-5 mr-2 text-blue-600" />
                  {editingMed ? 'Cập nhật thông tin thuốc' : 'Thêm thuốc mới'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên thuốc</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Augmentin 875mg" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm thuốc</label>
                    <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Kháng sinh" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="Viên">Viên</option>
                      <option value="Gói">Gói</option>
                      <option value="Chai">Chai</option>
                      <option value="Ống">Ống</option>
                      <option value="Vỉ">Vỉ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cơ số tối thiểu</label>
                    <input required type="number" min={1} value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập kho (Ban đầu)</label>
                    <input required type="number" min={0} disabled={!!editingMed} value={formData.currentQuantity} onChange={e => setFormData({...formData, currentQuantity: parseInt(e.target.value)})} className={`w-full px-4 py-2 border rounded-lg outline-none ${editingMed ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} title={editingMed ? "Vui lòng dùng tính năng Nhập thuốc để thay đổi tồn kho" : ""} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                  <input required type="number" min={0} value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition">Hủy bỏ</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition">
                    {editingMed ? 'Lưu cập nhật' : 'Thêm vào kho'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}