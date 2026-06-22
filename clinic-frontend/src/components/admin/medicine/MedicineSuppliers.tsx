import React from 'react';
import { ArrowLeft, Truck, Plus } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function MedicineSuppliers({ onBack }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><Truck className="w-6 h-6 mr-2 text-green-600" /> Đối tác & Nhà cung cấp</h2>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-medium text-sm">
          <Plus className="w-4 h-4 mr-2" /> Thêm đối tác
        </button>
      </div>
      <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có dữ liệu nhà cung cấp</h3>
        <p className="text-gray-500">Khu vực này sẽ quản lý thông tin các công ty dược phẩm, số điện thoại, công nợ...</p>
      </div>
    </div>
  );
}