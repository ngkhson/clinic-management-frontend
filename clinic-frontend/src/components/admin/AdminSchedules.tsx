import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2 } from 'lucide-react';
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

interface Doctor { id: number; fullName: string; degree: string; }
interface Schedule { id: number; timeSlot: string; currentPatients: number; maxPatients: number; }

export default function AdminSchedules() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [existingSchedules, setExistingSchedules] = useState<Schedule[]>([]);
  const defaultSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try { const res = await apiClient.get('/admin/doctors'); setDoctors(res.data); } catch (e) { console.error(e); }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDocId && selectedDate) fetchExistingSchedules();
    else setExistingSchedules([]);
  }, [selectedDocId, selectedDate]);

  const fetchExistingSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/schedules/doctor/${selectedDocId}?date=${selectedDate}`);
      setExistingSchedules(res.data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const toggleSlotSelection = (slot: string) => {
    if (selectedSlots.includes(slot)) setSelectedSlots(selectedSlots.filter(s => s !== slot));
    else setSelectedSlots([...selectedSlots, slot]);
  };

  const handleGenerateSchedules = async () => {
    if (!selectedDocId || !selectedDate || selectedSlots.length === 0) { alert('Vui lòng chọn Bác sĩ, Ngày và ít nhất 1 khung giờ!'); return; }
    setIsLoading(true);
    try {
      await apiClient.post('/admin/schedules/generate', { doctorId: parseInt(selectedDocId), date: selectedDate, timeSlots: selectedSlots, maxPatients: 1 });
      alert('Tạo lịch làm việc thành công!'); setSelectedSlots([]); fetchExistingSchedules(); 
    } catch (error) { alert('Có lỗi khi tạo lịch. Vui lòng kiểm tra lại!'); } finally { setIsLoading(false); }
  };

  const existingTimeSlots = existingSchedules.map(s => s.timeSlot);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Sắp xếp Lịch làm việc</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 h-fit">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Thiết lập bộ lọc</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Bác sĩ</label>
              <select value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">-- Vui lòng chọn --</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.degree} {d.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Ngày</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
          {!selectedDocId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
              <Calendar className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">Vui lòng chọn bác sĩ ở cột bên trái để xem và tạo lịch</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="font-bold text-lg text-gray-800">Khung giờ ngày <span className="text-blue-600">{selectedDate.split('-').reverse().join('/')}</span></h3>
                <button onClick={handleGenerateSchedules} disabled={selectedSlots.length === 0 || isLoading} className={`px-4 py-2 rounded-xl font-medium transition flex items-center ${selectedSlots.length === 0 || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                  <Plus className="w-4 h-4 mr-2" /> Tạo {selectedSlots.length} ca khám
                </button>
              </div>
              {isLoading && existingSchedules.length === 0 ? <p className="text-gray-500 text-center py-8">Đang tải dữ liệu...</p> : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {defaultSlots.map(slot => {
                    const isExisting = existingTimeSlots.includes(slot);
                    const isSelected = selectedSlots.includes(slot);
                    return (
                      <button key={slot} disabled={isExisting} onClick={() => toggleSlotSelection(slot)} className={`py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center justify-center relative overflow-hidden ${isExisting ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed' : isSelected ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm ring-2 ring-blue-200' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'}`}>
                        {isExisting && <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />}{slot}{isExisting && <span className="text-[10px] text-green-600 mt-1 uppercase tracking-wide">Đã mở</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}