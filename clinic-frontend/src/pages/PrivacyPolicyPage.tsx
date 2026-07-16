import React from 'react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Chính sách bảo mật</h1>
            <p className="text-gray-500">Cập nhật lần cuối: 15/07/2026</p>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-500" /> 1. Mục đích thu thập thông tin
              </h2>
              <p>
                MediPro thu thập thông tin cá nhân của người dùng (Bao gồm họ tên, số điện thoại, email, thông tin y tế) nhằm mục đích chính là quản lý hồ sơ khám chữa bệnh, hỗ trợ đặt lịch khám nhanh chóng và cá nhân hóa trải nghiệm sử dụng dịch vụ y tế của bạn.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" /> 2. Phạm vi sử dụng thông tin
              </h2>
              <p>Thông tin của bạn sẽ chỉ được sử dụng trong phạm vi hệ thống MediPro cho các hoạt động sau:</p>
              <ul className="list-none space-y-3 mt-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0 mt-0.5" />
                  Cung cấp thông tin hồ sơ cho Bác sĩ điều trị.
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0 mt-0.5" />
                  Gửi thông báo nhắc nhở lịch hẹn khám.
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 shrink-0 mt-0.5" />
                  Gửi kết quả khám bệnh và đơn thuốc trực tuyến.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" /> 3. Cam kết bảo mật
              </h2>
              <p>
                Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân và hồ sơ bệnh án của bạn theo tiêu chuẩn bảo mật dữ liệu y tế (HIPAA). Không có bất kỳ bên thứ ba nào được phép tiếp cận dữ liệu này nếu không có sự đồng ý bằng văn bản từ chính bạn.
              </p>
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
