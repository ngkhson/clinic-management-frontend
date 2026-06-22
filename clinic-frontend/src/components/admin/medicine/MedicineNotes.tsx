import React from 'react';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function MedicineNotes({ onBack }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><FileText className="w-6 h-6 mr-2 text-purple-600" /> Sổ ghi chú</h2>
        </div>
      </div>
      <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200 min-h-[400px]">
         <h3 className="font-bold text-yellow-800 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2"/> Ghi chú công việc hôm nay</h3>
         <textarea className="w-full h-64 p-4 bg-transparent border-0 focus:ring-0 outline-none text-gray-700 leading-relaxed resize-none" placeholder="- Nhớ gọi điện cho NCC lấy thêm Augmentin...&#10;- Dọn dẹp quầy thuốc số 2..."></textarea>
      </div>
    </div>
  );
}