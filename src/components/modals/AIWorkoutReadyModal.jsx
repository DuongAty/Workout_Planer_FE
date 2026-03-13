import React from 'react';
import { ExternalLink, CheckCircle2, X, Dumbbell } from 'lucide-react';

export default function AIWorkoutReadyModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      {/* Container chính của Modal */}
      <div className="bg-[#1e293b] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in duration-300">
        
        {/* Nút đóng */}
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          {/* Icon minh họa thành công */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-3xl mb-6 shadow-lg shadow-blue-500/10">
            <CheckCircle2 className="text-blue-500" size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            AI Đã Sẵn Sàng!
          </h2>
          
          <p className="text-gray-400 font-medium text-sm mb-8 px-4">
            Lịch tập <span className="text-blue-400 font-bold">"{data.workoutName}"</span> của bạn đã được khởi tạo thành công bởi hệ thống AI.
          </p>

          {/* Nút hành động chính - Sử dụng link từ backend */}
          <a 
            href={data.link}
            onClick={onClose}
            className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-blue-500/25"
          >
            Xem lịch tập ngay <ExternalLink size={18} />
          </a>
          
          <button 
            onClick={onClose}
            className="mt-4 text-[10px] font-black text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
          >
            Đóng thông báo
          </button>
        </div>
      </div>
    </div>
  );
}