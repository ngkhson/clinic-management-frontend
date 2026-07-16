import React from 'react';
import { MapPin, Phone, Mail, Clock, AlertTriangle, Navigation, Building2 } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// LƯU Ý CHO ADMIN: Thay thế Token của bạn tại đây để bản đồ hoạt động
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function ContactPage() {
  // Tọa độ phòng khám (ĐH Giao thông Vận tải, Hà Nội)
  const clinicLocation = {
    longitude: 105.8038,
    latitude: 21.0278,
    zoom: 16
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 lg:py-24 font-sans relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-[#F8FAFC] -z-10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Liên hệ với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">MediPro</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe, hỗ trợ và đồng hành cùng sức khỏe của bạn. Đừng ngần ngại đến trực tiếp hoặc liên hệ qua các kênh thông tin bên dưới.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Cột Thông tin liên hệ */}
          <div className="flex flex-col space-y-6">
            
            {/* Card Địa chỉ */}
            <div className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Building2 className="w-32 h-32" />
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 mb-6 shadow-lg shadow-blue-500/30">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 mb-4">Trụ sở chính</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Số 3 Phố Cầu Giấy, Phường Láng, Hà Nội
              </p>
              <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${clinicLocation.latitude},${clinicLocation.longitude}`)} className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors">
                <Navigation className="w-5 h-5 mr-2" /> Nhận chỉ đường
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card Điện thoại & Email */}
              <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Thông tin liên lạc</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" /> <span className="font-semibold text-gray-900">0325 472 935</span></p>
                <p className="text-gray-600 text-sm flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" /> <span className="font-semibold text-gray-900 truncate">mediproadmin@gmail.com</span></p>
              </div>

              {/* Card Giờ làm việc */}
              <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Giờ làm việc</h3>
                <p className="text-gray-600 text-sm mb-2"><span className="inline-block w-16">T2 - T6:</span> <span className="font-semibold text-gray-900">07:00 - 20:00</span></p>
                <p className="text-gray-600 text-sm"><span className="inline-block w-16">T7 - CN:</span> <span className="font-semibold text-gray-900">07:00 - 17:00</span></p>
              </div>
            </div>

          </div>

          {/* Cột Bản đồ Mapbox */}
          <div className="h-full min-h-[500px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative group">
            <div className="w-full h-full relative">
              {MAPBOX_TOKEN ? (
                <Map
                  initialViewState={clinicLocation}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  style={{ width: '100%', height: '100%' }}
                >
                  <NavigationControl position="bottom-right" />
                  <Marker longitude={clinicLocation.longitude} latitude={clinicLocation.latitude}>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
                      <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </Marker>
                </Map>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
                  <p className="font-semibold text-amber-700 text-lg">Chưa cấu hình Bản đồ</p>
                  <p className="text-sm mt-2 max-w-xs text-center">Vui lòng cập nhật MAPBOX_TOKEN trong file ContactPage.tsx</p>
                </div>
              )}
            </div>
            
            {/* Float Card on Map */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-white/50 z-10 hidden sm:block pointer-events-none transition-transform group-hover:-translate-y-1">
              <p className="font-black text-gray-900 text-lg">Medi<span className="text-blue-600">Pro</span> Clinic</p>
              <p className="text-sm text-gray-500 font-medium mt-1">Cơ sở chính thức</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
