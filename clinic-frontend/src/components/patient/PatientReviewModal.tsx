import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

interface Appointment {
  id: number;
  doctorName: string;
}

interface Props {
  isOpen: boolean;
  appointment: Appointment | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export default function PatientReviewModal({ isOpen, appointment, isSubmitting, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Reset form mỗi khi mở lại modal
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-yellow-50/50">
          <h3 className="text-xl font-bold text-yellow-800 flex items-center">
            <Star className="w-6 h-6 mr-2 text-yellow-500 fill-yellow-500" />
            Đánh giá Bác sĩ
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition bg-white rounded-full p-1 shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50/30">
          <p className="text-center text-gray-600 mb-6">
            Bạn cảm thấy thế nào về ca khám với <br/>
            <strong className="text-gray-900 text-lg">BS. {appointment.doctorName}</strong> ?
          </p>

          <div className="flex justify-center space-x-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét của bạn (Tùy chọn)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bác sĩ tư vấn nhiệt tình, phòng khám sạch sẽ..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none resize-none bg-white shadow-sm"
            ></textarea>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition">
              Bỏ qua
            </button>
            <button type="submit" disabled={isSubmitting} className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-sm transition ${isSubmitting ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}