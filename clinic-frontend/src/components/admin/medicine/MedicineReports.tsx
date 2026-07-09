import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart2, Archive, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../../api/axiosConfig';

interface ReportData {
  totalMedicineTypes: number;
  lowStockCount: number;
  totalImportCost: number;
  totalRetailRevenue: number;
}

export default function MedicineReports({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/medicines/extra/report');
        setData(res.data.result || res.data);
      } catch (error) {
        console.error('Lỗi tải báo cáo:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><BarChart2 className="w-6 h-6 mr-2 text-blue-500" /> Báo cáo thống kê Kho Dược</h2>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="flex justify-center py-20 text-blue-600">Đang phân tích số liệu...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex justify-center items-center"><Archive className="w-6 h-6"/></div>
                </div>
                <p className="text-gray-500 font-medium mb-1">Loại thuốc trong kho</p>
                <h3 className="text-3xl font-black text-gray-900">{data.totalMedicineTypes}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex justify-center items-center"><AlertTriangle className="w-6 h-6"/></div>
                </div>
                <p className="text-gray-500 font-medium mb-1">Cần nhập thêm</p>
                <h3 className="text-3xl font-black text-red-600">{data.lowStockCount}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-teal-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex justify-center items-center"><TrendingUp className="w-6 h-6"/></div>
                </div>
                <p className="text-gray-500 font-medium mb-1">Doanh thu xuất thuốc</p>
                <h3 className="text-2xl font-black text-teal-600">{formatMoney(data.totalRetailRevenue)}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-orange-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex justify-center items-center"><DollarSign className="w-6 h-6"/></div>
                </div>
                <p className="text-gray-500 font-medium mb-1">Tổng chi phí nhập kho</p>
                <h3 className="text-2xl font-black text-orange-600">{formatMoney(data.totalImportCost)}</h3>
            </div>
          </div>

          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 mt-6">
            <h3 className="text-2xl font-black text-gray-800 mb-2">Lợi nhuận gộp</h3>
            <p className="text-gray-500 mb-6">Được tính từ (Doanh thu xuất thuốc - Chi phí nhập kho)</p>
            <div className={`inline-block px-8 py-4 rounded-3xl border-4 ${data.totalRetailRevenue >= data.totalImportCost ? 'border-green-100 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-red-700'}`}>
               <span className="text-4xl font-black">
                 {formatMoney(data.totalRetailRevenue - data.totalImportCost)}
               </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}