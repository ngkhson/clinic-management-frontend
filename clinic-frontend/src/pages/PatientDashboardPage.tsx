import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, Activity, LogOut, User, CheckCircle2, AlertCircle, X, Pill, Star, Printer } from 'lucide-react';
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

// Interfaces
interface Appointment {
  id: number;
  doctorName: string;
  timeSlot: string;
  appointmentDate: string;
  status: string;
  symptoms: string;
}

interface MedicalRecord {
  id: number;
  patientName?: string;
  diagnosis: string;
  treatmentPlan: string;
  prescription: string;
  notes: string;
  createdAt?: string;
}

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State Bệnh án
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isRecordLoading, setIsRecordLoading] = useState(false);

  // Modal State Đánh giá (Review)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedApptForReview, setSelectedApptForReview] = useState<Appointment | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const userEmail = localStorage.getItem('userEmail') || 'Bệnh nhân';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchAppointments();
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/patient/appointments');
      const sorted = response.data.sort((a: any, b: any) => b.id - a.id);
      setAppointments(sorted);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử khám:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecord = async (appointmentId: number) => {
    setIsModalOpen(true);
    setIsRecordLoading(true);
    setSelectedRecord(null);
    try {
      const response = await apiClient.get(`/patient/appointments/${appointmentId}/record`);
      setSelectedRecord(response.data);
    } catch (error) {
      alert('Không thể tải bệnh án. Có thể bác sĩ chưa cập nhật!');
      setIsModalOpen(false);
    } finally {
      setIsRecordLoading(false);
    }
  };

  // --- HÀM IN ẤN & XUẤT PDF ---
  const handlePrint = () => {
    if (!selectedRecord) return;
    
    // Mở một cửa sổ ẩn tạm thời
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Vui lòng cho phép popup để in đơn thuốc.");
      return;
    }

    const patientName = selectedRecord.patientName || 'Bệnh nhân';
    const dateFormatted = selectedRecord.createdAt 
      ? new Date(selectedRecord.createdAt).toLocaleDateString('vi-VN') 
      : new Date().toLocaleDateString('vi-VN');

    // Cấu trúc HTML giao diện tờ in A4
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Đơn Thuốc - MediCare</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 26px; font-weight: bold; color: #1e3a8a; margin: 0; text-transform: uppercase; }
          .subtitle { font-size: 14px; color: #4b5563; margin-top: 5px; }
          .doc-title { text-align: center; margin-bottom: 40px; font-size: 22px; font-weight: bold; text-transform: uppercase; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 16px; }
          .section-title { font-size: 16px; font-weight: bold; text-decoration: underline; margin-top: 30px; margin-bottom: 10px; color: #000; }
          .content-box { padding: 10px 0; font-size: 16px; }
          .prescription-box { border: 1px dashed #2563eb; padding: 20px; border-radius: 8px; background: #f8fafc; margin-top: 10px; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 16px; }
          .signature-box { text-align: center; width: 250px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">HỆ THỐNG Y TẾ MEDICARE</h1>
          <div class="subtitle">Địa chỉ: 123 Đường Y Tế, Phường Sức Khỏe, Quận Trung Tâm<br>Hotline: 1900 1234 - Website: medicare.vn</div>
        </div>
        
        <div class="doc-title">HỒ SƠ BỆNH ÁN & ĐƠN THUỐC</div>
        
        <div class="info-row">
          <span><strong>Họ và tên bệnh nhân:</strong> ${patientName}</span>
          <span><strong>Ngày khám:</strong> ${dateFormatted}</span>
        </div>
        <div class="info-row">
          <span><strong>Mã hồ sơ:</strong> #MC-${selectedRecord.id}</span>
        </div>
        
        <div class="section-title">1. Chẩn đoán lâm sàng:</div>
        <div class="content-box">${selectedRecord.diagnosis}</div>
        
        <div class="section-title">2. Kế hoạch điều trị:</div>
        <div class="content-box">${selectedRecord.treatmentPlan}</div>
        
        <div class="section-title">3. Chỉ định dùng thuốc (Kê toa):</div>
        <div class="prescription-box">
          <pre style="font-family: inherit; margin: 0; white-space: pre-wrap; font-size: 16px; line-height: 1.8;">${selectedRecord.prescription}</pre>
        </div>
        
        <div class="section-title">4. Lời dặn của Bác sĩ:</div>
        <div class="content-box"><i>${selectedRecord.notes || 'Không có chỉ định thêm. Khám lại khi có dấu hiệu bất thường.'}</i></div>
        
        <div class="footer">
          <div></div>
          <div class="signature-box">
            <p style="margin: 0; font-style: italic;">Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
            <p style="margin-top: 5px; font-weight: bold;">Bác sĩ điều trị</p>
            <br><br><br><br>
            <p style="margin: 0; color: #6b7280;">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Đợi render xong rồi bật hộp thoại in (Người dùng có thể chọn lưu PDF ở đây)
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // Tự động đóng sau khi in xong
    }, 250);
  };

  const openReviewModal = (appt: Appointment) => {
    setSelectedApptForReview(appt);
    setReviewForm({ rating: 5, comment: '' });
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForReview) return;
    
    setIsSubmittingReview(true);
    try {
      await apiClient.post('/reviews', {
        appointmentId: selectedApptForReview.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('Cảm ơn bạn đã gửi đánh giá!');
      setIsReviewModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data || 'Đã có lỗi xảy ra khi gửi đánh giá!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" /> Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Calendar className="w-3 h-3 mr-1" /> Đã xác nhận</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã khám</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Bệnh Nhân */}
      {/* <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MediCare</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-blue-600 font-medium flex items-center transition">
                <User className="w-5 h-5 mr-2 text-blue-600" /> {userEmail}
              </button>
              <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition">
                <LogOut className="w-4 h-4 mr-1" /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ sức khỏe của tôi</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Lịch sử Đặt khám
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-5 font-semibold w-16">Mã</th>
                  <th className="p-5 font-semibold">Bác sĩ phụ trách</th>
                  <th className="p-5 font-semibold">Thời gian hẹn</th>
                  <th className="p-5 font-semibold">Trạng thái</th>
                  <th className="p-5 font-semibold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Bạn chưa có lịch hẹn nào. <button onClick={() => navigate('/')} className="text-blue-600 font-medium hover:underline">Đặt lịch ngay!</button></td></tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-5 text-gray-400 font-medium">#{appt.id}</td>
                      <td className="p-5 font-bold text-gray-800">BS. {appt.doctorName}</td>
                      <td className="p-5">
                        <div className="flex items-center text-gray-900 font-medium">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" /> {appt.timeSlot}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{appt.appointmentDate}</div>
                      </td>
                      <td className="p-5">{getStatusBadge(appt.status)}</td>
                      <td className="p-5 text-center">
                        {appt.status === 'COMPLETED' ? (
                          <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                            <button
                              onClick={() => handleViewRecord(appt.id)}
                              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-bold transition"
                            >
                              <FileText className="w-4 h-4 mr-2" /> Đơn Thuốc
                            </button>
                            <button
                              onClick={() => openReviewModal(appt)}
                              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-xl text-sm font-bold transition ring-1 ring-yellow-200"
                            >
                              <Star className="w-4 h-4 mr-1.5 fill-yellow-500" /> Đánh giá
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Chưa có kết quả</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Chi Tiết Bệnh Án */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
              <h3 className="text-xl font-bold text-green-800 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-green-600" />
                Chi Tiết Kết Quả Khám
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition bg-white rounded-full p-1 shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50/30">
              {isRecordLoading ? (
                <div className="py-12 text-center text-gray-500">Đang tải hồ sơ...</div>
              ) : selectedRecord ? (
                <div className="space-y-6">
                  {/* Chẩn đoán */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" /> Chẩn đoán bệnh
                    </h4>
                    <p className="text-lg font-medium text-gray-900">{selectedRecord.diagnosis}</p>
                  </div>

                  {/* Toa thuốc */}
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-50 -translate-y-10 translate-x-10 pointer-events-none"></div>
                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center relative z-10">
                      <Pill className="w-4 h-4 mr-2 text-blue-600" /> Đơn thuốc (Kê toa)
                    </h4>
                    <div className="whitespace-pre-line text-gray-800 font-medium leading-relaxed bg-white/70 p-5 rounded-xl border border-blue-50 relative z-10">
                      {selectedRecord.prescription}
                    </div>
                  </div>

                  {/* Lời dặn & Kế hoạch */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Kế hoạch điều trị</h4>
                      <p className="text-gray-700">{selectedRecord.treatmentPlan}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Lời dặn dò</h4>
                      <p className="text-gray-700 italic">{selectedRecord.notes || 'Không có dặn dò thêm.'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-red-500 font-medium">Lỗi khi hiển thị dữ liệu!</div>
              )}
            </div>

            {/* --- NÚT ĐÓNG & NÚT IN PDF --- */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
              <button 
                onClick={handlePrint}
                disabled={!selectedRecord}
                className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${selectedRecord ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Printer className="w-5 h-5 mr-2" /> Lưu / In PDF
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đánh giá Bác sĩ */}
      {isReviewModalOpen && selectedApptForReview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-yellow-50/50">
              <h3 className="text-xl font-bold text-yellow-800 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500 fill-yellow-500" />
                Đánh giá Bác sĩ
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition bg-white rounded-full p-1 shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 bg-gray-50/30">
              <p className="text-center text-gray-600 mb-6">
                Bạn cảm thấy thế nào về ca khám với <br/>
                <strong className="text-gray-900 text-lg">BS. {selectedApptForReview.doctorName}</strong> ?
              </p>

              {/* Chọn Sao */}
              <div className="flex justify-center space-x-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>

              {/* Nhận xét */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét của bạn (Tùy chọn)</label>
                <textarea
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Bác sĩ tư vấn nhiệt tình, phòng khám sạch sẽ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none resize-none bg-white shadow-sm"
                ></textarea>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition"
                >
                  Bỏ qua
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingReview}
                  className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-sm transition ${isSubmittingReview ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                >
                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}