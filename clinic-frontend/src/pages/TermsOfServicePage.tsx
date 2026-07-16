import React from 'react';
import { FileSignature, AlertCircle, CheckSquare, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-6">
              <FileSignature className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Điều khoản sử dụng</h1>
            <p className="text-gray-500">Cập nhật lần cuối: 15/07/2026</p>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-indigo-500" /> 1. Chấp thuận điều khoản
              </h2>
              <p>
                Bằng việc đăng ký tài khoản và sử dụng các dịch vụ đặt lịch khám, nhận kết quả xét nghiệm trên nền tảng MediPro, bạn đồng ý tuân thủ toàn bộ các điều khoản được quy định tại đây. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-indigo-500" /> 2. Trách nhiệm của người dùng
              </h2>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-gray-600">
                <li>Cung cấp thông tin cá nhân và tình trạng sức khỏe trung thực, chính xác.</li>
                <li>Tự bảo mật tài khoản và mật khẩu truy cập hệ thống.</li>
                <li>Đến đúng giờ theo lịch hẹn đã đặt trên hệ thống. Nếu cần hủy, phải hủy trước ít nhất 2 giờ.</li>
                <li>Không sử dụng nền tảng cho các mục đích sai trái, gian lận hoặc phá hoại hệ thống.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Scale className="w-5 h-5 mr-2 text-indigo-500" /> 3. Quyền lợi và từ chối trách nhiệm
              </h2>
              <p>
                MediPro có quyền từ chối cung cấp dịch vụ hoặc khóa tài khoản của người dùng nếu phát hiện vi phạm điều khoản. Các thông tin tư vấn y tế trên nền tảng mang tính chất tham khảo, quyết định điều trị cuối cùng thuộc về chỉ định trực tiếp của Bác sĩ chuyên khoa tại cơ sở y tế.
              </p>
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
