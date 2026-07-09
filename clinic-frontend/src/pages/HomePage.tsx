import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, UserRound, ArrowRight } from 'lucide-react';
import axios from 'axios';
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
}

export default function HomePage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song 2 API để tối ưu thời gian tải
        const [specsRes, docsRes] = await Promise.all([
          apiClient.get('/specialties'),
          apiClient.get('/doctors')
        ]);
        
        const specsData = specsRes.data.result !== undefined ? specsRes.data.result : specsRes.data;
        const docsData = docsRes.data.result !== undefined ? docsRes.data.result : docsRes.data;
        
        const specs = Array.isArray(specsData) ? specsData : [];
        const docs = Array.isArray(docsData) ? docsData : [];
        
        setSpecialties(specs);
        // Chỉ lấy 4 bác sĩ nổi bật nhất để hiển thị ở trang chủ
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 
        LƯU Ý: Không cần Navbar ở đây nữa, 
        vì chúng ta đã bọc Navbar ở cấp ngoài cùng trong App.tsx 
      */}

      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white py-20 lg:py-28 overflow-hidden">
        {/* Hình nền mờ ảo (Tùy chọn) */}
        <div className="absolute inset-0 bg-blue-700 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, #ffffff 10%, transparent 50%)' }}></div>
             
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Chăm sóc sức khỏe, <br className="hidden md:block" />
            <span className="text-blue-200">Trao trọn niềm tin</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu. Kết nối bạn với hàng trăm bác sĩ chuyên khoa giỏi một cách dễ dàng và nhanh chóng.
          </p>
          
          {/* Thanh tìm kiếm nổi */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 sm:p-3 flex items-center shadow-2xl transform transition-transform hover:scale-[1.02]">
            <Search className="h-6 w-6 text-gray-400 ml-3 mr-2" />
            <input 
              type="text" 
              placeholder="Bạn muốn tìm chuyên khoa, bác sĩ hay triệu chứng gì?" 
              className="w-full px-2 py-3 text-gray-900 focus:outline-none text-base bg-transparent"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-colors whitespace-nowrap shadow-md">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Khối Thông kê Nhanh */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
          <div><h3 className="text-3xl font-black text-blue-600 mb-1">50+</h3><p className="text-gray-500 font-medium">Chuyên khoa</p></div>
          <div><h3 className="text-3xl font-black text-blue-600 mb-1">200+</h3><p className="text-gray-500 font-medium">Bác sĩ giỏi</p></div>
          <div><h3 className="text-3xl font-black text-blue-600 mb-1">10k+</h3><p className="text-gray-500 font-medium">Bệnh nhân</p></div>
          <div><h3 className="text-3xl font-black text-blue-600 mb-1">4.9/5</h3><p className="text-gray-500 font-medium">Đánh giá</p></div>
        </div>
      </section>

      <main className="flex-grow pb-20">
        
        {/* Danh sách Chuyên khoa */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Chuyên khoa phổ biến</h2>
              <p className="text-gray-500 mt-2">Lựa chọn chuyên khoa phù hợp với tình trạng của bạn</p>
            </div>
            <button className="hidden sm:flex items-center text-blue-600 font-semibold hover:text-blue-800 transition">
              Xem tất cả <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : specialties.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">Chưa có chuyên khoa nào trên hệ thống.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {specialties.map((specialty) => (
                <div 
                  key={specialty.id} 
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer flex flex-col"
                >
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={specialty.imageUrl || `https://ui-avatars.com/api/?name=${specialty.name}&background=random&color=fff&size=512`} 
                      alt={specialty.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${specialty.name}&background=0D8ABC&color=fff&size=512` }}
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{specialty.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                      {specialty.description}
                    </p>
                    <button 
                      onClick={() => navigate(`/specialty/${specialty.id}`)}
                      className="mt-auto flex items-center text-blue-600 font-medium text-sm hover:underline"
                    >
                      Đặt khám chuyên khoa này <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danh sách Bác sĩ Nổi bật */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Bác sĩ nổi bật</h2>
              <p className="text-gray-500 mt-2">Đội ngũ y bác sĩ giàu kinh nghiệm, tận tâm</p>
            </div>
            <button className="hidden sm:flex items-center text-blue-600 font-semibold hover:text-blue-800 transition">
              Xem tất cả <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">Chưa có bác sĩ nào trên hệ thống.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                    <UserRound className="w-12 h-12" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{doc.degree} {doc.fullName}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold mt-2 mb-3">
                    {doc.specialtyName}
                  </span>

                  <button 
                    onClick={() => navigate(`/doctor/${doc.id}`)}
                    className="w-full py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-colors mt-auto"
                  >
                    Xem hồ sơ & Đặt lịch
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer đơn giản */}
      <footer id="footer" className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-black tracking-tight">Medi<span className="text-blue-500">Pro</span></span>
            <p className="text-gray-400 mt-4 text-sm leading-relaxed">
              Nền tảng y tế số toàn diện, kết nối hàng triệu bệnh nhân với các bác sĩ và cơ sở y tế uy tín trên toàn quốc.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Đặt khám bác sĩ</a></li>
              <li><a href="#" className="hover:text-white transition">Tư vấn trực tuyến</a></li>
              <li><a href="#" className="hover:text-white transition">Cẩm nang y tế</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Hotline: 0325 472 935</li>
              <li>Email: mediproadmin@gmail.com</li>
              <li>Địa chỉ: Số 3, Đường Cầu Giấy, Phường Láng, Hà Nội</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}