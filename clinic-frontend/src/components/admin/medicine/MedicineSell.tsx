import React from 'react';
import { ArrowLeft, ShoppingBag, Search, ShoppingCart } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function MedicineSell({ onBack }: Props) {
  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><ShoppingBag className="w-6 h-6 mr-2 text-teal-500" /> Bán thuốc lẻ (POS)</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <div className="p-4 border-b border-gray-100 relative">
             <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input type="text" placeholder="Tìm kiếm thuốc (F2)..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
           </div>
           <div className="p-12 text-center flex-1 flex flex-col justify-center text-gray-400">
             Giỏ hàng trống. Hãy quét mã vạch hoặc tìm thuốc.
           </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-5">
           <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center"><ShoppingCart className="w-5 h-5 mr-2 text-teal-600"/> Thanh toán</h3>
           <div className="space-y-4 flex-1">
             <div><label className="text-sm font-medium text-gray-700 block mb-1">Khách hàng</label><input type="text" placeholder="Khách lẻ..." className="w-full p-2.5 border border-gray-300 rounded-lg"/></div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
             <div className="flex justify-between text-gray-600"><span>Tổng tiền:</span><span>0đ</span></div>
             <div className="flex justify-between text-gray-600"><span>Giảm giá:</span><span>0đ</span></div>
             <div className="flex justify-between font-black text-2xl mt-2 text-teal-600"><span>Khách cần trả:</span><span>0đ</span></div>
             <button className="w-full py-4 mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition text-lg flex justify-center items-center">Thanh toán ngay</button>
           </div>
        </div>
      </div>
    </div>
  );
}