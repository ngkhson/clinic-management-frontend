import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, UserRound, MapPin, Star, ChevronRight, Activity } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

interface Doctor {
  id: number;
  fullName: string;
  specialtyName: string;
  degree: string;
  biography: string;
  examinationPrice: number;
}

interface Specialty {
  id: number;
  name: string;
}

export default function DoctorListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy specialtyId từ URL nếu có (VD: user click từ trang chủ)
  const queryParams = new URLSearchParams(location.search);
  const initialSpecialty = queryParams.get('specialtyId') || '';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  
  // States cho bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const res = await apiClient.get('/specialties');
      setSpecialties(res.data);
    } catch (error) { console.error('Lỗi tải chuyên khoa', error); }
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/doctors');
      setDoctors(res.data);
    } catch (error) { console.error('Lỗi tải bác sĩ', error); } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Lọc (Lọc ở Front-end cho nhanh)
  const filteredDoctors = doctors.filter(doc => {
    const matchName = doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      doc.specialtyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecialty = selectedSpecialty === '' || doc.specialtyName === specialties.find(s => s.id.toString() === selectedSpecialty)?.name;
    return matchName && matchSpecialty;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar đơn giản (Có thể thay bằng component Navbar của bạn) */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MediCare</span>
            </div>
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-blue-600 font-medium transition">
              Về Trang chủ
            </button>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Đội ngũ Bác sĩ Chuyên khoa</h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
            Hàng trăm chuyên gia y tế hàng đầu đã sẵn sàng chăm sóc sức khỏe cho bạn và gia đình.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR BỘ LỌC */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-24">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" /> Bộ lọc tìm kiếm
            </h3>
            
            <div className="space-y-6">
              {/* Search Box */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm tên bác sĩ</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="VD: Nguyễn Văn A..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên khoa</label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" name="specialty" value="" checked={selectedSpecialty === ''} onChange={(e) => setSelectedSpecialty(e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-gray-700 group-hover:text-blue-600 transition text-sm">Tất cả chuyên khoa</span>
                  </label>
                  {specialties.map(spec => (
                    <label key={spec.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input type="radio" name="specialty" value={spec.id.toString()} checked={selectedSpecialty === spec.id.toString()} onChange={(e) => setSelectedSpecialty(e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <span className="text-gray-700 group-hover:text-blue-600 transition text-sm">{spec.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DANH SÁCH BÁC SĨ */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Đã tìm thấy <span className="text-blue-600">{filteredDoctors.length}</span> bác sĩ
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy bác sĩ nào!</h3>
              <p className="text-gray-500">Vui lòng thử thay đổi từ khóa tìm kiếm hoặc bộ lọc chuyên khoa.</p>
              <button onClick={() => {setSearchTerm(''); setSelectedSpecialty('');}} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium">Xóa bộ lọc</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow group">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border-2 border-blue-100 group-hover:border-blue-300 transition">
                      <UserRound className="w-10 h-10 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{doc.degree} {doc.fullName}</h3>
                      <p className="text-blue-600 font-medium text-sm mb-2">{doc.specialtyName}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center"><Star className="w-3.5 h-3.5 text-yellow-400 mr-1 fill-yellow-400" /> 4.9 (120+)</span>
                        <span className="flex items-center"><MapPin className="w-3.5 h-3.5 text-gray-400 mr-1" /> Cơ sở Quận 1</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500 block mb-0.5">Giá khám:</span>
                      <strong className="text-green-600 text-base">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.examinationPrice)}</strong>
                    </div>
                    <button 
                      onClick={() => navigate(`/doctor/${doc.id}`)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                    >
                      Đặt khám <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}