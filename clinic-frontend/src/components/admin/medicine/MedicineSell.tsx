import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Search, ShoppingCart, Trash2, CheckCircle2, PackageX, Receipt } from 'lucide-react';
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

interface Medicine { id: number; name: string; unit: string; currentQuantity: number; sellingPrice: number; isActive: boolean; }
interface CartItem { medicineId: number; name: string; unit: string; quantity: number; unitPrice: number; maxQuantity: number; }

export default function MedicineSell({ onBack }: { onBack: () => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States cho Form POS
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await apiClient.get('/medicines/all');
      // Chỉ lấy thuốc đang hoạt động VÀ số lượng > 0 để hiển thị lên kệ bán
      setMedicines((res.data.result || res.data).filter((m: Medicine) => m.isActive && m.currentQuantity > 0));
    } catch (error) { console.error('Lỗi tải dữ liệu', error); }
  };

  const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Thêm thuốc vào Giỏ hàng
  const addToCart = (med: Medicine) => {
    const existingItem = cart.find(item => item.medicineId === med.id);
    if (existingItem) {
      if (existingItem.quantity + 1 > med.currentQuantity) {
         alert(`Trong kho chỉ còn ${med.currentQuantity} ${med.unit} của loại thuốc này!`);
         return;
      }
      setCart(cart.map(item => item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        medicineId: med.id, name: med.name, unit: med.unit, 
        quantity: 1, unitPrice: med.sellingPrice, maxQuantity: med.currentQuantity 
      }]);
    }
  };

  const updateCartItemQuantity = (id: number, newQty: number) => {
    const item = cart.find(i => i.medicineId === id);
    if (!item) return;
    
    if (newQty > item.maxQuantity) {
        alert(`Thuốc này trong kho chỉ còn tối đa ${item.maxQuantity}`);
        setCart(cart.map(i => i.medicineId === id ? { ...i, quantity: item.maxQuantity } : i));
        return;
    }
    setCart(cart.map(i => i.medicineId === id ? { ...i, quantity: newQty || 1 } : i));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.medicineId !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = async () => {
    if (cart.length === 0) { alert('Giỏ hàng trống!'); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim() === '' ? 'Khách mua lẻ' : customerName,
        paymentMethod: paymentMethod,
        details: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      const res = await apiClient.post('/retail', payload);
      
      if (paymentMethod === 'TRANSFER') {
         const invoice = res.data.result;
         if (invoice && invoice.id) {
            const payRes = await apiClient.post('/payment/create-url', {
               targetType: 'RETAIL',
               targetId: invoice.id
            });
            const url = payRes.data.result;
            if (url) {
               window.location.href = url;
               return; // Dừng tại đây, không hiện success vội
            }
         }
      }
      
      setIsSuccess(true);
    } catch (error: any) {
      alert(error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi tạo hóa đơn!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-500 mb-8 max-w-md">Hóa đơn đã được lưu hệ thống và số lượng thuốc trong kho đã tự động khấu trừ.</p>
        <div className="flex space-x-4">
          <button onClick={() => { setIsSuccess(false); setCart([]); setCustomerName(''); fetchMedicines(); }} className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 transition flex items-center">
            <Receipt className="w-5 h-5 mr-2" /> Bán hóa đơn mới
          </button>
          <button onClick={onBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">Về Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-teal-600 p-2 rounded-lg hover:bg-teal-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><ShoppingBag className="w-6 h-6 mr-2 text-teal-500" /> Bán thuốc lẻ (POS)</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* --- CỘT TRÁI: TÌM KIẾM THUỐC --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-gray-50/50 relative">
             <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Tìm kiếm thuốc (Tên)..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" 
             />
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {filteredMedicines.length === 0 ? (
                 <div className="text-center p-12 text-gray-400 flex flex-col items-center">
                    <PackageX className="w-12 h-12 mb-3 text-gray-300" />
                    Không tìm thấy loại thuốc nào phù hợp hoặc thuốc đã hết hàng.
                 </div>
              ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {filteredMedicines.map(med => (
                     <div key={med.id} onClick={() => addToCart(med)} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between group h-32">
                       <div>
                         <p className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-teal-700">{med.name}</p>
                         <p className="text-xs text-gray-500 mt-1">Còn lại: <span className="font-bold text-teal-600">{med.currentQuantity}</span> {med.unit}</p>
                       </div>
                       <div className="font-black text-lg text-teal-600 mt-2">
                         {new Intl.NumberFormat('vi-VN').format(med.sellingPrice)}đ
                       </div>
                     </div>
                   ))}
                 </div>
              )}
           </div>
        </div>

        {/* --- CỘT PHẢI: GIỎ HÀNG & THANH TOÁN --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col relative">
           
           <div className="p-5 border-b border-gray-100 bg-teal-50/30 flex items-center shrink-0">
             <ShoppingCart className="w-5 h-5 mr-2 text-teal-600"/>
             <h3 className="font-bold text-gray-800 text-lg">Giỏ hàng</h3>
             <span className="ml-auto bg-teal-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">{cart.length}</span>
           </div>

           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                  Giỏ hàng đang trống.<br/>Vui lòng chọn thuốc từ danh sách.
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="bg-white p-3 border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
                     <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-teal-600 font-medium text-xs mt-0.5">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}đ/{item.unit}</p>
                     </div>
                     <div className="flex items-center space-x-3 shrink-0">
                        <input 
                           type="number" min="1" max={item.maxQuantity}
                           value={item.quantity || ''} 
                           onChange={e => updateCartItemQuantity(item.medicineId, parseInt(e.target.value) || 0)} 
                           className="w-16 text-center py-1.5 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-gray-800" 
                        />
                        <div className="w-20 text-right font-black text-gray-800 text-sm">
                           {new Intl.NumberFormat('vi-VN').format(item.quantity * item.unitPrice)}
                        </div>
                        <button onClick={() => removeFromCart(item.medicineId)} className="text-gray-400 hover:text-red-500 transition p-1"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </div>
                ))
              )}
           </div>

           <div className="p-5 border-t border-gray-100 bg-white shrink-0">
             <div className="mb-4">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên khách hàng (Không bắt buộc)</label>
               <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nhập tên khách lẻ..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium" />
             </div>

             <div className="flex justify-between items-center mb-5 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
               <span className="text-gray-700 font-bold text-lg">Khách cần trả:</span>
               <span className="text-2xl font-black text-teal-600">
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
               </span>
             </div>
             
             <div className="mb-5 space-y-2">
               <label className="block text-xs font-bold text-gray-500 uppercase">Hình thức thanh toán</label>
               <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setPaymentMethod('CASH')} className={`py-2 px-3 border-2 rounded-xl text-sm font-bold transition ${paymentMethod === 'CASH' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                   Tiền mặt
                 </button>
                 <button onClick={() => setPaymentMethod('TRANSFER')} className={`py-2 px-3 border-2 rounded-xl text-sm font-bold transition ${paymentMethod === 'TRANSFER' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                   Chuyển khoản (VNPay)
                 </button>
               </div>
             </div>
             
             <button 
               onClick={handleSubmit} 
               disabled={isSubmitting || cart.length === 0}
               className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-sm transition flex items-center justify-center ${isSubmitting || cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-md'}`}
             >
               {isSubmitting ? 'Đang xuất hóa đơn...' : paymentMethod === 'TRANSFER' ? <><ShoppingCart className="w-5 h-5 mr-2" /> Mở cổng thanh toán VNPAY</> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Thanh Toán Xong</>}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}