import React from 'react';
import { Activity, X, FileText, Pill, Printer } from 'lucide-react';

export interface MedicalRecord {
  id: number;
  patientName?: string;
  diagnosis: string;
  treatmentPlan: string;
  prescription: string;
  notes: string;
  serviceNames?: string[];
  createdAt?: string;
}

interface Props {
  isOpen: boolean;
  record: MedicalRecord | null;
  isLoading: boolean;
  onClose: () => void;
}

export default function PatientRecordModal({ isOpen, record, isLoading, onClose }: Props) {
  if (!isOpen) return null;

  const handlePrint = () => {
    if (!record) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) { alert("Vui lòng cho phép popup để in đơn thuốc."); return; }

    const patientName = record.patientName || 'Bệnh nhân';
    const dateFormatted = record.createdAt 
      ? new Date(record.createdAt).toLocaleDateString('vi-VN') 
      : new Date().toLocaleDateString('vi-VN');

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
          @media print { body { padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">HỆ THỐNG Y TẾ MEDICARE</h1>
          <div class="subtitle">Địa chỉ: 123 Đường Y Tế, Phường Sức Khỏe, Quận Trung Tâm<br>Hotline: 1900 1234 - Website: medicare.vn</div>
        </div>
        <div class="doc-title">HỒ SƠ BỆNH ÁN & ĐƠN THUỐC</div>
        <div class="info-row"><span><strong>Họ và tên bệnh nhân:</strong> ${patientName}</span><span><strong>Ngày khám:</strong> ${dateFormatted}</span></div>
        <div class="info-row"><span><strong>Mã hồ sơ:</strong> #MC-${record.id}</span></div>
        
        <div class="section-title">1. Chẩn đoán lâm sàng:</div>
        <div class="content-box">${record.diagnosis}</div>
        <div class="section-title">2. Kế hoạch điều trị:</div>
        <div class="content-box">${record.treatmentPlan}</div>
        
        <div class="section-title">3. Chỉ định Cận lâm sàng:</div>
        <div class="content-box">
          ${record.serviceNames && record.serviceNames.length > 0 
            ? '<ul style="margin: 0; padding-left: 20px;">' + record.serviceNames.map(s => `<li>${s}</li>`).join('') + '</ul>' 
            : 'Không có chỉ định.'}
        </div>

        <div class="section-title">4. Chỉ định dùng thuốc (Kê toa):</div>
        <div class="prescription-box"><pre style="font-family: inherit; margin: 0; white-space: pre-wrap; font-size: 16px; line-height: 1.8;">${record.prescription}</pre></div>
        <div class="section-title">5. Lời dặn của Bác sĩ:</div>
        <div class="content-box"><i>${record.notes || 'Không có chỉ định thêm.'}</i></div>
        
        <div class="footer">
          <div></div>
          <div class="signature-box">
            <p style="margin: 0; font-style: italic;">Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
            <p style="margin-top: 5px; font-weight: bold;">Bác sĩ điều trị</p><br><br><br><br>
            <p style="margin: 0; color: #6b7280;">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
          <h3 className="text-xl font-bold text-green-800 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-green-600" />
            Chi Tiết Kết Quả Khám
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition bg-white rounded-full p-1 shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50/30">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">Đang tải hồ sơ...</div>
          ) : record ? (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" /> Chẩn đoán bệnh
                </h4>
                <p className="text-lg font-medium text-gray-900">{record.diagnosis}</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-50 -translate-y-10 translate-x-10 pointer-events-none"></div>
                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center relative z-10">
                  <Pill className="w-4 h-4 mr-2 text-blue-600" /> Đơn thuốc (Kê toa)
                </h4>
                <div className="whitespace-pre-line text-gray-800 font-medium leading-relaxed bg-white/70 p-5 rounded-xl border border-blue-50 relative z-10">
                  {record.prescription}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Kế hoạch điều trị</h4>
                  <p className="text-gray-700">{record.treatmentPlan}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Chỉ định Cận lâm sàng
                  </h4>
                  {record.serviceNames && record.serviceNames.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700 font-medium space-y-1">
                      {record.serviceNames.map((srv, idx) => (
                        <li key={idx}>{srv}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Không có chỉ định Cận lâm sàng.</p>
                  )}
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Lời dặn dò</h4>
                  <p className="text-gray-700 italic">{record.notes || 'Không có dặn dò thêm.'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-red-500 font-medium">Lỗi khi hiển thị dữ liệu!</div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button 
            onClick={handlePrint}
            disabled={!record}
            className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${record ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Printer className="w-5 h-5 mr-2" /> Lưu / In PDF
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition">
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}