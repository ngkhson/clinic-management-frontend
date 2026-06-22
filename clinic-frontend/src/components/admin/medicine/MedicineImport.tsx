import React from 'react';
import { ArrowLeft, PlusSquare, Search } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function MedicineImport({ onBack }: Props) {
  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><PlusSquare className="w-6 h-6 mr-2 text-yellow-500" /> Lập phiếu nhập kho</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Khung tìm thuốc */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <div className="p-4 border-b border-gray-100 relative">
             <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input type="text" placeholder="Tìm kiếm thuốc để nhập (Gõ tên)..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
           <div className="p-12 text-center flex-1 flex flex-col justify-center text-gray-400">
             Vui lòng tìm kiếm và chọn thuốc để thêm vào phiếu nhập
           </div>
        </div>
        {/* Khung thông tin phiếu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-5">
           <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Thông tin chứng từ</h3>
           <div className="space-y-4 flex-1">
             <div><label className="text-sm font-medium text-gray-700 block mb-1">Nhà cung cấp</label><select className="w-full p-2.5 border border-gray-300 rounded-lg"><option>Chọn nhà cung cấp...</option></select></div>
             <div><label className="text-sm font-medium text-gray-700 block mb-1">Ngày nhập</label><input type="date" className="w-full p-2.5 border border-gray-300 rounded-lg" defaultValue={new Date().toISOString().split('T')[0]} /></div>
             <div><label className="text-sm font-medium text-gray-700 block mb-1">Ghi chú</label><textarea className="w-full p-2.5 border border-gray-300 rounded-lg h-20 resize-none"></textarea></div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-100">
             <div className="flex justify-between font-bold text-lg mb-4"><span>Tổng tiền nhập:</span><span className="text-blue-600">0đ</span></div>
             <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-sm transition">Hoàn thành nhập kho</button>
           </div>
        </div>
      </div>
    </div>
  );
}