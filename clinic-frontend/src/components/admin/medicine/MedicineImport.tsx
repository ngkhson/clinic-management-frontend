import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusSquare, Search, Trash2, CheckCircle2, Box } from 'lucide-react';
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

interface Supplier { id: number; name: string; }
interface Medicine { id: number; name: string; unit: string; currentQuantity: number; isActive: boolean; }
interface CartItem { medicineId: number; name: string; unit: string; quantity: number; importPrice: number; }

export default function MedicineImport({ onBack }: { onBack: () => void }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States cho Form
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [supRes, medRes] = await Promise.all([
        apiClient.get('/suppliers/active'),
        apiClient.get('/medicines')
      ]);
      setSuppliers(supRes.data.result || supRes.data);
      setMedicines((medRes.data.result || medRes.data).filter((m: Medicine) => m.isActive)); // Chỉ lấy thuốc đang hoạt động
    } catch (error) { console.error('Lỗi tải dữ liệu', error); }
  };

  // Lọc thuốc dựa trên thanh tìm kiếm
  const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Thêm thuốc vào Phiếu nhập
  const addToCart = (med: Medicine) => {
    const exists = cart.find(item => item.medicineId === med.id);
    if (exists) {
      setCart(cart.map(item => item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { medicineId: med.id, name: med.name, unit: med.unit, quantity: 1, importPrice: 0 }]);
    }
  };

  // Cập nhật số lượng/giá
  const updateCartItem = (id: number, field: 'quantity' | 'importPrice', value: number) => {
    setCart(cart.map(item => item.medicineId === id ? { ...item, [field]: value } : item));
  };

  // Xóa khỏi phiếu
  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.medicineId !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);

  const handleSubmit = async () => {
    if (!selectedSupplier) { alert('Vui lòng chọn nhà cung cấp!'); return; }
    if (cart.length === 0) { alert('Phiếu nhập chưa có thuốc nào!'); return; }
    
    // Kiểm tra giá nhập và số lượng
    if (cart.some(item => item.quantity <= 0 || item.importPrice < 0)) {
        alert('Số lượng phải lớn hơn 0 và Giá nhập không được âm!'); return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId: parseInt(selectedSupplier),
        notes: notes,
        details: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          importPrice: item.importPrice
        }))
      };

      await apiClient.post('/imports', payload);
      setIsSuccess(true);
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu phiếu nhập!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nhập kho thành công!</h2>
        <p className="text-gray-500 mb-8 max-w-md">Số lượng thuốc đã được cộng dồn vào Kho. Bạn có thể kiểm tra lại trong phần Quản lý Kho thuốc.</p>
        <div className="flex space-x-4">
          <button onClick={() => { setIsSuccess(false); setCart([]); setNotes(''); }} className="px-6 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition">Nhập thêm phiếu mới</button>
          <button onClick={onBack} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm transition">Về Bảng điều khiển</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><PlusSquare className="w-6 h-6 mr-2 text-yellow-500" /> Lập phiếu Nhập kho</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* --- CỘT TRÁI: TÌM VÀ CHỌN THUỐC --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-gray-50/50">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <input 
                 type="text" 
                 placeholder="Tìm tên thuốc để nhập..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
               />
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2">
              {filteredMedicines.length === 0 ? (
                 <div className="text-center p-8 text-gray-400 text-sm">Không tìm thấy thuốc nào.</div>
              ) : (
                 <div className="space-y-1">
                   {filteredMedicines.map(med => (
                     <div key={med.id} onClick={() => addToCart(med)} className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg border border-transparent hover:border-blue-100 transition flex justify-between items-center group">
                       <div>
                         <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{med.name}</p>
                         <p className="text-xs text-gray-500">Tồn kho hiện tại: <span className="font-bold text-gray-700">{med.currentQuantity}</span> {med.unit}</p>
                       </div>
                       <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                         <PlusSquare className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
              )}
           </div>
        </div>

        {/* --- CỘT PHẢI: CHI TIẾT PHIẾU NHẬP --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col relative">
           
           {/* Header thông tin phiếu */}
           <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 shrink-0">
             <div className="flex-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
               <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium">
                 <option value="">-- Chọn nhà cung cấp --</option>
                 {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
               </select>
             </div>
             <div className="flex-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú (Tùy chọn)</label>
               <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Nhập theo hóa đơn số..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
             </div>
           </div>

           {/* Danh sách thuốc trong phiếu */}
           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Box className="w-12 h-12 mb-3 text-gray-300" />
                  <p>Chưa có thuốc nào trong phiếu nhập.</p>
                  <p className="text-sm">Hãy tìm và chọn thuốc ở danh sách bên trái.</p>
                </div>
              ) : (
                <table className="w-full text-left bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="p-3 font-bold">Tên thuốc</th>
                      <th className="p-3 font-bold text-center w-24">Số lượng</th>
                      <th className="p-3 font-bold text-right w-32">Giá nhập (VNĐ)</th>
                      <th className="p-3 font-bold text-right w-32">Thành tiền</th>
                      <th className="p-3 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3 font-bold text-sm text-gray-800">{item.name} <span className="font-normal text-xs text-gray-400 ml-1">({item.unit})</span></td>
                        <td className="p-3">
                          <input type="number" min="1" value={item.quantity || ''} onChange={e => updateCartItem(item.medicineId, 'quantity', parseInt(e.target.value) || 0)} className="w-full text-center p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-blue-600" />
                        </td>
                        <td className="p-3">
                          <input type="number" min="0" value={item.importPrice || ''} onChange={e => updateCartItem(item.medicineId, 'importPrice', parseFloat(e.target.value) || 0)} className="w-full text-right p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900 text-sm">
                          {new Intl.NumberFormat('vi-VN').format(item.quantity * item.importPrice)}
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => removeFromCart(item.medicineId)} className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
           </div>

           {/* Footer Tổng kết */}
           <div className="p-5 border-t border-gray-100 bg-white shrink-0">
             <div className="flex justify-between items-center mb-4">
               <span className="text-gray-500 font-bold uppercase text-sm">Tổng thanh toán:</span>
               <span className="text-2xl font-black text-blue-600">
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
               </span>
             </div>
             <button 
               onClick={handleSubmit} 
               disabled={isSubmitting || cart.length === 0}
               className={`w-full py-3.5 rounded-xl font-bold text-white text-lg shadow-sm transition ${isSubmitting || cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-md'}`}
             >
               {isSubmitting ? 'Đang lưu Phiếu nhập...' : 'Hoàn Thành Nhập Kho'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}