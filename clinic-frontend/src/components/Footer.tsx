import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#0B1120] text-gray-400 py-16 mt-auto border-t border-white/10 w-full z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <span className="text-3xl font-black tracking-tight text-white">Medi<span className="text-blue-500">Pro</span></span>
          <p className="mt-6 text-base leading-relaxed max-w-sm text-gray-400 font-light">
            Nền tảng y tế số toàn diện, kết nối hàng triệu bệnh nhân với các chuyên gia và cơ sở y tế uy tín hàng đầu trên toàn quốc.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6 text-white tracking-wide">Dịch vụ</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/specialties" className="hover:text-blue-400 transition-colors">Khám chuyên khoa</Link></li>
            <li><Link to="/specialties" className="hover:text-blue-400 transition-colors">Khám tổng quát</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Tư vấn trực tuyến</Link></li>
            <li><Link to="/health-guide" className="hover:text-blue-400 transition-colors">Cẩm nang sức khỏe</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6 text-white tracking-wide">Liên hệ</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">T:</span> <a href="tel:0325472935" className="hover:text-white transition-colors">0325 472 935</a>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">E:</span> <a href="mailto:mediproadmin@gmail.com" className="hover:text-white transition-colors">mediproadmin@gmail.com</a>
            </li>
            <li className="flex items-start leading-relaxed">
              <span className="text-gray-500 mr-2">A:</span> Số 3 Phố Cầu Giấy, Phường Láng, Hà Nội
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 text-sm flex flex-col md:flex-row justify-between items-center text-gray-500">
        <p>© 2026 MediPro. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
          <Link to="/terms-of-service" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
        </div>
      </div>
    </footer>
  );
}
