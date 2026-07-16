import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, UserRound, MapPin, Star, ChevronRight, Activity } from 'lucide-react';
import axios from 'axios';
import apiClient from '../api/axiosConfig';

interface Doctor {
  id: number;
  fullName: string;
  specialtyName: string;
  degree: string;
  biography: string;
  imageUrl?: string;
  averageRating: number;
  reviewCount: number;
  clinicAddress: string;
}

interface Specialty {
  id: number;
  name: string;
}

export default function DoctorListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy specialtyId và search từ URL nếu có
  const queryParams = new URLSearchParams(location.search);
  const initialSpecialty = queryParams.get('specialtyId') || '';
  const initialSearch = queryParams.get('search') || '';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  
  // States cho bộ lọc
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const res = await apiClient.get('/specialties');
      setSpecialties(res.data.result || res.data);
    } catch (error) { console.error('Lỗi tải chuyên khoa', error); }
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/doctors');
      setDoctors(res.data.result || res.data);
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

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center text-sm text-blue-200 mb-6 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
            <UserRound className="w-4 h-4 mr-1.5" /> Chuyên gia y tế
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            Đội ngũ Bác sĩ
          </h1>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto text-lg font-light">
            Hàng trăm chuyên gia y tế hàng đầu đã sẵn sàng chăm sóc sức khỏe cho bạn và gia đình.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR BỘ LỌC */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
            <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" /> Bộ lọc tìm kiếm
            </h3>
            
            <div className="space-y-6">
              {/* Search Box */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Tìm tên bác sĩ</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="VD: Nguyễn Văn A..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Chuyên khoa</label>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input type="radio" name="specialty" value="" checked={selectedSpecialty === ''} onChange={(e) => setSelectedSpecialty(e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-gray-700 font-medium group-hover:text-blue-600 transition text-sm">Tất cả chuyên khoa</span>
                  </label>
                  {specialties.map(spec => (
                    <label key={spec.id} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input type="radio" name="specialty" value={spec.id.toString()} checked={selectedSpecialty === spec.id.toString()} onChange={(e) => setSelectedSpecialty(e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <span className="text-gray-700 font-medium group-hover:text-blue-600 transition text-sm">{spec.name}</span>
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
                <div key={doc.id} className="group bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(37,99,235,0.1)] transition-all duration-500 border border-gray-100 flex flex-col hover:-translate-y-1 relative">
                  <div className="flex gap-5 mb-5">
                    <div className="w-24 h-24 bg-blue-50 rounded-[1.25rem] flex items-center justify-center shrink-0 border-2 border-white shadow-inner group-hover:border-blue-100 transition-colors overflow-hidden">
                      {doc.imageUrl ? (
                        <img src={doc.imageUrl} alt={doc.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <UserRound className="w-12 h-12 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 line-clamp-1 mb-1 tracking-tight">{doc.degree} {doc.fullName}</h3>
                      <p className="text-blue-600 font-semibold text-sm mb-3">{doc.specialtyName}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                        <span className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium">
                          <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" /> 
                          {doc.averageRating > 0 ? doc.averageRating.toFixed(1) : 'Chưa có'} 
                          <span className="text-amber-600/70 ml-1">({doc.reviewCount})</span>
                        </span>
                        <span className="flex items-center text-gray-500">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> 
                          <span className="truncate max-w-[120px]" title={doc.clinicAddress}>{doc.clinicAddress}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                    <button 
                      onClick={() => navigate(`/doctor/${doc.id}`)}
                      className="w-full flex justify-center items-center px-4 py-3 bg-gray-50 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-bold border border-gray-200 hover:border-transparent shadow-sm hover:shadow-blue-500/30"
                    >
                      Đặt khám ngay <ChevronRight className="w-5 h-5 ml-2" />
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