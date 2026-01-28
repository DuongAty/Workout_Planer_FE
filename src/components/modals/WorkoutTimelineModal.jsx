import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { workoutApi } from '../../api/endpoints'; // Đảm bảo import đúng đường dẫn
import toast from 'react-hot-toast';

export default function WorkoutTimelineModal({ isOpen, workout, onClose, onSuccess }) {
  const [processingDate, setProcessingDate] = useState(null);
  if (!isOpen || !workout) return null;
  const handleToggleStatus = async (item) => {
    if (item.status === 'completed') return;
    try {
      setProcessingDate(item.date);
      await workoutApi.updateItemStatus(workout.id, {
        date: item.date,
        status: 'completed'
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Unable to update training status");
    } finally {
      setProcessingDate(null);
    }
  };
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': 
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', icon: <CheckCircle2 size={18} /> };
      case 'missed': 
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: <AlertCircle size={18} /> };
      default: 
        return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-400', icon: <Clock size={18} /> };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tight text-gray-800">Detailed Timeline</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        {/* Danh sách Schedule Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {workout.scheduleItems?.sort((a, b) => new Date(a.date) - new Date(b.date)).map((item, index) => {
            const config = getStatusConfig(item.status);
            const isProcessing = processingDate === item.date;
            return (
              <button
                key={index}
                onClick={() => handleToggleStatus(item)}
                disabled={isProcessing}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-95
                  ${config.bg} ${config.border} hover:shadow-sm ${isProcessing ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${config.text}`}>
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : config.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-black text-gray-900">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>
                    {item.status || 'PLANNED'}
                  </p>
                </div>
                {item.status !== 'completed' && !isProcessing && (
                  <div className="text-[9px] font-black text-blue-500 uppercase opacity-0 group-hover:opacity-100">
                    Click to complete
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}