import React from 'react';
import { Calendar, Clock, FileText, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Appointment {
  id: number;
  doctorName: string;
  timeSlot: string;
  appointmentDate: string;
  status: string;
  symptoms: string;
}

interface Props {
  appointments: Appointment[];
  isLoading: boolean;
  onViewRecord: (id: number) => void;
  onReview: (appt: Appointment) => void;
  onCancel: (id: number) => void;
  onPay: (id: number) => void;
  onNavigateHome: () => void;
}

export default function PatientAppointmentList({ appointments, isLoading, onViewRecord, onReview, onCancel, onPay, onNavigateHome }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" /> Chờ xác nhận</span>;
      case 'CONFIRMED': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Calendar className="w-3 h-3 mr-1" /> Đã xác nhận</span>;
      case 'COMPLETED': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã khám</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Lịch sử Đặt khám
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-5 font-semibold w-16">Mã</th>
              <th className="p-5 font-semibold">Bác sĩ phụ trách</th>
              <th className="p-5 font-semibold">Thời gian hẹn</th>
              <th className="p-5 font-semibold">Trạng thái</th>
              <th className="p-5 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Bạn chưa có lịch hẹn nào. <button onClick={onNavigateHome} className="text-blue-600 font-medium hover:underline">Đặt lịch ngay!</button></td></tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-5 text-gray-400 font-medium">#{appt.id}</td>
                  <td className="p-5 font-bold text-gray-800">BS. {appt.doctorName}</td>
                  <td className="p-5">
                    <div className="flex items-center text-gray-900 font-medium">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" /> {appt.timeSlot}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{appt.appointmentDate}</div>
                  </td>
                  <td className="p-5">{getStatusBadge(appt.status)}</td>
                  <td className="p-5 text-center">
                    {appt.status === 'COMPLETED' ? (
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                        <button
                          onClick={() => onViewRecord(appt.id)}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-bold transition"
                        >
                          <FileText className="w-4 h-4 mr-2" /> Đơn Thuốc
                        </button>
                        <button
                          onClick={() => onPay(appt.id)}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-bold transition"
                        >
                          <FileText className="w-4 h-4 mr-1.5" /> Thanh toán
                        </button>
                        <button
                          onClick={() => onReview(appt)}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-xl text-sm font-bold transition ring-1 ring-yellow-200"
                        >
                          <Star className="w-4 h-4 mr-1.5 fill-yellow-500" /> Đánh giá
                        </button>
                      </div>
                    ) : (appt.status === 'PENDING' || appt.status === 'CONFIRMED') ? (
                      <button
                        onClick={() => onCancel(appt.id)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition"
                      >
                        <AlertCircle className="w-4 h-4 mr-1.5" /> Huỷ lịch
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Không khả dụng</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}