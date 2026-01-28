import React, { useState } from 'react';
import { X, CalendarRange, CheckCircle2 } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { workoutApi } from '../../api/endpoints';
import '../../style/CalendarCustom.css';
import toast from 'react-hot-toast';

export default function RescheduleItemModal({ isOpen, workout, onClose, onSuccess }) {
  const [mode, setMode] = useState('selectSource');
  const [formData, setFormData] = useState({ oldDate: '', newDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !workout) return null;

  const scheduledDates = workout.scheduleItems?.map(item => 
    new Date(item.date).toDateString()
  ) || [];

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      let classes = [];
      if (scheduledDates.includes(date.toDateString())) {
        classes.push('highlight-scheduled-date');
      }
      if (formData.oldDate === formatDateToYYYYMMDD(date)) {
        classes.push('selected-old-date');
      }
      return classes.join(' ');
    }
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month' && mode === 'selectSource') {
      return !scheduledDates.includes(date.toDateString());
    }
    return false;
  };

  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCalendarChange = (val) => {
    const formattedDate = formatDateToYYYYMMDD(val);
    if (mode === 'selectSource') {
      setFormData(prev => ({ ...prev, oldDate: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, newDate: formattedDate }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.oldDate || !formData.newDate) {
      toast.error("Please select both the old and new dates!");
      return;
    }
    try {
      setIsSubmitting(true);
      await workoutApi.rescheduleItem(workout.id, {
        oldDate: formData.oldDate,
        newDate: formData.newDate
      });
      toast.success("Rescheduled successfully.!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* BÊN TRÁI: BỘ LỊCH TƯƠNG TÁC */}
        <div className="flex-1 p-8 bg-gray-50 border-r border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <CalendarRange className="text-blue-600" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest italic">
              {mode === 'selectSource' ? 'Select the date to reschedule.' : 'Choose a new date'}
            </h3>
          </div>
          <Calendar
            onChange={handleCalendarChange}
            tileClassName={tileClassName}
            tileDisabled={tileDisabled}
            className="border-none bg-transparent rounded-2xl w-full"
            locale="vi-VN"
          />
          <div className="mt-6 flex items-center gap-4 text-[10px] font-bold text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Schedule available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              <span>Selecting</span>
            </div>
              <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
        {/* BÊN PHẢI: CHI TIẾT LỰA CHỌN */}
        <div className="flex-1 p-10 flex flex-col justify-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
          <div className="space-y-6">
            {/* Mục chọn ngày cũ */}
            <div 
              onClick={() => setMode('selectSource')}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                mode === 'selectSource' ? 'bg-blue-50 border-blue-500 shadow-md scale-105' : 'bg-gray-50 border-transparent'
              }`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest block mb-2 ${mode === 'selectSource' ? 'text-blue-500' : 'text-gray-400'}`}>
                Selected date:
              </span>
              <p className={`text-xl font-black italic ${formData.oldDate ? 'text-blue-600' : 'text-gray-300'}`}>
                {formData.oldDate ? new Date(formData.oldDate).toLocaleDateString('vi-VN') : "CHƯA CHỌN"}
              </p>
            </div>
            {/* Mục chọn ngày mới */}
            <div 
              onClick={() => setMode('selectTarget')}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                mode === 'selectTarget' ? 'bg-blue-50 border-blue-500 shadow-md scale-105' : 'bg-gray-50 border-transparent'
              }`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest block mb-2 ${mode === 'selectTarget' ? 'text-blue-500' : 'text-gray-400'}`}>
                Move to new date:
              </span>
              <p className={`text-xl font-black italic ${formData.newDate ? 'text-blue-600' : 'text-gray-300'}`}>
                {formData.newDate ? new Date(formData.newDate).toLocaleDateString('vi-VN') : "dd/mm/yyyy"}
              </p>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.oldDate || !formData.newDate}
              className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[11px] tracking-[0.2em] uppercase hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? "PROCESSING..." : (
                <>CONFIRM RESCHEDULE <CheckCircle2 size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}