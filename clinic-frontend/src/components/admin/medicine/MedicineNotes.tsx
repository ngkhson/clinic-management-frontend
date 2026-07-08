import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, Save } from 'lucide-react';
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

export default function MedicineNotes({ onBack }: { onBack: () => void }) {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await apiClient.get('/medicines/extra/note');
        setNote(res.data.content);
      } catch (error) {
        console.error('Lỗi tải ghi chú:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.post('/medicines/extra/note', { content: note });
      alert('Đã lưu Sổ ghi chú thành công!');
    } catch (error) {
      alert('Đã có lỗi xảy ra khi lưu ghi chú!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center"><FileText className="w-6 h-6 mr-2 text-purple-600" /> Sổ ghi chú Quầy thuốc</h2>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className={`flex items-center px-6 py-2.5 rounded-lg text-white font-bold transition shadow-sm ${isSaving || isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu Ghi Chú</>}
        </button>
      </div>

      <div className="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-200 min-h-[500px] flex flex-col relative">
         <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400 opacity-20 rounded-t-2xl"></div>
         <h3 className="font-bold text-yellow-800 mb-4 flex items-center shrink-0">
           <Calendar className="w-5 h-5 mr-2"/> Bàn giao công việc & Nhắc nhở chung
         </h3>
         
         {isLoading ? (
           <div className="flex-1 flex justify-center items-center text-yellow-600 font-medium">Đang mở sổ ghi chú...</div>
         ) : (
           <textarea 
             value={note}
             onChange={e => setNote(e.target.value)}
             className="flex-1 w-full p-4 bg-transparent border-0 focus:ring-0 outline-none text-gray-800 leading-relaxed resize-none text-lg placeholder-yellow-600/50" 
             placeholder="- Nhớ gọi điện cho NCC lấy thêm Augmentin...&#10;- Dọn dẹp quầy thuốc số 2...&#10;- Bàn giao ca: Chìa khóa để ở ngăn kéo số 1."
           ></textarea>
         )}
      </div>
    </div>
  );
}