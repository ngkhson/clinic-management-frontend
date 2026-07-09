// import React, { useState, useEffect } from 'react';
// import { Receipt, Banknote, CreditCard, CheckCircle2, Clock, FileText, Search, AlertCircle, X } from 'lucide-react';
// import axios from 'axios';

// 

// apiClient.interceptors.request.use((config: any) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// interface Invoice { id: number; appointmentId: number; patientName: string; doctorName: string; consultationFee: number; serviceFee: number; medicineFee: number; totalAmount: number; status: string; paymentMethod: string; createdAt: string; paidAt: string; }
// interface Appointment { id: number; patientName: string; doctorName: string; status: string; appointmentDate: string; timeSlot: string; }

// export default function AdminBilling() {
//   const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID'>('PENDING');
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Modal Thanh toán
//   const [isPayModalOpen, setIsPayModalOpen] = useState(false);
//   const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
//   const [paymentMethod, setPaymentMethod] = useState('CASH');
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const [appRes, invRes] = await Promise.all([
//         apiClient.get('/admin/all-appointments'),
//         apiClient.get('/invoices')
//       ]);
//       setAppointments(appRes.data.result || appRes.data);
//       setInvoices(invRes.data.result || invRes.data);
//     } catch (error) {
//       console.error('Lỗi tải dữ liệu thu ngân:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGenerateInvoice = async (appointmentId: number) => {
//     try {
//       await apiClient.post(`/invoices/generate/${appointmentId}`);
//       fetchData(); // Tải lại dữ liệu sau khi lập hóa đơn thành công
//     } catch (error) {
//       alert('Có lỗi xảy ra khi lập hóa đơn!');
//     }
//   };

//   const openPayModal = (invoice: Invoice) => {
//     setSelectedInvoice(invoice);
//     setPaymentMethod('CASH');
//     setIsPayModalOpen(true);
//   };

//   const handlePayInvoice = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedInvoice) return;
//     setIsProcessing(true);
//     try {
//       await apiClient.put(`/invoices/${selectedInvoice.id}/pay?method=${paymentMethod}`);
//       setIsPayModalOpen(false);
//       fetchData();
//       alert('Thanh toán thành công!');
//     } catch (error) {
//       alert('Có lỗi xảy ra khi thanh toán!');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // --- LỌC DỮ LIỆU ---
//   // Ca khám Đã xong NHƯNG Chưa có hóa đơn
//   const unbilledAppointments = appointments.filter(a => 
//     a.status === 'COMPLETED' && !invoices.find(i => i.appointmentId === a.id) &&
//     a.patientName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Hóa đơn chưa thanh toán
//   const unpaidInvoices = invoices.filter(i => 
//     i.status === 'UNPAID' && i.patientName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Hóa đơn đã thanh toán
//   const paidInvoices = invoices.filter(i => 
//     i.status === 'PAID' && i.patientName.toLowerCase().includes(searchTerm.toLowerCase())
//   ).sort((a, b) => b.id - a.id);

//   const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//           <Receipt className="w-6 h-6 mr-2 text-blue-600" /> Quản lý Viện phí & Thu ngân
//         </h2>
//         <div className="flex bg-gray-100 p-1 rounded-xl">
//           <button onClick={() => setActiveTab('PENDING')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PENDING' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Chờ thu ngân</button>
//           <button onClick={() => setActiveTab('PAID')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PAID' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Lịch sử thu</button>
//         </div>
//       </div>

//       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input type="text" placeholder="Tìm tên bệnh nhân..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
//       ) : activeTab === 'PENDING' ? (
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
//           {/* CỘT TRÁI: CA KHÁM CHỜ LẬP HÓA ĐƠN */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
//             <div className="p-5 border-b border-gray-100 bg-yellow-50/50 flex items-center justify-between shrink-0">
//               <h3 className="font-bold text-yellow-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-yellow-600" /> Bệnh án chờ Lập hóa đơn</h3>
//               <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{unbilledAppointments.length} ca</span>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
//               {unbilledAppointments.length === 0 ? (
//                 <div className="text-center py-12 text-gray-400 flex flex-col items-center"><CheckCircle2 className="w-12 h-12 mb-3 text-gray-300" /><p>Không có ca khám nào cần lập hóa đơn.</p></div>
//               ) : (
//                 <div className="space-y-3">
//                   {unbilledAppointments.map(app => (
//                     <div key={app.id} className="bg-white border border-yellow-100 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition">
//                       <div>
//                         <div className="font-bold text-gray-900">{app.patientName}</div>
//                         <div className="text-xs text-gray-500 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> BS. {app.doctorName} • {app.appointmentDate}</div>
//                       </div>
//                       <button onClick={() => handleGenerateInvoice(app.id)} className="px-4 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg text-sm font-bold transition whitespace-nowrap border border-yellow-200 hover:border-transparent shadow-sm">
//                         Lập Hóa Đơn
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* CỘT PHẢI: HÓA ĐƠN CHỜ THU TIỀN */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
//             <div className="p-5 border-b border-gray-100 bg-blue-50/50 flex items-center justify-between shrink-0">
//               <h3 className="font-bold text-blue-800 flex items-center"><Banknote className="w-5 h-5 mr-2 text-blue-600" /> Phiếu chờ Thu tiền</h3>
//               <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{unpaidInvoices.length} phiếu</span>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
//               {unpaidInvoices.length === 0 ? (
//                 <div className="text-center py-12 text-gray-400 flex flex-col items-center"><AlertCircle className="w-12 h-12 mb-3 text-gray-300" /><p>Không có hóa đơn nào đang chờ thu.</p></div>
//               ) : (
//                 <div className="space-y-4">
//                   {unpaidInvoices.map(inv => (
//                     <div key={inv.id} className="bg-white border border-blue-100 rounded-xl p-4 hover:shadow-md transition relative overflow-hidden group">
//                       <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div>
//                       <div className="flex justify-between items-start mb-3">
//                         <div>
//                           <div className="font-bold text-gray-900 text-lg">{inv.patientName}</div>
//                           <div className="text-xs text-gray-500">Mã hóa đơn: #{inv.id} • BS: {inv.doctorName}</div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Tổng thanh toán</div>
//                           <div className="text-xl font-black text-blue-600">{formatMoney(inv.totalAmount)}</div>
//                         </div>
//                       </div>
//                       <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1.5 mb-4">
//                         <div className="flex justify-between"><span className="text-gray-500">Tiền khám:</span> <span className="font-medium">{formatMoney(inv.consultationFee)}</span></div>
//                         <div className="flex justify-between"><span className="text-gray-500">Tiền cận lâm sàng:</span> <span className="font-medium">{formatMoney(inv.serviceFee)}</span></div>
//                         <div className="flex justify-between"><span className="text-gray-500">Tiền thuốc điện tử:</span> <span className="font-medium">{formatMoney(inv.medicineFee)}</span></div>
//                       </div>
//                       <button onClick={() => openPayModal(inv)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow-sm flex items-center justify-center">
//                         <Receipt className="w-4 h-4 mr-2" /> Tiến hành Thu tiền
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* TAB LỊCH SỬ THU */
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           <table className="w-full text-left whitespace-nowrap">
//             <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
//               <tr>
//                 <th className="p-4 font-semibold w-20">Mã HĐ</th>
//                 <th className="p-4 font-semibold">Bệnh nhân</th>
//                 <th className="p-4 font-semibold text-right">Tổng tiền</th>
//                 <th className="p-4 font-semibold text-center">Hình thức</th>
//                 <th className="p-4 font-semibold text-center">Thời gian thu</th>
//                 <th className="p-4 font-semibold text-center">Trạng thái</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {paidInvoices.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Chưa có lịch sử thu tiền.</td></tr> : 
//                paidInvoices.map((inv) => (
//                 <tr key={inv.id} className="hover:bg-gray-50 transition">
//                   <td className="p-4 text-gray-400 font-medium">#{inv.id}</td>
//                   <td className="p-4 font-bold text-gray-900">{inv.patientName}</td>
//                   <td className="p-4 text-right font-black text-green-600">{formatMoney(inv.totalAmount)}</td>
//                   <td className="p-4 text-center">
//                     {inv.paymentMethod === 'CASH' ? <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">Tiền mặt</span> : <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">Chuyển khoản</span>}
//                   </td>
//                   <td className="p-4 text-center text-sm text-gray-600">{inv.paidAt ? new Date(inv.paidAt).toLocaleString('vi-VN') : '---'}</td>
//                   <td className="p-4 text-center"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">Đã thanh toán</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* MODAL THU TIỀN */}
//       {isPayModalOpen && selectedInvoice && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
//             <div className="p-5 border-b border-gray-100 bg-blue-600 flex justify-between items-center text-white">
//               <h3 className="font-bold text-lg flex items-center"><Receipt className="w-5 h-5 mr-2" /> Thanh Toán Hóa Đơn</h3>
//               <button onClick={() => setIsPayModalOpen(false)} className="hover:text-blue-200 transition"><X className="w-5 h-5"/></button>
//             </div>
            
//             <form onSubmit={handlePayInvoice} className="p-6">
//               <div className="text-center mb-6">
//                 <p className="text-gray-500 text-sm mb-1">Bệnh nhân: <strong>{selectedInvoice.patientName}</strong></p>
//                 <p className="text-xs text-gray-400 mb-3">Mã HĐ: #{selectedInvoice.id}</p>
//                 <div className="inline-block bg-blue-50 border border-blue-100 rounded-2xl px-8 py-4">
//                   <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Cần thanh toán</p>
//                   <p className="text-4xl font-black text-blue-600">{formatMoney(selectedInvoice.totalAmount)}</p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <label className="block text-sm font-bold text-gray-700">Hình thức thanh toán</label>
//                 <div className="grid grid-cols-2 gap-4">
//                   <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
//                     <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
//                     <Banknote className="w-8 h-8 mb-2" />
//                     <span className="font-bold text-sm">Tiền mặt</span>
//                   </label>
//                   <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition ${paymentMethod === 'TRANSFER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
//                     <input type="radio" name="paymentMethod" value="TRANSFER" checked={paymentMethod === 'TRANSFER'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
//                     <CreditCard className="w-8 h-8 mb-2" />
//                     <span className="font-bold text-sm">Chuyển khoản</span>
//                   </label>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
//                 <button type="button" onClick={() => setIsPayModalOpen(false)} className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition">Hủy bỏ</button>
//                 <button type="submit" disabled={isProcessing} className={`flex items-center px-6 py-3 font-bold rounded-xl text-white shadow-sm transition ${isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
//                   {isProcessing ? 'Đang xử lý...' : <><CheckCircle2 className="w-5 h-5 mr-2" /> Xác nhận Đã Thu</>}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Receipt, Banknote, CreditCard, CheckCircle2, Clock, FileText, Search, AlertCircle, X, Printer, QrCode, RefreshCw } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../api/axiosConfig';

apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Invoice { id: number; appointmentId?: number; patientName: string; doctorName?: string; consultationFee?: number; serviceFee?: number; medicineFee?: number; totalAmount: number; status: string; paymentMethod: string; createdAt: string; paidAt: string; type?: 'MEDICAL' | 'RETAIL'; }
interface Appointment { id: number; patientName: string; doctorName: string; status: string; appointmentDate: string; timeSlot: string; }

export default function AdminBilling() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID'>('PENDING');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  
  // Pagination cho lịch sử
  const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  // Modal Thanh toán
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Trạng thái chờ Webhook ngân hàng
  const [isWaitingForBank, setIsWaitingForBank] = useState(false);

  const fetchData = () => {
    if (activeTab === 'PENDING') {
      fetchPendingData();
    } else {
      fetchHistoryData();
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, page, filterType, filterPayment, searchTerm]);

  const fetchPendingData = async () => {
    setIsLoading(true);
    try {
      const [appRes, invRes] = await Promise.all([
        apiClient.get('/admin/all-appointments/all'),
        apiClient.get('/invoices')
      ]);
      setAppointments(appRes.data.result || appRes.data);
      setInvoices(invRes.data.result || invRes.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu chờ thu ngân:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterType !== 'ALL') queryParams.append('type', filterType);
      if (filterPayment !== 'ALL') queryParams.append('method', filterPayment);

      const res = await apiClient.get(`/invoices/history?${queryParams.toString()}`);
      const pageData = res.data.result || res.data;
      setPaidInvoices(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
    } catch (error) {
      console.error('Lỗi tải lịch sử thu ngân:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGenerateInvoice = async (appointmentId: number) => {
    try {
      await apiClient.post(`/invoices/generate/${appointmentId}`);
      fetchData(); 
    } catch (error) {
      alert('Có lỗi xảy ra khi lập hóa đơn!');
    }
  };

  const openPayModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentMethod('CASH');
    setIsWaitingForBank(false);
    setIsPayModalOpen(true);
  };

  // Lắng nghe trạng thái Hóa đơn khi chọn Chuyển khoản (MÔ PHỎNG WEBHOOK)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPayModalOpen && paymentMethod === 'TRANSFER' && selectedInvoice) {
      setIsWaitingForBank(true);
      // Giả lập: Cứ 3 giây gọi API hỏi xem Hóa đơn này đã được Webhook Ngân hàng đổi thành PAID chưa
      interval = setInterval(async () => {
        try {
          // Trong thực tế, bạn sẽ tạo API: GET /api/invoices/{id}
          // Ở đây ta mô phỏng bằng cách kiểm tra state nội bộ (nếu được update bởi giả lập bên dưới)
          const currentInv = invoices.find(i => i.id === selectedInvoice.id);
          if (currentInv && currentInv.status === 'PAID') {
             setIsPayModalOpen(false);
             setIsWaitingForBank(false);
             alert('Hệ thống nhận diện: Khách hàng đã chuyển khoản thành công!');
             fetchData();
          }
        } catch (e) {}
      }, 3000);
    } else {
      setIsWaitingForBank(false);
    }

    return () => clearInterval(interval);
  }, [isPayModalOpen, paymentMethod, selectedInvoice, invoices]);

  // Xử lý thu tiền
  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsProcessing(true);
    try {
      if (paymentMethod === 'TRANSFER') {
        const res = await apiClient.post('/payment/create-url', {
          targetType: 'INVOICE',
          targetId: selectedInvoice.id
        });
        const url = res.data.result || res.data;
        if (url) {
          window.location.href = url;
        }
      } else {
        await apiClient.put(`/invoices/${selectedInvoice.id}/pay?method=${paymentMethod}`);
        setIsPayModalOpen(false);
        fetchData();
        alert('Thanh toán thành công!');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi thanh toán!');
    } finally {
      setIsProcessing(false);
    }
  };

  // NÚT GIẢ LẬP: Mô phỏng việc Ngân hàng nhận được tiền và gọi Webhook về Spring Boot
  const simulateBankWebhook = async () => {
    if (!selectedInvoice) return;
    try {
      await apiClient.put(`/invoices/${selectedInvoice.id}/pay?method=TRANSFER`);
      // Sau khi gọi API giả lập thành công, báo cho UI biết để trigger useEffect
      setInvoices(invoices.map(i => i.id === selectedInvoice.id ? {...i, status: 'PAID'} : i));
    } catch (error) {
      console.log(error);
    }
  };

  const formatMoney = (amount?: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // --- TÍNH NĂNG IN HÓA ĐƠN ---
  const handlePrintInvoice = async (inv: Invoice) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) { alert("Vui lòng cho phép popup để in hóa đơn."); return; }

    try {
      // Gọi API để lấy chi tiết dịch vụ và thuốc
      const res = await apiClient.get(`/invoices/${inv.id}/details`);
      const details = res.data.result || res.data;
      const services = details.services || [];
      const medicines = details.medicines || [];

      let servicesHtml = '';
      if (services.length > 0) {
        servicesHtml = `
          <tr><td colspan="2" class="font-bold bg-gray-100" style="background-color: #f3f4f6;">Dịch vụ cận lâm sàng</td></tr>
          ${services.map((s: any) => `
            <tr>
              <td style="padding-left: 20px;">- ${s.name}</td>
              <td class="text-right">${formatMoney(s.price)}</td>
            </tr>
          `).join('')}
        `;
      }

      let medicinesHtml = '';
      if (medicines.length > 0) {
        medicinesHtml = `
          <tr><td colspan="2" class="font-bold bg-gray-100" style="background-color: #f3f4f6;">Đơn thuốc / Bán lẻ</td></tr>
          ${medicines.map((m: any) => `
            <tr>
              <td style="padding-left: 20px;">- ${m.name} (${m.quantity} ${m.unit})</td>
              <td class="text-right">${formatMoney(m.total)}</td>
            </tr>
          `).join('')}
        `;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <title>Hóa Đơn Thu Tiền - MediCare</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; color: #1e3a8a; }
            .doc-title { text-align: center; margin-bottom: 30px; font-size: 22px; font-weight: bold; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 16px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: left; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 16px; }
            .signature { text-align: center; width: 250px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">HỆ THỐNG Y TẾ MEDICARE</h1>
            <div>Địa chỉ: 123 Đường Y Tế, Phường Sức Khỏe, Quận Trung Tâm</div>
            <div>Hotline: 1900 1234 - Website: medicare.vn</div>
          </div>
          <div class="doc-title">HÓA ĐƠN THU TIỀN VIỆN PHÍ</div>
          <div><strong>Mã Hóa Đơn:</strong> ${inv.type === 'RETAIL' ? 'RET' : 'INV'}-${inv.id}</div>
          <div><strong>Tên bệnh nhân:</strong> ${inv.patientName}</div>
          <div><strong>Bác sĩ chỉ định:</strong> ${inv.doctorName ? 'BS. ' + inv.doctorName : 'N/A'}</div>
          <div><strong>Hình thức thanh toán:</strong> ${inv.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản / Online'}</div>
          <div><strong>Thời gian thu:</strong> ${inv.paidAt ? new Date(inv.paidAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}</div>
          
          <table>
            <thead>
              <tr>
                <th>Nội dung thu</th>
                <th class="text-right">Thành tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHtml}
              ${medicinesHtml}
              <tr>
                <td class="font-bold text-right" style="font-size: 18px;">TỔNG CỘNG THANH TOÁN</td>
                <td class="font-bold text-right" style="font-size: 18px; color: #2563eb;">${formatMoney(inv.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <div>
              <p><strong>Ghi chú:</strong> Vui lòng giữ lại biên lai để đối chiếu khi cần thiết.</p>
            </div>
            <div class="signature">
              <p>Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</p>
              <p class="font-bold">Thu Ngân</p>
              <br><br><br><br>
              <p>(Ký, ghi rõ họ tên)</p>
            </div>
          </div>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 250);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết hóa đơn:", error);
      alert("Có lỗi xảy ra khi tải chi tiết hóa đơn để in!");
      printWindow.close();
    }
  };

  // --- LỌC DỮ LIỆU ---
  const unbilledAppointments = appointments.filter(a => 
    a.status === 'COMPLETED' && !invoices.find(i => i.type === 'MEDICAL' && i.appointmentId === a.id) &&
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unpaidInvoices = invoices.filter(i => 
    i.type === 'MEDICAL' && i.status === 'UNPAID' && 
    (i.patientName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Receipt className="w-6 h-6 mr-2 text-blue-600" /> Quản lý Viện phí & Thu ngân
        </h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('PENDING')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PENDING' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Chờ thu ngân</button>
          <button onClick={() => setActiveTab('PAID')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PAID' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Lịch sử thu</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Tìm tên bệnh nhân hoặc mã HĐ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        {activeTab === 'PAID' && (
          <div className="flex gap-4">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="py-2 px-4 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-600">
              <option value="ALL">Tất cả loại HĐ</option>
              <option value="MEDICAL">Khám bệnh</option>
              <option value="RETAIL">Bán lẻ thuốc</option>
            </select>
            <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className="py-2 px-4 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-600">
              <option value="ALL">Tất cả hình thức</option>
              <option value="CASH">Tiền mặt</option>
              <option value="TRANSFER">VNPay/Chuyển khoản</option>
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
      ) : activeTab === 'PENDING' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* CỘT TRÁI: CA KHÁM CHỜ LẬP HÓA ĐƠN */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
            <div className="p-5 border-b border-gray-100 bg-yellow-50/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-yellow-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-yellow-600" /> Bệnh án chờ Lập hóa đơn</h3>
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{unbilledAppointments.length} ca</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
              {unbilledAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 flex flex-col items-center"><CheckCircle2 className="w-12 h-12 mb-3 text-gray-300" /><p>Không có ca khám nào cần lập hóa đơn.</p></div>
              ) : (
                <div className="space-y-3">
                  {unbilledAppointments.map(app => (
                    <div key={app.id} className="bg-white border border-yellow-100 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition">
                      <div>
                        <div className="font-bold text-gray-900">{app.patientName}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> BS. {app.doctorName} • {app.appointmentDate}</div>
                      </div>
                      <button onClick={() => handleGenerateInvoice(app.id)} className="px-4 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg text-sm font-bold transition whitespace-nowrap border border-yellow-200 hover:border-transparent shadow-sm">
                        Lập Hóa Đơn
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: HÓA ĐƠN CHỜ THU TIỀN */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
            <div className="p-5 border-b border-gray-100 bg-blue-50/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-blue-800 flex items-center"><Banknote className="w-5 h-5 mr-2 text-blue-600" /> Phiếu chờ Thu tiền</h3>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{unpaidInvoices.length} phiếu</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
              {unpaidInvoices.length === 0 ? (
                <div className="text-center py-12 text-gray-400 flex flex-col items-center"><AlertCircle className="w-12 h-12 mb-3 text-gray-300" /><p>Không có hóa đơn nào đang chờ thu.</p></div>
              ) : (
                <div className="space-y-4">
                  {unpaidInvoices.map(inv => (
                    <div key={inv.id} className="bg-white border border-blue-100 rounded-xl p-4 hover:shadow-md transition relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{inv.patientName}</div>
                          <div className="text-xs text-gray-500">Mã hóa đơn: #{inv.id} • BS: {inv.doctorName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Tổng thanh toán</div>
                          <div className="text-xl font-black text-blue-600">{formatMoney(inv.totalAmount)}</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1.5 mb-4">
                        <div className="flex justify-between"><span className="text-gray-500">Tiền khám:</span> <span className="font-medium">{formatMoney(inv.consultationFee)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Tiền cận lâm sàng:</span> <span className="font-medium">{formatMoney(inv.serviceFee)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Tiền thuốc điện tử:</span> <span className="font-medium">{formatMoney(inv.medicineFee)}</span></div>
                      </div>
                      <button onClick={() => openPayModal(inv)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow-sm flex items-center justify-center">
                        <Receipt className="w-4 h-4 mr-2" /> Tiến hành Thu tiền
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TAB LỊCH SỬ THU */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold w-20">Mã HĐ</th>
                <th className="p-4 font-semibold">Bệnh nhân</th>
                <th className="p-4 font-semibold text-right">Tổng tiền</th>
                <th className="p-4 font-semibold text-center">Hình thức</th>
                <th className="p-4 font-semibold text-center">Thời gian thu</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paidInvoices.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Chưa có lịch sử thu tiền.</td></tr> : 
               paidInvoices.map((inv) => (
                <tr key={`${inv.type}-${inv.id}`} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-400 font-medium">
                    {inv.type === 'RETAIL' ? `RET-${inv.id}` : `INV-${inv.id}`} 
                    {inv.type === 'RETAIL' && <span className="ml-1 text-[10px] bg-teal-100 text-teal-700 px-1 py-0.5 rounded">BÁN LẺ</span>}
                  </td>
                  <td className="p-4 font-bold text-gray-900">{inv.patientName}</td>
                  <td className="p-4 text-right font-black text-green-600">{formatMoney(inv.totalAmount)}</td>
                  <td className="p-4 text-center">
                    {inv.paymentMethod === 'CASH' ? <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">Tiền mặt</span> : <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">Chuyển khoản / VNPay</span>}
                  </td>
                  <td className="p-4 text-center text-sm text-gray-600">{inv.paidAt ? new Date(inv.paidAt).toLocaleString('vi-VN') : '---'}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handlePrintInvoice(inv)} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold transition">
                      <Printer className="w-4 h-4 mr-1.5" /> In phiếu
                    </button>
                  </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {/* Phân trang */}
          {activeTab === 'PAID' && totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-500">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-sm font-medium"
                >
                  Trước
                </button>
                <button 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-sm font-medium"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL THU TIỀN VÀ HIỂN THỊ VIETQR */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 bg-blue-600 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold text-lg flex items-center"><Receipt className="w-5 h-5 mr-2" /> Thanh Toán Hóa Đơn</h3>
              <button onClick={() => setIsPayModalOpen(false)} className="hover:text-blue-200 transition"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm mb-1">Bệnh nhân: <strong>{selectedInvoice.patientName}</strong></p>
                <p className="text-xs text-gray-400 mb-3">Mã HĐ: #{selectedInvoice.id}</p>
                <div className="inline-block bg-blue-50 border border-blue-100 rounded-2xl px-8 py-4">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Cần thanh toán</p>
                  <p className="text-4xl font-black text-blue-600">{formatMoney(selectedInvoice.totalAmount)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Hình thức thanh toán</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    <Banknote className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">Tiền mặt</span>
                  </label>
                  <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition ${paymentMethod === 'TRANSFER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="TRANSFER" checked={paymentMethod === 'TRANSFER'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    <QrCode className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">Quét mã QR</span>
                  </label>
                </div>
              </div>

              {/* THANH TOÁN VNPAY ONLINE */}
              {paymentMethod === 'TRANSFER' && (
                <div className="mt-6 flex flex-col items-center justify-center p-5 bg-blue-50 rounded-2xl border border-blue-200 animate-fade-in relative overflow-hidden">
                  <p className="text-sm font-bold text-blue-800 mb-3 text-center">
                    Tạo link thanh toán trực tuyến qua VNPAY cho bệnh nhân
                  </p>
                  <button onClick={handlePayInvoice} disabled={isProcessing} className={`w-full flex justify-center items-center px-6 py-3 font-bold rounded-xl text-white shadow-sm transition ${isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isProcessing ? 'Đang tạo link...' : <><QrCode className="w-5 h-5 mr-2" /> Mở cổng thanh toán VNPAY</>}
                  </button>
                  <p className="text-xs text-blue-600 mt-3 text-center">Hệ thống sẽ chuyển hướng bạn đến cổng VNPAY an toàn.</p>
                </div>
              )}

              {/* CHỈ HIỂN THỊ NÚT XÁC NHẬN THỦ CÔNG KHI THU TIỀN MẶT */}
              {paymentMethod === 'CASH' && (
                <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setIsPayModalOpen(false)} className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition">Hủy bỏ</button>
                  <button onClick={handlePayInvoice} disabled={isProcessing} className={`flex items-center px-6 py-3 font-bold rounded-xl text-white shadow-sm transition ${isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isProcessing ? 'Đang xử lý...' : <><CheckCircle2 className="w-5 h-5 mr-2" /> Xác nhận Đã Thu Tiền Mặt</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}