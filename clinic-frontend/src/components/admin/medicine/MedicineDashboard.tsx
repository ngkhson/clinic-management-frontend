import React, { useState, useEffect } from 'react';
import { Archive, PlusSquare, Truck, ShoppingBag, BarChart2, FileText, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../../api/axiosConfig';

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
  onNavigate: (view: 'DASHBOARD' | 'INVENTORY' | 'SUPPLIERS' | 'IMPORT' | 'SELL' | 'REPORTS' | 'NOTES') => void;
}

export default function MedicineDashboard({ onNavigate }: Props) {
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await apiClient.get('/medicines/alerts/low-stock');
        setLowStockMedicines(res.data.result || res.data);
      } catch (error) {
        console.error('Lỗi tải cảnh báo:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#0f4a6b] text-white text-center py-3 rounded-t-xl font-bold uppercase tracking-wider shadow-sm">
        Quản lý thuốc
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
        <button onClick={() => onNavigate('INVENTORY')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-pink-100 transition"><Archive className="w-8 h-8" /></div>
          <span className="font-bold text-blue-600 text-lg">Kho thuốc</span>
        </button>

        <button onClick={() => onNavigate('IMPORT')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition"><PlusSquare className="w-8 h-8" /></div>
          <span className="font-bold text-blue-600 text-lg">Nhập thuốc</span>
        </button>

        <button onClick={() => onNavigate('SUPPLIERS')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition"><Truck className="w-8 h-8" /></div>
          <span className="font-bold text-blue-600 text-lg">Nhà cung cấp</span>
        </button>

        <button onClick={() => onNavigate('SELL')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition"><ShoppingBag className="w-8 h-8" /></div>
          <span className="font-bold text-blue-600 text-lg">Bán thuốc</span>
        </button>

        <button onClick={() => onNavigate('REPORTS')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition"><BarChart2 className="w-8 h-8" /></div>
          <span className="font-bold text-blue-600 text-lg">Báo cáo</span>
        </button>

        <button onClick={() => onNavigate('NOTES')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all group">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition"><FileText className="w-8 h-8" /></div>
          <span className="font-bold text-blue-600 text-lg">Ghi chú</span>
        </button>
      </div>

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
                <tr><td colSpan={4} className="p-8 text-center text-green-600 font-medium">Tuyệt vời! Kho thuốc đang dồi dào.</td></tr>
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
}