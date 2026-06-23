import React from 'react';
import { CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';

interface Appointment { id: number; patientName: string; timeSlot: string; appointmentDate: string; status: string; symptoms: string; }

interface Props {
  appointments: Appointment[];
  isLoading: boolean;
  onConfirm: (id: number) => void;
  onOpenModal: (appt: Appointment) => void;
}

export default function DoctorDashboard({ appointments, isLoading, onConfirm, onOpenModal }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const completedTodayCount = todayAppointments.filter(a => a.status === 'COMPLETED').length;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">Chờ xác nhận</span>;
      case 'CONFIRMED': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">Sắp khám</span>;
      case 'COMPLETED': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">Đã xong</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-full">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan công việc</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mr-4 relative z-10 text-blue-600"><CalendarCheck className="w-7 h-7" /></div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium">Lịch khám hôm nay</p>
            <h3 className="text-2xl font-bold text-gray-900">{todayAppointments.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-50 rounded-full opacity-50"></div>
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mr-4 relative z-10 text-yellow-600"><Clock className="w-7 h-7" /></div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium">Ca chờ xác nhận</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full opacity-50"></div>
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mr-4 relative z-10 text-green-600"><CheckCircle2 className="w-7 h-7" /></div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-medium">Đã khám hôm nay</p>
            <h3 className="text-2xl font-bold text-gray-900">{completedTodayCount}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800">Lịch khám trong ngày ({todayStr.split('-').reverse().join('/')})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-white text-gray-500 text-sm border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold">Bệnh nhân</th>
                <th className="p-4 font-semibold">Khung giờ</th>
                <th className="p-4 font-semibold">Triệu chứng</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
               todayAppointments.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Hôm nay chưa có lịch khám nào.</td></tr> :
               todayAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{app.patientName}</td>
                  <td className="p-4 text-blue-600 font-medium flex items-center"><Clock className="w-4 h-4 mr-1.5"/> {app.timeSlot}</td>
                  <td className="p-4 text-gray-600 text-sm max-w-[200px] truncate" title={app.symptoms}>{app.symptoms || 'Không'}</td>
                  <td className="p-4">{renderStatusBadge(app.status)}</td>
                  <td className="p-4 text-center">
                    {app.status === 'PENDING' && <button onClick={() => onConfirm(app.id)} className="px-4 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold">Nhận ca</button>}
                    {app.status === 'CONFIRMED' && <button onClick={() => onOpenModal(app)} className="px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold shadow-sm">Khám & Chỉ định</button>}
                    {app.status === 'COMPLETED' && <span className="text-gray-400 text-sm">Hoàn thành</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}