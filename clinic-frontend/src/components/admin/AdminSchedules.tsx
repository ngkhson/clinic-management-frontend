import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, X } from 'lucide-react';
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
  const defaultSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const [customSlots, setCustomSlots] = useState<string[]>([]);
  const [customTimeInput, setCustomTimeInput] = useState<string>('08:30');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [maxPatients, setMaxPatients] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // States cho việc sửa/xoá ca khám
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editMaxPatients, setEditMaxPatients] = useState<number>(1);

  useEffect(() => {
    const fetchDoctors = async () => {
      try { const res = await apiClient.get('/admin/doctors'); setDoctors(res.data.result || res.data); } catch (e) { console.error(e); }
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
      setExistingSchedules(res.data.result || res.data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const toggleSlotSelection = (slot: string) => {
    if (selectedSlots.includes(slot)) setSelectedSlots(selectedSlots.filter(s => s !== slot));
    else setSelectedSlots([...selectedSlots, slot]);
  };

  const handleAddCustomSlot = () => {
    if (customTimeInput && !defaultSlots.includes(customTimeInput) && !customSlots.includes(customTimeInput)) {
      setCustomSlots(prev => [...prev, customTimeInput].sort());
      // Tự động tick chọn giờ vừa thêm
      if (!selectedSlots.includes(customTimeInput)) {
        setSelectedSlots(prev => [...prev, customTimeInput]);
      }
    }
  };

  const handleGenerateSchedules = async () => {
    if (!selectedDocId || !selectedDate || selectedSlots.length === 0) { alert('Vui lòng chọn Bác sĩ, Ngày và ít nhất 1 khung giờ!'); return; }
    setIsLoading(true);
    try {
      const formattedSlots = selectedSlots.map(slot => ({
        timeSlot: slot,
        maxPatients: maxPatients
      }));
      await apiClient.post('/admin/schedules/generate', {
        doctorId: parseInt(selectedDocId),
        date: selectedDate,
        slots: formattedSlots
      });
      alert('Tạo lịch làm việc thành công!'); setSelectedSlots([]); fetchExistingSchedules();
    } catch (error) { alert('Có lỗi khi tạo lịch. Vui lòng kiểm tra lại!'); } finally { setIsLoading(false); }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditMaxPatients(schedule.maxPatients);
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;
    try {
      await apiClient.put(`/admin/schedules/${editingSchedule.id}`, { maxPatients: editMaxPatients });
      alert('Cập nhật thành công!');
      setEditingSchedule(null);
      fetchExistingSchedules();
    } catch (error) { alert('Có lỗi xảy ra!'); }
  };

  const handleDeleteSchedule = async () => {
    if (!editingSchedule) return;
    if (!window.confirm('Bạn có chắc muốn xoá ca khám này? Các lịch hẹn đã đặt của ca này có thể bị ảnh hưởng.')) return;
    try {
      await apiClient.delete(`/admin/schedules/${editingSchedule.id}`);
      alert('Đã xoá ca khám!');
      setEditingSchedule(null);
      fetchExistingSchedules();
    } catch (error) { alert('Có lỗi xảy ra!'); }
  };

  const existingTimeSlots = existingSchedules.map(s => s.timeSlot);

  // Tổng hợp tất cả các khung giờ để hiển thị
  const allSlotsToRender = Array.from(new Set([...defaultSlots, ...customSlots, ...existingTimeSlots])).sort();

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số bệnh nhân tối đa / ca</label>
              <input type="number" min="1" max="100" value={maxPatients} onChange={(e) => setMaxPatients(parseInt(e.target.value) || 1)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
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

                {/* Chọn giờ tuỳ chỉnh */}
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={customTimeInput}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleAddCustomSlot}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                  >
                    Thêm giờ
                  </button>
                </div>

                <button onClick={handleGenerateSchedules} disabled={selectedSlots.length === 0 || isLoading} className={`px-4 py-2 rounded-xl font-medium transition flex items-center ${selectedSlots.length === 0 || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                  <Plus className="w-4 h-4 mr-2" /> Tạo {selectedSlots.length} ca khám
                </button>
              </div>
              {isLoading && existingSchedules.length === 0 ? <p className="text-gray-500 text-center py-8">Đang tải dữ liệu...</p> : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {allSlotsToRender.map(slot => {
                    const existingSchedule = existingSchedules.find(s => s.timeSlot === slot);
                    const isExisting = !!existingSchedule;
                    const isSelected = selectedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => isExisting ? handleEditSchedule(existingSchedule!) : toggleSlotSelection(slot)}
                        className={`py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center justify-center relative overflow-hidden ${isExisting ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' : isSelected ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm ring-2 ring-blue-200' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'}`}
                      >
                        {isExisting && <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />}
                        {slot}
                        {isExisting && <span className="text-[10px] text-green-600 mt-1 uppercase tracking-wide">Tối đa: {existingSchedule.maxPatients}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL SỬA/XOÁ CA KHÁM */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Tuỳ chỉnh ca khám</h3>
              <button onClick={() => setEditingSchedule(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">Khung giờ: <strong className="text-gray-900 text-base">{editingSchedule.timeSlot}</strong></p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số bệnh nhân tối đa</label>
              <input
                type="number" min="1" max="100"
                value={editMaxPatients}
                onChange={(e) => setEditMaxPatients(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <button onClick={handleUpdateSchedule} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                Cập nhật ca khám
              </button>
              <button onClick={handleDeleteSchedule} className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition border border-red-100">
                Xoá ca khám
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}