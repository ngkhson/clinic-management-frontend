import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Activity, Calendar as CalendarIcon, UserRound, 
  Search, HeartPulse, Stethoscope, CheckCircle2, ArrowRight, X, Clock 
} from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Patient { id: number; fullName: string; email: string; phone: string; gender: string; address: string; status: string; dateOfBirth?: string; }
interface Specialty { id: number; name: string; description: string; imageUrl: string; }
interface Doctor { id: number; fullName: string; degree: string; specialtyName: string; biography: string; specialtyId?: number;}
interface Schedule { id: number; timeSlot: string; currentPatients: number; maxPatients: number; available?: boolean; }
interface Appointment { id: number; patientName: string; doctorName: string; timeSlot: string; appointmentDate: string; status: string; symptoms: string; }

export default function AdminReception() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // States cho Khách Vãng lai
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  
  // States cho Khách Đặt trước
  const [existingApptId, setExistingApptId] = useState<number | null>(null);

  const [symptoms, setSymptoms] = useState('');
  const [vitals, setVitals] = useState({ pulse: '', temp: '', bp: '', resp: '', height: '', weight: '', notes: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // States Đăng ký bệnh nhân
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', phone: '', gender: 'MALE', dateOfBirth: '', address: '', password: 'password123' });
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        fetchPatientsList();
        const [specRes, docRes, apptRes] = await Promise.all([
          apiClient.get('/specialties'),
          apiClient.get('/admin/doctors/all'),
          apiClient.get('/admin/all-appointments/all')
        ]);
        setSpecialties(specRes.data.result || specRes.data);
        setDoctors(docRes.data.result || docRes.data);
        setAllAppointments(apptRes.data.result || apptRes.data);
      } catch (error) { console.error('Lỗi tải dữ liệu ban đầu', error); }
    };
    fetchInitialData();
  }, []);

  const fetchPatientsList = async () => {
    try { const patRes = await apiClient.get('/admin/patients/all'); setPatients(patRes.data.result || patRes.data); } 
    catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate && !existingApptId) {
      apiClient.get(`/schedules/doctor/${selectedDoctor}?date=${selectedDate}`)
        .then((res: any) => { setSchedules(res.data.result || res.data); setSelectedSchedule(''); })
        .catch((err: any) => console.error(err));
    } else {
      setSchedules([]);
    }
  }, [selectedDoctor, selectedDate, existingApptId]);

  const filteredPatients = patients.filter(p => p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || (p.phone && p.phone.includes(searchTerm)));

  // Tự động quét xem Bệnh nhân này có lịch hẹn trong ngày hôm nay chưa
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingAppointmentsToday = selectedPatient 
    ? allAppointments.filter(a => a.patientName === selectedPatient.fullName && a.appointmentDate === todayStr && (a.status === 'PENDING' || a.status === 'CONFIRMED'))
    : [];

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setExistingApptId(null); // Reset lại lựa chọn đặt trước
    setSelectedSpecialty('');
    setSelectedDoctor('');
    setSelectedSchedule('');
    setSymptoms('');
  };

  const useExistingAppointment = (appt: Appointment) => {
    setExistingApptId(appt.id);
    setSymptoms(appt.symptoms || '');
  };

  const cancelExistingAppointment = () => {
    setExistingApptId(null);
  };

  const calculatedBMI = () => {
    if (vitals.height && vitals.weight) {
      const h = parseFloat(vitals.height) / 100;
      const w = parseFloat(vitals.weight);
      if (h > 0) return (w / (h * h)).toFixed(1);
    }
    return '--';
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault(); setIsRegistering(true);
    try {
      await apiClient.post('/auth/register', registerForm); alert('Đã đăng ký Bệnh nhân thành công!');
      setIsRegisterModalOpen(false); fetchPatientsList(); setRegisterForm({ fullName: '', email: '', phone: '', gender: 'MALE', dateOfBirth: '', address: '', password: 'password123' });
    } catch (error: any) { alert(error.response?.data || 'Có lỗi xảy ra!'); } finally { setIsRegistering(false); }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return alert('Vui lòng chọn Bệnh nhân!');
    // Nếu KHÔNG dùng lịch cũ thì phải bắt buộc chọn Bác sĩ và Khung giờ
    if (!existingApptId && (!selectedDoctor || !selectedSchedule)) return alert('Vui lòng phân luồng Bác sĩ và Khung giờ!');

    setIsSubmitting(true);
    try {
      const payload = {
        appointmentId: existingApptId, // Sẽ gửi ID nếu Lễ tân chọn dùng lịch cũ
        patientId: selectedPatient.id,
        doctorId: selectedDoctor ? parseInt(selectedDoctor) : null,
        scheduleId: selectedSchedule ? parseInt(selectedSchedule) : null,
        symptoms: symptoms,
        pulse: vitals.pulse ? parseInt(vitals.pulse) : null,
        temperature: vitals.temp ? parseFloat(vitals.temp) : null,
        bloodPressure: vitals.bp || null,
        respiratoryRate: vitals.resp ? parseInt(vitals.resp) : null,
        height: vitals.height ? parseFloat(vitals.height) : null,
        weight: vitals.weight ? parseFloat(vitals.weight) : null,
        bmi: calculatedBMI() !== '--' ? parseFloat(calculatedBMI()) : null,
        notes: vitals.notes
      };

      await apiClient.post('/admin/reception', payload);
      setSuccessMsg('Tiếp nhận thành công! Bệnh nhân đã được chuyển vào hàng đợi của Bác sĩ.');
      
      // Reload lại danh sách lịch hẹn để cập nhật trạng thái
      const apptRes = await apiClient.get('/admin/all-appointments/all');
      setAllAppointments(apptRes.data.result || apptRes.data);

      setTimeout(() => {
        setSuccessMsg(''); setSelectedPatient(null); setExistingApptId(null); setSelectedSpecialty('');
        setSelectedDoctor(''); setSymptoms(''); setVitals({ pulse: '', temp: '', bp: '', resp: '', height: '', weight: '', notes: '' });
      }, 3000);
    } catch (error: any) { alert(error.response?.data || 'Có lỗi xảy ra!'); } finally { setIsSubmitting(false); }
  };

  const availableDoctors = doctors.filter(d => selectedSpecialty ? d.specialtyId?.toString() === selectedSpecialty : true);

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 animate-fade-in p-2">
      <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-gray-100 bg-blue-50/50">
          <h2 className="font-bold text-gray-800 flex items-center mb-4"><UserRound className="w-5 h-5 mr-2 text-blue-600" /> Tra cứu Bệnh nhân</h2>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Tìm theo Tên hoặc SĐT..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2 bg-gray-50/30">
          {filteredPatients.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">Không tìm thấy bệnh nhân.</div> : filteredPatients.map(p => (
            <div key={p.id} onClick={() => handleSelectPatient(p)} className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedPatient?.id === p.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
              <h4 className={`font-bold text-sm ${selectedPatient?.id === p.id ? 'text-blue-800' : 'text-gray-800'}`}>{p.fullName}</h4>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-between"><span>SĐT: {p.phone || '---'}</span><span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium">{p.gender === 'MALE' ? 'Nam' : p.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span></p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white"><button onClick={() => setIsRegisterModalOpen(true)} className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-blue-600 font-medium hover:bg-blue-50 transition text-sm flex items-center justify-center"><UserPlus className="w-4 h-4 mr-2" /> Đăng ký Bệnh nhân mới</button></div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative min-w-0">
        {successMsg && <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 animate-fade-in"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-10 h-10 text-green-600"/></div><h2 className="text-2xl font-black text-gray-800 mb-2">Hoàn tất!</h2><p className="text-gray-600 font-medium">{successMsg}</p></div>}
        
        {!selectedPatient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8"><Activity className="w-16 h-16 mb-4 text-gray-200" /><p className="font-medium text-lg text-gray-500">Chưa chọn Bệnh nhân</p><p className="text-sm text-center">Vui lòng tìm và chọn bệnh nhân từ danh sách bên trái để tiếp nhận.</p></div>
        ) : (
          <>
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
              <div className="flex justify-between items-center">
                <div><h2 className="text-xl font-bold">{selectedPatient.fullName}</h2><p className="text-blue-100 text-sm mt-1">PID: #{selectedPatient.id} • Sinh ngày: {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('vi-VN') : '---'}</p></div>
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30 text-sm font-medium">Đang làm thủ tục</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gray-50/50">
              
              {/* KHU VỰC THÔNG MINH NHẬN DIỆN LỊCH ĐẶT TRƯỚC */}
              {pendingAppointmentsToday.length > 0 && !existingApptId && (
                 <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm relative overflow-hidden animate-fade-in">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-100 rounded-full opacity-50 -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-yellow-800 mb-2 flex items-center"><CalendarIcon className="w-5 h-5 mr-2" /> Khách đã đặt lịch trước hôm nay!</h3>
                      <p className="text-sm text-yellow-700 mb-4">Hệ thống phát hiện bệnh nhân này đã có lịch hẹn trên hệ thống. Bạn có muốn sử dụng lịch này không?</p>
                      <div className="space-y-2">
                         {pendingAppointmentsToday.map(appt => (
                           <div key={appt.id} className="bg-white p-3 rounded-xl border border-yellow-200 flex justify-between items-center shadow-sm">
                             <div>
                               <p className="font-bold text-gray-800 text-sm">BS. {appt.doctorName}</p>
                               <p className="text-xs text-gray-500 flex items-center mt-0.5"><Clock className="w-3 h-3 mr-1" /> {appt.timeSlot} • Mã lịch: #{appt.id}</p>
                             </div>
                             <button onClick={() => useExistingAppointment(appt)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold transition shadow-sm">Sử dụng lịch này</button>
                           </div>
                         ))}
                      </div>
                    </div>
                 </div>
              )}

              {/* ĐÃ CHỌN DÙNG LỊCH ĐẶT TRƯỚC */}
              {existingApptId && (
                 <div className="bg-green-50 p-5 rounded-2xl border border-green-200 shadow-sm flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-green-800 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2" /> Đang dùng lịch đặt trước (Mã #{existingApptId})</h3>
                      <p className="text-sm text-green-700 mt-1">Bỏ qua bước phân luồng Bác sĩ. Vui lòng đo sinh hiệu và Xác nhận tiếp nhận.</p>
                    </div>
                    <button onClick={cancelExistingAppointment} className="px-4 py-2 bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold transition shadow-sm">Hủy bỏ, tạo lịch mới</button>
                 </div>
              )}

              {/* BƯỚC 1: ĐO SINH HIỆU */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full opacity-50 pointer-events-none"></div><h3 className="font-bold text-gray-800 mb-4 flex items-center relative z-10 border-b pb-2"><HeartPulse className="w-5 h-5 mr-2 text-red-500" /> 1. Đo Sinh Hiệu (Tùy chọn)</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Huyết áp (mmHg)</label><input type="text" placeholder="120/80" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-center font-medium" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mạch (lần/p)</label><input type="number" placeholder="80" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-center font-medium" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nhiệt độ (°C)</label><input type="number" step="0.1" placeholder="37.0" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-center font-medium" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nhịp thở (lần/p)</label><input type="number" placeholder="18" value={vitals.resp} onChange={e => setVitals({...vitals, resp: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-center font-medium" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chiều cao (cm)</label><input type="number" placeholder="170" value={vitals.height} onChange={e => setVitals({...vitals, height: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-center font-medium" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cân nặng (kg)</label><input type="number" step="0.1" placeholder="65" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-center font-medium" /></div>
                   <div className="md:col-span-2 bg-gray-50 p-2 rounded-lg flex items-center justify-between border border-gray-100"><span className="text-xs font-bold text-gray-500 uppercase">Chỉ số BMI:</span><span className={`text-lg font-black ${calculatedBMI() !== '--' && parseFloat(calculatedBMI()) > 25 ? 'text-red-500' : 'text-blue-600'}`}>{calculatedBMI()}</span></div>
                 </div>
              </section>
              
              {/* BƯỚC 2: PHÂN LUỒNG KHÁM BỆNH (BỊ ẨN NẾU DÙNG LỊCH CŨ) */}
              <section className={`bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all ${existingApptId ? 'border-gray-200 opacity-50 pointer-events-none' : 'border-blue-200'}`}>
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div><h3 className="font-bold text-gray-800 mb-4 flex items-center relative z-10 border-b pb-2"><Stethoscope className="w-5 h-5 mr-2 text-blue-600" /> 2. Phân luồng Khám bệnh {existingApptId && '(Đã thiết lập)'}</h3>
                 <div className="space-y-5 relative z-10">
                   <div><label className="block text-sm font-bold text-gray-700 mb-1">Lý do khám / Triệu chứng <span className="text-red-500">*</span></label><textarea rows={2} value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Bệnh nhân báo đau đầu..." className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm resize-none bg-gray-50/50"></textarea></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="block text-sm font-bold text-gray-700 mb-1">Phòng khám / Chuyên khoa</label><select value={selectedSpecialty} onChange={e => {setSelectedSpecialty(e.target.value); setSelectedDoctor('');}} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white"><option value="">-- Chọn chuyên khoa --</option>{specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-1">Bác sĩ phụ trách <span className="text-red-500">*</span></label><select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white font-medium text-blue-900"><option value="">-- Phân công Bác sĩ --</option>{availableDoctors.map(d => <option key={d.id} value={d.id}>{d.degree} {d.fullName}</option>)}</select></div>
                   </div>
                   {selectedDoctor && !existingApptId && (
                     <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-3"><label className="block text-sm font-bold text-gray-700 flex items-center"><CalendarIcon className="w-4 h-4 mr-1 text-blue-500"/> Chọn ca khám</label><input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-1 border border-gray-300 rounded-md text-xs outline-none bg-white" /></div>
                        {schedules.length === 0 ? <p className="text-xs text-red-500 font-medium">Bác sĩ không có lịch.</p> : (
                          <div className="grid grid-cols-4 gap-2">
                            {schedules.map(sch => {
                              const isAvail = sch.available !== undefined ? sch.available : (sch as any).isAvailable !== false;
                              return (<button key={sch.id} disabled={!isAvail} onClick={() => setSelectedSchedule(sch.id.toString())} className={`py-2 text-xs font-bold rounded-lg border transition ${!isAvail ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : selectedSchedule === sch.id.toString() ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200 ring-offset-1' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'}`}>{sch.timeSlot}</button>)
                            })}
                          </div>
                        )}
                     </div>
                   )}
                 </div>
              </section>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white shrink-0 flex justify-end">
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || (!existingApptId && (!selectedDoctor || !selectedSchedule))} 
                className={`flex items-center px-8 py-3.5 rounded-xl font-bold text-white transition shadow-sm ${isSubmitting || (!existingApptId && (!selectedDoctor || !selectedSchedule)) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'}`}
              >
                {isSubmitting ? 'Đang xử lý...' : <><ArrowRight className="w-5 h-5 mr-2" /> Xác Nhận Tiếp Nhận Bệnh Nhân</>}
              </button>
            </div>
          </>
        )}
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-5 border-b border-gray-100 bg-blue-600 flex justify-between items-center text-white shrink-0"><h3 className="font-bold text-lg flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Đăng ký Bệnh nhân mới</h3><button onClick={() => setIsRegisterModalOpen(false)} className="hover:text-blue-200 transition"><X className="w-5 h-5"/></button></div>
             <form onSubmit={handleRegisterPatient} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label><input required type="text" value={registerForm.fullName} onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" /></div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-bold text-gray-700 mb-1">SĐT <span className="text-red-500">*</span></label><input required type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" /></div>
                 <div><label className="block text-sm font-bold text-gray-700 mb-1">Ngày sinh</label><input type="date" value={registerForm.dateOfBirth} onChange={(e) => setRegisterForm({...registerForm, dateOfBirth: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" /></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label><input required type="email" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" /></div>
                 <div><label className="block text-sm font-bold text-gray-700 mb-1">Giới tính</label><select value={registerForm.gender} onChange={(e) => setRegisterForm({...registerForm, gender: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white"><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></div>
               </div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ (Tùy chọn)</label><textarea rows={2} value={registerForm.address} onChange={(e) => setRegisterForm({...registerForm, address: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none"></textarea></div>
               <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6"><button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold transition">Hủy bỏ</button><button type="submit" disabled={isRegistering} className={`px-6 py-2.5 font-bold rounded-xl text-white shadow-sm transition ${isRegistering ? 'bg-blue-400' : 'bg-blue-600'}`}>{isRegistering ? 'Đang tạo...' : 'Tạo Bệnh nhân'}</button></div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}