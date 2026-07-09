import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, Plus, Edit, Trash2, CheckCircle, XCircle, Search, Building2, MapPin, Phone } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../../api/axiosConfig';

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  notes: string;
  isActive: boolean;
}

interface Props {
  onBack: () => void;
}

export default function MedicineSuppliers({ onBack }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', phone: '', email: '', address: '', taxCode: '', notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/suppliers');
      setSuppliers(res.data.result || res.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu nhà cung cấp:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSup) {
        await apiClient.put(`/suppliers/${editingSup.id}`, formData);
      } else {
        await apiClient.post('/suppliers', formData);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu thông tin!');
    }
  };

  const openAddModal = () => {
    setEditingSup(null);
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', taxCode: '', notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSup(sup);
    setFormData({
      name: sup.name, contactPerson: sup.contactPerson || '', phone: sup.phone || '', 
      email: sup.email || '', address: sup.address || '', taxCode: sup.taxCode || '', notes: sup.notes || ''
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: number) => {
    if(!window.confirm('Bạn có chắc muốn đổi trạng thái hợp tác với đối tác này?')) return;
    try {
      await apiClient.patch(`/suppliers/${id}/toggle-status`);
      fetchSuppliers();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-green-600" /> Quản lý Nhà cung cấp
          </h2>
        </div>
        <div className="flex w-full sm:w-auto space-x-3">
          <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input type="text" placeholder="Tìm tên, SĐT..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
          </div>
          <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-medium text-sm whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> Thêm đối tác
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-bold w-16">ID</th>
                <th className="p-4 font-bold">Thông tin Công ty</th>
                <th className="p-4 font-bold">Liên hệ</th>
                <th className="p-4 font-bold text-center">Trạng thái</th>
                <th className="p-4 font-bold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">
                   <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   Chưa có dữ liệu nhà cung cấp nào.
                </td></tr>
              ) : (
                filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-500 font-medium">#{sup.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-green-800 text-base">{sup.name}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> {sup.address || 'Chưa cập nhật địa chỉ'}</div>
                      {sup.taxCode && <div className="text-xs text-gray-500 mt-0.5">MST: {sup.taxCode}</div>}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{sup.contactPerson || '---'}</div>
                      <div className="flex items-center text-blue-600 mt-1"><Phone className="w-3 h-3 mr-1"/> {sup.phone || '---'}</div>
                    </td>
                    <td className="p-4 text-center">
                      {sup.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Hợp tác</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200"><XCircle className="w-3 h-3 mr-1" /> Ngừng GD</span>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => openEditModal(sup)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Sửa"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => toggleStatus(sup.id)} className={`p-1.5 rounded transition ${sup.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title="Đổi trạng thái">
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

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 bg-green-50 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-green-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2" /> {editingSup ? 'Cập nhật Đối tác' : 'Thêm Nhà cung cấp mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Tên công ty/Đối tác <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="VD: Công ty CP Dược phẩm VN" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Người đại diện</label><input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="VD: Nguyễn Văn A" /></div>
                <div><label className="block text-sm font-medium mb-1">Số điện thoại</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="VD: 0912..." /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="contact@company.com" /></div>
                <div><label className="block text-sm font-medium mb-1">Mã số thuế</label><input type="text" value={formData.taxCode} onChange={e => setFormData({...formData, taxCode: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="Số nhà, đường, quận..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú thêm</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Thông tin thanh toán công nợ, giao hàng..."></textarea>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">Hủy bỏ</button>
                <button type="submit" className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold shadow-sm">{editingSup ? 'Lưu cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}