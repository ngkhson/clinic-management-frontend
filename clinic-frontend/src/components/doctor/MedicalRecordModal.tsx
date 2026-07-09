import React, { useState, useEffect } from 'react';
import {
  X, Save, FileText, Pill, Stethoscope, Search, Plus, Trash2,
  Box, Activity, AlertCircle, ClipboardList, Microscope, CalendarClock, Clock, CheckCircle2,
  Image as ImageIcon, UploadCloud, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

// ==========================================
// 1. CẤU HÌNH API & INTERFACES
// ==========================================
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Appointment { id: number; patientName: string; timeSlot: string; appointmentDate: string; status: string; symptoms: string; }
export interface MedicalService { id: number; name: string; category: string; price: number; isActive: boolean; }
export interface Medicine { id: number; name: string; unit: string; currentQuantity: number; isActive: boolean; }
export interface PrescriptionItem { medicineId: number; name: string; unit: string; maxQuantity: number; quantity: number; dosageInstruction: string; }

export interface Props {
  appointment: Appointment;
  services: MedicalService[];
  onClose: () => void;
  onSuccess: () => void;
}

// ==========================================
// 2. CÁC COMPONENT NHẬP KẾT QUẢ ĐỘNG (MỚI)
// ==========================================

// --- Form nhập Xét nghiệm (Dạng Bảng) ---
const LabResultEditor = ({ service, value, onChange }: { service: MedicalService, value: string, onChange: (val: string) => void }) => {
  let rows = [{ id: Date.now(), name: '', result: '', unit: '', ref: '', isAbnormal: false }];
  try { if (value) rows = JSON.parse(value); } catch (e) { /* fallback */ }

  const updateRow = (index: number, field: string, val: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: val };
    onChange(JSON.stringify(newRows));
  };

  const addRow = () => {
    onChange(JSON.stringify([...rows, { id: Date.now(), name: '', result: '', unit: '', ref: '', isAbnormal: false }]));
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    onChange(JSON.stringify(newRows.length > 0 ? newRows : [{ id: Date.now(), name: '', result: '', unit: '', ref: '', isAbnormal: false }]));
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm transition-all overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-bold text-blue-900">{service.name}</label>
        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold border border-blue-100">Xét Nghiệm</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="p-2 font-semibold">Chỉ số</th>
              <th className="p-2 font-semibold w-24 text-center">Kết quả</th>
              <th className="p-2 font-semibold w-20">Đơn vị</th>
              <th className="p-2 font-semibold w-24">Bình thường</th>
              <th className="p-2 font-semibold text-center w-10">⚠</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={row.id} className={row.isAbnormal ? 'bg-red-50/30' : ''}>
                <td className="p-2"><input type="text" value={row.name} onChange={e => updateRow(idx, 'name', e.target.value)} placeholder="VD: Glucose" className="w-full p-1.5 border border-gray-200 rounded outline-none focus:border-blue-400 bg-white" /></td>
                <td className="p-2"><input type="text" value={row.result} onChange={e => updateRow(idx, 'result', e.target.value)} className={`w-full p-1.5 border border-gray-200 rounded outline-none focus:border-blue-400 text-center font-bold bg-white ${row.isAbnormal ? 'text-red-600' : 'text-gray-900'}`} /></td>
                <td className="p-2"><input type="text" value={row.unit} onChange={e => updateRow(idx, 'unit', e.target.value)} placeholder="mmol/L" className="w-full p-1.5 border border-gray-200 rounded outline-none focus:border-blue-400 bg-white text-gray-500" /></td>
                <td className="p-2"><input type="text" value={row.ref} onChange={e => updateRow(idx, 'ref', e.target.value)} placeholder="3.9 - 6.4" className="w-full p-1.5 border border-gray-200 rounded outline-none focus:border-blue-400 bg-white text-gray-500" /></td>
                <td className="p-2 text-center"><input type="checkbox" checked={row.isAbnormal} onChange={e => updateRow(idx, 'isAbnormal', e.target.checked)} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500" title="Đánh dấu bất thường" /></td>
                <td className="p-2 text-center"><button onClick={() => removeRow(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"><Plus className="w-3 h-3 mr-1" /> Thêm chỉ số</button>
    </div>
  );
};

// --- Form nhập Hình ảnh / Thăm dò chức năng ---
const ImagingResultEditor = ({ service, value, onChange }: { service: MedicalService, value: string, onChange: (val: string) => void }) => {
  let data = { description: '', conclusion: '' };
  try { if (value) data = JSON.parse(value); } catch (e) { /* fallback */ }

  const updateField = (field: string, val: string) => {
    onChange(JSON.stringify({ ...data, [field]: val }));
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm transition-all">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <label className="block text-sm font-bold text-purple-900">{service.name}</label>
        <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold border border-purple-100">{service.category}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả hình ảnh / Tổn thương</label>
          <textarea value={data.description} onChange={e => updateField('description', e.target.value)} rows={3} placeholder="Mô tả chi tiết các phát hiện..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm leading-relaxed" />
        </div>
        <div>
          <label className="block text-xs font-bold text-red-600 mb-1">Kết luận</label>
          <input type="text" value={data.conclusion} onChange={e => updateField('conclusion', e.target.value)} placeholder="Kết luận cuối cùng..." className="w-full p-2.5 bg-white border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold text-gray-900" />
        </div>

        {/* Nút Upload giả lập */}
        <div className="pt-2">
          <button className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-purple-400 hover:text-purple-600 transition text-sm font-medium group">
            <UploadCloud className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Tải lên hình ảnh DICOM / Kết quả (Chưa hỗ trợ)
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Form mặc định ---
const DefaultResultEditor = ({ service, value, onChange }: { service: MedicalService, value: string, onChange: (val: string) => void }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all">
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-bold text-gray-900">{service.name}</label>
      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">{service.category}</span>
    </div>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-400 resize-none text-sm"
      placeholder="Ghi nhận kết quả..." rows={2}
    />
  </div>
);

// ==========================================
// 3. COMPONENT TABS CHÍNH
// ==========================================

const VitalsTab = ({ recordForm, handleChange }: any) => (
  <div className="space-y-6 animate-fade-in">
    <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center"><Activity className="w-5 h-5 mr-2 text-blue-600" /> Chỉ số sinh tồn</h4>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Huyết áp (mmHg)</label><input type="text" name="bp" value={recordForm.bp} onChange={handleChange} placeholder="VD: 120/80" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-white" /></div>
      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mạch (lần/p)</label><input type="number" name="pulse" value={recordForm.pulse} onChange={handleChange} placeholder="VD: 80" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-white" /></div>
      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nhiệt độ (°C)</label><input type="number" step="0.1" name="temp" value={recordForm.temp} onChange={handleChange} placeholder="VD: 37" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-white" /></div>
      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nhịp thở (lần/p)</label><input type="number" name="resp" value={recordForm.resp} onChange={handleChange} placeholder="VD: 18" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-white" /></div>
      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chiều cao (cm)</label><input type="number" name="height" value={recordForm.height} onChange={handleChange} placeholder="VD: 170" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-white" /></div>
      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cân nặng (kg)</label><input type="number" step="0.1" name="weight" value={recordForm.weight} onChange={handleChange} placeholder="VD: 60" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium bg-white" /></div>
    </div>
    <h4 className="font-bold text-gray-800 border-b pb-2 mt-8 flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-red-500" /> Thông tin Y tế quan trọng</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm font-bold text-gray-700 mb-1">Tiền sử bệnh lý</label><textarea name="medicalHistory" value={recordForm.medicalHistory} onChange={handleChange} rows={4} placeholder="Ví dụ: Cao huyết áp 5 năm..." className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea></div>
      <div><label className="block text-sm font-bold text-red-600 mb-1">Dị ứng (Thuốc/Thức ăn) <span className="text-red-500">*</span></label><textarea name="allergies" value={recordForm.allergies} onChange={handleChange} rows={4} placeholder="Ví dụ: Dị ứng Penicillin..." className="w-full p-3 border border-red-200 bg-red-50/30 rounded-xl outline-none focus:ring-2 focus:ring-red-500 resize-none text-red-700"></textarea></div>
    </div>
  </div>
);

const ClinicalTab = ({ recordForm, handleChange }: any) => (
  <div className="space-y-6 animate-fade-in">
    <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-blue-600" /> Bệnh sử & Khám Lâm sàng</h4>
    <div className="space-y-4">
      <div><label className="block text-sm font-bold text-gray-700 mb-1">Lý do đến khám <span className="text-red-500">*</span></label><input type="text" name="reasonForVisit" value={recordForm.reasonForVisit} onChange={handleChange} placeholder="VD: Đau bụng vùng thượng vị..." className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" /></div>
      <div><label className="block text-sm font-bold text-gray-700 mb-1">Bệnh sử (Quá trình diễn biến)</label><textarea name="illnessHistory" value={recordForm.illnessHistory} onChange={handleChange} rows={3} placeholder="VD: Đau bắt đầu từ 2 ngày trước..." className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea></div>
      <div><label className="block text-sm font-bold text-gray-700 mb-1">Triệu chứng lâm sàng (Khám thực thể)</label><textarea name="clinicalSymptoms" value={recordForm.clinicalSymptoms} onChange={handleChange} rows={4} placeholder="VD: Bụng mềm, ấn đau vùng thượng vị..." className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea></div>
    </div>
  </div>
);

const ServicesTab = ({ groupedServices, selectedServiceIds, handleToggleService }: any) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center border-b pb-2">
      <h4 className="font-bold text-gray-800 flex items-center"><Microscope className="w-5 h-5 mr-2 text-blue-600" /> Chỉ định Dịch vụ CLS</h4>
      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đã chọn: {selectedServiceIds.length}</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(groupedServices).map(([category, srvList]: any) => (
        <div key={category} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h5 className="font-bold text-sm text-blue-800 mb-3">{category}</h5>
          <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {srvList.map((srv: MedicalService) => (
              <label key={srv.id} className="flex items-start cursor-pointer group">
                <input type="checkbox" checked={selectedServiceIds.includes(srv.id)} onChange={() => handleToggleService(srv.id)} className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <div className="ml-3 flex-1">
                  <span className={`text-sm block transition ${selectedServiceIds.includes(srv.id) ? 'text-blue-700 font-bold' : 'text-gray-700 group-hover:text-blue-600'}`}>{srv.name}</span>
                  <span className="text-[10px] text-green-600 font-medium">{new Intl.NumberFormat('vi-VN').format(srv.price)}đ</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ParaclinicalResultsTab = ({ selectedServiceIds, services, resultsMap, handleResultChange, recordForm, handleChange }: any) => {
  const selectedServices = services.filter((s: MedicalService) => selectedServiceIds.includes(s.id));

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex justify-between items-center border-b pb-2 shrink-0">
        <h4 className="font-bold text-gray-800 flex items-center">
          <ClipboardList className="w-5 h-5 mr-2 text-blue-600" /> Ghi nhận Kết quả Cận lâm sàng
        </h4>
        {selectedServices.length > 0 && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" /> Vui lòng nhập kết quả cho {selectedServices.length} dịch vụ
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {selectedServices.length === 0 ? (
          <div className="text-gray-500 italic p-12 bg-gray-50 rounded-xl text-center flex flex-col items-center">
            <Microscope className="w-12 h-12 mb-3 text-gray-300" /> Ca khám này chưa có chỉ định Cận lâm sàng nào.
          </div>
        ) : (
          selectedServices.map((srv: MedicalService) => {
            // Render giao diện động dựa theo Category
            if (srv.category === 'XÉT NGHIỆM') {
              return <LabResultEditor key={srv.id} service={srv} value={resultsMap[srv.id]} onChange={(val) => handleResultChange(srv.id, val)} />
            }
            else if (['X-QUANG', 'SIÊU ÂM', 'ĐIỆN TIM', 'ĐIỆN NÃO', 'NỘI SOI'].includes(srv.category)) {
              return <ImagingResultEditor key={srv.id} service={srv} value={resultsMap[srv.id]} onChange={(val) => handleResultChange(srv.id, val)} />
            }
            else {
              return <DefaultResultEditor key={srv.id} service={srv} value={resultsMap[srv.id]} onChange={(val) => handleResultChange(srv.id, val)} />
            }
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 shrink-0">
        <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú chung CLS (Tùy chọn)</label>
        <textarea name="paraclinicalResults" value={recordForm.paraclinicalResults} onChange={handleChange} rows={2} placeholder="Ghi chú thêm từ Bác sĩ điều trị..." className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"></textarea>
      </div>
    </div>
  );
};

const DiagnosisTab = ({ recordForm, handleChange }: any) => (
  <div className="space-y-6 animate-fade-in">
    <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" /> Chốt Chẩn đoán & Kế hoạch điều trị</h4>
    <div className="space-y-6">
      <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
        <label className="block text-sm font-bold text-red-700 mb-2">Chẩn đoán xác định <span className="text-red-500">*</span></label>
        <input type="text" name="diagnosis" value={recordForm.diagnosis} onChange={handleChange} placeholder="VD: Viêm dạ dày cấp..." className="w-full p-3 bg-white border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-900 shadow-sm" />
      </div>
      <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
        <label className="block text-sm font-bold text-blue-800 mb-2">Hướng xử trí / Kế hoạch điều trị <span className="text-red-500">*</span></label>
        <textarea name="treatmentPlan" value={recordForm.treatmentPlan} onChange={handleChange} rows={3} placeholder="VD: Điều trị ngoại trú, uống thuốc theo toa..." className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm" />
      </div>
    </div>
  </div>
);

const PrescriptionTab = ({ medicines, searchTerm, setSearchTerm, prescriptionList, addMedicineToPrescription, updatePrescriptionItem, removeMedicine, recordForm, handleChange, filteredMedicines }: any) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-visible">
      <h4 className="font-bold text-blue-800 mb-3 flex items-center"><Pill className="w-5 h-5 mr-2 text-blue-600" /> Kê Toa Điện Tử (Lấy từ Kho)</h4>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Gõ tên thuốc để tìm trong kho..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm" />
        {searchTerm && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
            {filteredMedicines.length === 0 ? <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy thuốc.</div> : filteredMedicines.map((med: Medicine) => (
              <div key={med.id} onClick={() => addMedicineToPrescription(med)} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-50 transition">
                <div><p className="font-bold text-gray-800 text-sm">{med.name}</p><p className="text-xs text-gray-500">Tồn kho: <span className="font-bold text-blue-600">{med.currentQuantity}</span> {med.unit}</p></div>
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {prescriptionList.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
              <tr><th className="p-3 font-bold w-1/3">Tên thuốc</th><th className="p-3 font-bold text-center w-20">SL</th><th className="p-3 font-bold">Liều dùng (Sáng/Trưa/Chiều) <span className="text-red-500">*</span></th><th className="p-3 text-center w-10"></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptionList.map((item: PrescriptionItem) => (
                <tr key={item.medicineId}>
                  <td className="p-3"><p className="font-bold text-sm text-gray-800">{item.name}</p><span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">{item.unit}</span></td>
                  <td className="p-3"><input type="number" min="1" max={item.maxQuantity} required value={item.quantity || ''} onChange={e => updatePrescriptionItem(item.medicineId, 'quantity', parseInt(e.target.value) || 0)} className="w-full text-center p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-blue-600" /></td>
                  <td className="p-3"><input type="text" required value={item.dosageInstruction} onChange={e => updatePrescriptionItem(item.medicineId, 'dosageInstruction', e.target.value)} placeholder="VD: Ngày 2 lần..." className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></td>
                  <td className="p-3 text-center"><button type="button" onClick={() => removeMedicine(item.medicineId)} className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-gray-400 bg-white border border-gray-200 rounded-xl border-dashed">
          <Box className="w-6 h-6 mb-1 text-gray-300" /><p className="text-xs">Chưa kê thuốc từ Kho.</p>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm font-bold text-gray-700 mb-1">Thuốc tự túc / Mua ngoài</label><textarea name="prescription" value={recordForm.prescription} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3} placeholder="Nhập tay nếu thuốc không có trong kho..."></textarea></div>
      <div><label className="block text-sm font-bold text-gray-700 mb-1">Lời dặn dò</label><textarea name="notes" value={recordForm.notes} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3} placeholder="Kiêng đồ lạnh..."></textarea></div>
      <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1 flex items-center"><CalendarClock className="w-4 h-4 mr-1 text-blue-500" /> Ngày hẹn tái khám (Tùy chọn)</label><input type="date" name="followUpDate" min={new Date().toISOString().split('T')[0]} value={recordForm.followUpDate} onChange={handleChange} className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </div>
  </div>
);

// ==========================================
// 4. COMPONENT CHÍNH (MAIN EXPORT)
// ==========================================

export default function MedicalRecordModal({ appointment, services, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<'VITALS' | 'CLINICAL' | 'SERVICES' | 'RESULTS' | 'DIAGNOSIS' | 'PRESCRIPTION'>('VITALS');

  const [recordForm, setRecordForm] = useState({
    pulse: '', temp: '', bp: '', resp: '', height: '', weight: '',
    medicalHistory: '', allergies: '',
    reasonForVisit: appointment.symptoms || '', illnessHistory: '', clinicalSymptoms: '',
    paraclinicalResults: '',
    diagnosis: '', treatmentPlan: '',
    prescription: '', notes: '', followUpDate: ''
  });

  const [resultsMap, setResultsMap] = useState<Record<number, string>>({});
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const resMed = await apiClient.get('/medicines');
        const availableMeds = (resMed.data.result || resMed.data).filter((m: Medicine) => m.isActive && m.currentQuantity > 0);
        setMedicines(availableMeds);

        if (appointment.status === 'EXAMINING') {
          setIsLoadingDraft(true);
          const resDraft = await apiClient.get(`/doctor/medical-records/appointment/${appointment.id}`);

          if (resDraft.status === 200 && resDraft.data && resDraft.data.result) {
            const data = resDraft.data.result;

            let parsedResultsMap = {};
            let otherNotes = '';
            try {
              const parsed = JSON.parse(data.paraclinicalResults || '{}');
              parsedResultsMap = parsed.mapped || {};
              otherNotes = parsed.other || '';
            } catch (e) {
              otherNotes = data.paraclinicalResults || '';
            }

            setRecordForm({
              pulse: data.pulse || '', temp: data.temp || '', bp: data.bp || '', resp: data.resp || '', height: data.height || '', weight: data.weight || '',
              medicalHistory: data.medicalHistory || '', allergies: data.allergies || '',
              reasonForVisit: data.reasonForVisit || appointment.symptoms || '', illnessHistory: data.illnessHistory || '', clinicalSymptoms: data.clinicalSymptoms || '',
              paraclinicalResults: otherNotes,
              diagnosis: data.diagnosis || '', treatmentPlan: data.treatmentPlan || '',
              prescription: data.prescription || '', notes: data.notes || '', followUpDate: data.followUpDate || ''
            });

            setResultsMap(parsedResultsMap);
            if (data.serviceIds) setSelectedServiceIds(data.serviceIds);

            if (data.prescriptionDetails) {
              const loadedPrescriptions = data.prescriptionDetails.map((pd: any) => {
                const med = availableMeds.find((m: Medicine) => m.id === pd.medicineId);
                return {
                  medicineId: pd.medicineId, name: pd.medicineName, unit: pd.unit,
                  maxQuantity: med ? med.currentQuantity + pd.quantity : pd.quantity,
                  quantity: pd.quantity, dosageInstruction: pd.dosageInstruction
                };
              });
              setPrescriptionList(loadedPrescriptions);
            }
          }
        }
      } catch (error) { console.error("Lỗi tải dữ liệu", error); }
      finally { setIsLoadingDraft(false); }
    };
    fetchInitialData();
  }, [appointment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRecordForm({ ...recordForm, [e.target.name]: e.target.value });
  };

  const handleResultChange = (serviceId: number, value: string) => {
    setResultsMap(prev => ({ ...prev, [serviceId]: value }));
  };

  const handleToggleService = (id: number) => {
    setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]);
  };

  const groupedServices = services
    .reduce((acc: Record<string, MedicalService[]>, curr: MedicalService) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {} as Record<string, MedicalService[]>);

  const filteredMedicines = searchTerm === '' ? [] : medicines.filter((m: Medicine) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const addMedicineToPrescription = (med: Medicine) => {
    if (prescriptionList.find(item => item.medicineId === med.id)) return alert('Thuốc này đã có trong toa!');
    setPrescriptionList([...prescriptionList, { medicineId: med.id, name: med.name, unit: med.unit, maxQuantity: med.currentQuantity, quantity: 1, dosageInstruction: '' }]);
    setSearchTerm('');
  };

  const updatePrescriptionItem = (id: number, field: 'quantity' | 'dosageInstruction', value: any) => {
    setPrescriptionList(prescriptionList.map(item => {
      if (item.medicineId === id) {
        if (field === 'quantity' && value > item.maxQuantity) {
          alert(`Thuốc này trong kho chỉ còn ${item.maxQuantity} ${item.unit}`);
          return { ...item, quantity: item.maxQuantity };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeMedicine = (id: number) => {
    setPrescriptionList(prescriptionList.filter(item => item.medicineId !== id));
  };

  // LƯU NHÁP DƯỚI DẠNG JSON
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const combinedResults = JSON.stringify({ mapped: resultsMap, other: recordForm.paraclinicalResults });

      const payload = {
        appointmentId: appointment.id,
        ...recordForm,
        paraclinicalResults: combinedResults,
        serviceIds: selectedServiceIds,
        prescriptionDetails: prescriptionList.map(item => ({ medicineId: item.medicineId, quantity: item.quantity, dosageInstruction: item.dosageInstruction })),
        isDraft: true
      };

      await apiClient.post('/doctor/medical-records', payload);
      alert('Đã lưu nháp hồ sơ. Vui lòng hướng dẫn bệnh nhân đi làm Cận lâm sàng!');
      onSuccess();
    } catch (error: any) { alert(error.response?.data || 'Lỗi lưu nháp!'); } finally { setIsSaving(false); }
  };

  // HOÀN TẤT VÀ TRANSLATE JSON THÀNH STRING ĐẸP
  const handleSubmitComplete = async () => {
    if (!recordForm.diagnosis) return alert('Vui lòng nhập Chẩn đoán xác định trước khi hoàn tất!');
    if (prescriptionList.some(item => item.quantity <= 0 || item.dosageInstruction.trim() === '')) return alert('Vui lòng nhập đủ Số lượng và Liều dùng cho toa thuốc!');

    setIsSaving(true);
    try {
      let prettyPrintResults = '';

      selectedServiceIds.forEach(id => {
        const srv = services.find(s => s.id === id);
        if (srv && resultsMap[id]) {
          prettyPrintResults += `\n--- ${srv.name.toUpperCase()} ---\n`;

          if (srv.category === 'XÉT NGHIỆM') {
            try {
              const rows = JSON.parse(resultsMap[id]);
              rows.forEach((r: any) => {
                if (r.name || r.result) {
                  prettyPrintResults += `- ${r.name || 'Chỉ số'}: ${r.result} ${r.unit} ${r.ref ? `(CSBT: ${r.ref})` : ''} ${r.isAbnormal ? '[BẤT THƯỜNG]' : ''}\n`;
                }
              });
            } catch (e) { prettyPrintResults += resultsMap[id] + '\n'; }
          }
          else if (['X-QUANG', 'SIÊU ÂM', 'ĐIỆN TIM', 'ĐIỆN NÃO', 'NỘI SOI'].includes(srv.category)) {
            try {
              const data = JSON.parse(resultsMap[id]);
              if (data.description) prettyPrintResults += `+ Mô tả: ${data.description}\n`;
              if (data.conclusion) prettyPrintResults += `+ Kết luận: ${data.conclusion}\n`;
            } catch (e) { prettyPrintResults += resultsMap[id] + '\n'; }
          }
          else {
            prettyPrintResults += `${resultsMap[id]}\n`;
          }
        }
      });

      if (recordForm.paraclinicalResults) prettyPrintResults += `\n--- GHI CHÚ CHUNG ---\n${recordForm.paraclinicalResults}`;

      const payload = {
        appointmentId: appointment.id,
        ...recordForm,
        paraclinicalResults: prettyPrintResults.trim(),
        serviceIds: selectedServiceIds,
        prescriptionDetails: prescriptionList.map(item => ({ medicineId: item.medicineId, quantity: item.quantity, dosageInstruction: item.dosageInstruction })),
        isDraft: false
      };

      await apiClient.post('/doctor/medical-records', payload);
      alert('Đã hoàn tất ca khám và trừ tồn kho thuốc thành công!');
      onSuccess();
    } catch (error: any) { alert(error.response?.data || 'Lỗi hoàn tất ca khám!'); } finally { setIsSaving(false); }
  };

  if (isLoadingDraft) {
    return <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center"><div className="bg-white p-6 rounded-2xl shadow-xl font-bold text-blue-600 flex items-center"><Activity className="w-5 h-5 mr-2 animate-spin" /> Đang tải hồ sơ bệnh án cũ...</div></div>;
  }

  const tabs = [
    { id: 'VITALS', label: '1. Sinh hiệu & Tiền sử', icon: Activity },
    { id: 'CLINICAL', label: '2. Lâm sàng', icon: Stethoscope },
    { id: 'SERVICES', label: '3. Chỉ định CLS', icon: Microscope },
    { id: 'RESULTS', label: '4. Kết quả CLS', icon: ClipboardList },
    { id: 'DIAGNOSIS', label: '5. Chẩn đoán', icon: CheckCircle2 },
    { id: 'PRESCRIPTION', label: '6. Kê toa', icon: Pill },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-7xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-fade-in">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white shrink-0">
          <div>
            <h3 className="font-bold text-lg flex items-center"><FileText className="w-5 h-5 mr-2" /> Hồ Sơ Khám Bệnh - BN: {appointment.patientName}</h3>
            <p className="text-xs text-blue-100 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Mã ca khám: #{appointment.id} | Trạng thái: {appointment.status === 'EXAMINING' ? 'Chờ kết quả CLS' : 'Đang khám mới'}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-50/50 min-h-0">

          {/* CỘT TRÁI: ĐIỀU HƯỚNG */}
          <div className="w-full lg:w-64 bg-white border-r border-gray-200 shrink-0 overflow-y-auto p-4 space-y-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                <tab.icon className="w-5 h-5 mr-3" /> {tab.label}
              </button>
            ))}
          </div>

          {/* CỘT PHẢI: NỘI DUNG TABS */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
            {activeTab === 'VITALS' && <VitalsTab recordForm={recordForm} handleChange={handleChange} />}
            {activeTab === 'CLINICAL' && <ClinicalTab recordForm={recordForm} handleChange={handleChange} />}
            {activeTab === 'SERVICES' && <ServicesTab groupedServices={groupedServices} selectedServiceIds={selectedServiceIds} handleToggleService={handleToggleService} />}
            {activeTab === 'RESULTS' && <ParaclinicalResultsTab selectedServiceIds={selectedServiceIds} services={services} resultsMap={resultsMap} handleResultChange={handleResultChange} recordForm={recordForm} handleChange={handleChange} />}
            {activeTab === 'DIAGNOSIS' && <DiagnosisTab recordForm={recordForm} handleChange={handleChange} />}
            {activeTab === 'PRESCRIPTION' && <PrescriptionTab medicines={medicines} searchTerm={searchTerm} setSearchTerm={setSearchTerm} prescriptionList={prescriptionList} addMedicineToPrescription={addMedicineToPrescription} updatePrescriptionItem={updatePrescriptionItem} removeMedicine={removeMedicine} recordForm={recordForm} handleChange={handleChange} filteredMedicines={filteredMedicines} />}
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white shrink-0">
          <div className="text-sm text-gray-600 font-medium">
            Đã chọn: <strong className="text-blue-600">{selectedServiceIds.length}</strong> CLS & <strong className="text-blue-600">{prescriptionList.length}</strong> thuốc.
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm">
              Đóng
            </button>
            <button type="button" onClick={handleSaveDraft} disabled={isSaving || appointment.status === 'COMPLETED'} className="flex items-center px-6 py-2.5 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition shadow-sm disabled:opacity-50">
              <Clock className="w-4 h-4 mr-2" /> Lưu & Chờ KQ CLS
            </button>
            <button type="button" onClick={handleSubmitComplete} disabled={isSaving || appointment.status === 'COMPLETED'} className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50">
              {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Hoàn tất Ca khám</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}