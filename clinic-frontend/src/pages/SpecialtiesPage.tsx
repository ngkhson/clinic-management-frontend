import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ChevronRight, Home } from 'lucide-react';
import apiClient from '../api/axiosConfig';

interface Specialty {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export default function SpecialtiesPage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await apiClient.get('/specialties');
        const data = res.data.result !== undefined ? res.data.result : res.data;
        setSpecialties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách chuyên khoa:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpecialties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center text-sm text-blue-200 mb-6 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
            <button onClick={() => navigate('/')} className="hover:text-white flex items-center transition-colors">
              <Home className="w-4 h-4 mr-1.5" /> Trang chủ
            </button>
            <ChevronRight className="w-4 h-4 mx-2 text-blue-400" />
            <span className="text-white font-medium">Chuyên khoa</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            Khám phá Chuyên khoa
          </h1>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto text-lg font-light">
            Tìm kiếm bác sĩ giỏi nhất dựa trên chuyên khoa phù hợp với tình trạng sức khỏe của bạn.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 shadow-xl"></div>
          </div>
        ) : specialties.length === 0 ? (
          <div className="text-center text-gray-500 py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            Chưa có chuyên khoa nào trên hệ thống.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {specialties.map((specialty) => (
              <div 
                  key={specialty.id} 
                  onClick={() => navigate(`/specialty/${specialty.id}`)}
                  className="group bg-white rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(37,99,235,0.1)] transition-all duration-500 border border-gray-100 cursor-pointer flex flex-col hover:-translate-y-2 relative"
                >
                  <div className="h-48 rounded-[1.5rem] bg-gray-100 flex flex-col items-center justify-center relative overflow-hidden mb-4">
                    {specialty.imageUrl ? (
                      <>
                        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                        <img 
                          src={specialty.imageUrl} 
                          alt={specialty.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f8fafc/94a3b8?text=Error' }}
                        />
                      </>
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        <Activity className="w-10 h-10 mb-2" />
                        <span className="text-sm font-medium">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-4 flex-grow flex flex-col">
                    <h3 className="font-extrabold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors tracking-tight">{specialty.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed flex-grow">
                      {specialty.description}
                    </p>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Khám phá ngay
                      </span>
                      <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-300 shadow-sm group-hover:shadow-blue-500/30">
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300 -rotate-45 group-hover:rotate-0" />
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
