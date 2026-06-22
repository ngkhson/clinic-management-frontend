import React from 'react';
import { ArrowLeft, BarChart2, Archive, AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function MedicineReports({ onBack }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><BarChart2 className="w-6 h-6 mr-2 text-blue-500" /> Báo cáo thống kê</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div><p className="text-gray-500 font-medium mb-1">Thuốc trong kho</p><h3 className="text-2xl font-bold text-gray-900">--</h3></div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex justify-center items-center"><Archive className="w-6 h-6"/></div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div><p className="text-gray-500 font-medium mb-1">Cần nhập thêm</p><h3 className="text-2xl font-bold text-red-600">--</h3></div>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex justify-center items-center"><AlertTriangle className="w-6 h-6"/></div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div><p className="text-gray-500 font-medium mb-1">Doanh thu bán lẻ</p><h3 className="text-2xl font-bold text-teal-600">0 đ</h3></div>
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex justify-center items-center"><TrendingUp className="w-6 h-6"/></div>
         </div>
      </div>
      <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
        <BarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Biểu đồ đang được xây dựng</h3>
        <p className="text-gray-500">Chức năng vẽ biểu đồ xuất nhập tồn sẽ sớm được cập nhật.</p>
      </div>
    </div>
  );
}