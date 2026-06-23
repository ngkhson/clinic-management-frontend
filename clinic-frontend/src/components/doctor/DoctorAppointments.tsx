import React from 'react';

interface Appointment { id: number; patientName: string; timeSlot: string; appointmentDate: string; status: string; symptoms: string; }

interface Props {
  appointments: Appointment[];
  isLoading: boolean;
  onConfirm: (id: number) => void;
  onOpenModal: (appt: Appointment) => void;
}

export default function DoctorAppointments({ appointments, isLoading, onConfirm, onOpenModal }: Props) {
  
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
      <h2 className="text-2xl font-bold text-gray-800">Tất cả lịch hẹn</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold">Mã</th>
                <th className="p-4 font-semibold">Bệnh nhân</th>
                <th className="p-4 font-semibold">Thời gian hẹn</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Đang tải...</td></tr> : 
               appointments.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">Chưa có lịch hẹn nào.</td></tr> :
               appointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-400 font-medium">#{app.id}</td>
                  <td className="p-4 font-bold text-gray-900">{app.patientName}</td>
                  <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2 font-medium">{app.timeSlot}</span> {app.appointmentDate}</td>
                  <td className="p-4">{renderStatusBadge(app.status)}</td>
                  <td className="p-4 text-center">
                    {app.status === 'PENDING' && <button onClick={() => onConfirm(app.id)} className="px-4 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold">Nhận ca</button>}
                    {app.status === 'CONFIRMED' && <button onClick={() => onOpenModal(app)} className="px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold">Khám & Chỉ định</button>}
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