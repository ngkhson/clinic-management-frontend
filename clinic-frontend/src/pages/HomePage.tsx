import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, UserRound, ArrowRight, Activity, ShieldCheck, Stethoscope, Users, Star, BookOpen } from 'lucide-react';
import apiClient from '../api/axiosConfig';

interface Specialty {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface Doctor {
  id: number;
  fullName: string;
  degree: string;
  specialtyName: string;
  imageUrl?: string;
  averageRating: number;
  reviewCount: number;
  clinicAddress: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specsRes, docsRes] = await Promise.all([
          apiClient.get('/specialties'),
          apiClient.get('/doctors')
        ]);
        
        const specsData = specsRes.data.result !== undefined ? specsRes.data.result : specsRes.data;
        const docsData = docsRes.data.result !== undefined ? docsRes.data.result : docsRes.data;
        
        const specs = Array.isArray(specsData) ? specsData : [];
        const docs = Array.isArray(docsData) ? docsData : [];
        
        setSpecialties(specs);
        setDoctors(docs.slice(0, 4)); 
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-36 lg:pt-32 lg:pb-48 overflow-hidden bg-gradient-to-br from-[#0B1120] via-[#172554] to-[#1E1B4B]">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[100%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[80%] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 text-blue-200 text-sm font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Nền tảng y tế uy tín hàng đầu
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
              Chăm sóc sức khỏe <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Trao trọn niềm tin
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Kết nối bạn với hàng trăm chuyên gia y tế giỏi, đặt lịch khám chưa bao giờ dễ dàng và bảo mật đến thế.
            </p>
          </div>
        </div>
      </section>

      {/* --- THỐNG KÊ (OVERLAPPING) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <Stethoscope className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-1 tracking-tight">50+</h3>
            <p className="text-gray-500 font-medium text-sm md:text-base">Chuyên khoa</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <UserRound className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-1 tracking-tight">200+</h3>
            <p className="text-gray-500 font-medium text-sm md:text-base">Bác sĩ giỏi</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-cyan-100 transition-all duration-300">
              <Users className="w-7 h-7 text-cyan-600" />
            </div>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-1 tracking-tight">10k+</h3>
            <p className="text-gray-500 font-medium text-sm md:text-base">Bệnh nhân</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
              <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-1 tracking-tight">4.9</h3>
            <p className="text-gray-500 font-medium text-sm md:text-base">Đánh giá 5 sao</p>
          </div>
        </div>
      </section>

      <main className="flex-grow pb-24 relative">
        
        {/* --- CHUYÊN KHOA PHỔ BIẾN --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold tracking-wider text-sm uppercase mb-3">
                <Activity className="w-5 h-5" /> Khám phá dịch vụ
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Chuyên khoa nổi bật</h2>
            </div>
            <button onClick={() => navigate('/specialties')} className="group flex items-center text-gray-600 font-semibold hover:text-blue-600 transition-colors">
              Xem tất cả <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 shadow-xl"></div></div>
          ) : specialties.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">Chưa có chuyên khoa nào trên hệ thống.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {specialties.slice(0, 8).map((specialty) => (
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
        </section>

        {/* --- BÁC SĨ NỔI BẬT --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-wider text-sm uppercase mb-3">
                <UserRound className="w-5 h-5" /> Chuyên gia y tế
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Bác sĩ hàng đầu</h2>
            </div>
            <button onClick={() => navigate('/doctors')} className="group flex items-center text-gray-600 font-semibold hover:text-indigo-600 transition-colors">
              Xem tất cả <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 shadow-xl"></div></div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">Chưa có bác sĩ nào trên hệ thống.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {doctors.map((doc) => (
                <div key={doc.id} className="group bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                  {/* Decorative background circle */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="w-28 h-28 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600 shadow-lg group-hover:border-indigo-100 transition-colors overflow-hidden">
                    {doc.imageUrl ? (
                      <img src={doc.imageUrl} alt={doc.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <UserRound className="w-12 h-12" />
                    )}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{doc.fullName}</h3>
                  <p className="text-gray-500 font-medium text-sm mb-3">{doc.degree}</p>
                  
                  <span className="inline-block px-4 py-1.5 bg-indigo-50/80 text-indigo-700 rounded-full text-sm font-semibold mb-5 border border-indigo-100/50">
                    {doc.specialtyName}
                  </span>

                  <div className="flex flex-col items-center w-full gap-2 mb-6 border-t border-gray-100 pt-4">
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                      <span className="font-bold text-gray-800 mr-1">{doc.averageRating > 0 ? doc.averageRating.toFixed(1) : 'Chưa có'}</span>
                      <span className="text-gray-400">({doc.reviewCount} đánh giá)</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/doctor/${doc.id}`)}
                    className="w-full py-3.5 rounded-2xl bg-gray-50 text-gray-900 font-bold hover:bg-indigo-600 hover:text-white transition-all duration-300 mt-auto border border-gray-200 hover:border-indigo-600 shadow-sm hover:shadow-md"
                  >
                    Xem hồ sơ
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- CẨM NANG SỨC KHỎE --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-green-600 font-bold tracking-wider text-sm uppercase mb-3">
                <BookOpen className="w-5 h-5" /> Kiến thức y khoa
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Cẩm nang sức khỏe</h2>
            </div>
            <button onClick={() => navigate('/health-guide')} className="group flex items-center text-gray-600 font-semibold hover:text-green-600 transition-colors">
              Xem tất cả <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                title: '7 Thói Quen Nhỏ Giúp Bạn Khỏe Mạnh Hơn Mỗi Ngày',
                category: 'Thể chất',
                readTime: '5 phút đọc',
                image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'
              },
              {
                id: 2,
                title: 'Hiểu Đúng Về Chế Độ Ăn Eat Clean Dành Cho Người Mới',
                category: 'Dinh dưỡng',
                readTime: '7 phút đọc',
                image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'
              },
              {
                id: 3,
                title: 'Cách Nhận Biết Sớm Các Dấu Hiệu Về Tim Mạch',
                category: 'Tim mạch',
                readTime: '6 phút đọc',
                image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800'
              }
            ].map((article) => (
              <div 
                key={article.id} 
                onClick={() => navigate(`/health-guide/article/${article.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    {article.category}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2 font-medium">{article.readTime}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <button className="text-blue-600 font-semibold text-sm flex items-center group-hover:underline">
                    Đọc tiếp <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}