import React, { useState } from 'react';
import { X, Save, FileText, Pill, Stethoscope } from 'lucide-react';
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

interface Appointment { id: number; patientName: string; timeSlot: string; appointmentDate: string; }
interface MedicalService { id: number; name: string; category: string; price: number; isActive: boolean; }

interface Props {
  appointment: Appointment;
  services: MedicalService[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function MedicalRecordModal({ appointment, services, onClose, onSuccess }: Props) {
  const [recordForm, setRecordForm] = useState({ diagnosis: '', treatmentPlan: '', prescription: '', notes: '' });
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleService = (id: number) => {
    setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]);
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/doctor/medical-records', {
        appointmentId: appointment.id,
        diagnosis: recordForm.diagnosis,
        treatmentPlan: recordForm.treatmentPlan,
        prescription: recordForm.prescription,
        notes: recordForm.notes,
        serviceIds: selectedServiceIds 
      });
      alert('Đã lưu hồ sơ bệnh án và chỉ định dịch vụ thành công!');
      onSuccess();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu bệnh án!');
    } finally {
      setIsSaving(false);
    }
  };

  const groupedServices = services.filter(s => s.category !== 'KHÁM BỆNH').reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, MedicalService[]>);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-fade-in">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white shrink-0">
          <h3 className="font-bold text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2" /> Bệnh Án & Chỉ Định - Bệnh nhân: {appointment.patientName}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition"><X className="w-6 h-6"/></button>
        </div>

        <form id="recordForm" onSubmit={handleSubmitRecord} className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/30 min-h-0">
          {/* CỘT TRÁI: THÔNG TIN BỆNH ÁN */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-gray-200 space-y-5">
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">1. Cập nhật Bệnh án</h4>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Chẩn đoán bệnh <span className="text-red-500">*</span></label>
              <input required type="text" value={recordForm.diagnosis} onChange={(e) => setRecordForm({...recordForm, diagnosis: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Viêm họng cấp..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Kế hoạch điều trị <span className="text-red-500">*</span></label>
              <input required type="text" value={recordForm.treatmentPlan} onChange={(e) => setRecordForm({...recordForm, treatmentPlan: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Uống thuốc, theo dõi tại nhà..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-800 mb-1 flex items-center">
                <Pill className="w-4 h-4 mr-1 text-blue-600" /> Kê đơn thuốc <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea required value={recordForm.prescription} onChange={(e) => setRecordForm({...recordForm, prescription: e.target.value})} className="w-full px-4 py-3 border border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={4} placeholder="- Paracetamol 500mg: 10 viên..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lời dặn dò</label>
              <textarea value={recordForm.notes} onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} placeholder="Kiêng đồ lạnh..."></textarea>
            </div>
          </div>

          {/* CỘT PHẢI: CHỈ ĐỊNH DỊCH VỤ CẬN LÂM SÀNG */}
          <div className="w-full md:w-80 lg:w-[400px] p-6 overflow-y-auto custom-scrollbar bg-white shrink-0">
             <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
               <Stethoscope className="w-5 h-5 mr-2 text-blue-600" /> 2. Chỉ định Cận lâm sàng
             </h4>
             <p className="text-xs text-gray-500 mb-4">Tích chọn các dịch vụ cần thiết cho bệnh nhân.</p>
             <div className="space-y-6">
               {Object.entries(groupedServices).map(([category, srvList]) => (
                 <div key={category} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <h5 className="font-bold text-sm text-blue-800 mb-3">{category}</h5>
                    <div className="space-y-2.5">
                      {srvList.map(srv => (
                        <label key={srv.id} className="flex items-start cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={selectedServiceIds.includes(srv.id)}
                            onChange={() => handleToggleService(srv.id)}
                            className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <span className={`text-sm block transition ${selectedServiceIds.includes(srv.id) ? 'text-blue-700 font-bold' : 'text-gray-700 group-hover:text-blue-600'}`}>{srv.name}</span>
                            <span className="text-xs text-green-600 font-medium">{new Intl.NumberFormat('vi-VN').format(srv.price)}đ</span>
                          </div>
                        </label>
                      ))}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </form>
        
        {/* FOOTER MODAL */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <div className="text-sm text-gray-600 font-medium">Đã chọn: <strong className="text-blue-600">{selectedServiceIds.length}</strong> dịch vụ</div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-white transition">Hủy bỏ</button>
            <button type="submit" form="recordForm" disabled={isSaving} className={`flex items-center px-6 py-2.5 font-bold rounded-xl text-white shadow-sm transition ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu & Hoàn Thành</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}