import { useState, useEffect, useMemo } from 'react';
import { workoutApi } from '../../api/endpoints';
import { X, Calendar, Edit3, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = [
  { label: 'CN', value: 0 }, { label: 'T2', value: 1 }, { label: 'T3', value: 2 },
  { label: 'T4', value: 3 }, { label: 'T5', value: 4 }, { label: 'T6', value: 5 }, { label: 'T7', value: 6 }
];

export default function EditWorkoutModal({ isOpen, workout, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workout && isOpen) {
      setName(workout.name || '');
      setStartDate(workout.startDate || '');
      setEndDate(workout.endDate || '');
      const initialDays = Array.isArray(workout.daysOfWeek) 
        ? workout.daysOfWeek.map(d => Number(d)) 
        : [];
      setDaysOfWeek(initialDays.sort());
    }
  }, [workout, isOpen]);

  const hasChanges = useMemo(() => {
    if (!workout) return false;
    const isNameChanged = name !== workout.name;
    const isStartDateChanged = startDate !== (workout.startDate || '');
    const isEndDateChanged = endDate !== (workout.endDate || '');
        const currentDays = [...daysOfWeek].sort().join(',');
    const originalDays = Array.isArray(workout.daysOfWeek) 
      ? workout.daysOfWeek.map(d => Number(d)).sort().join(',') 
      : '';
    const isDaysChanged = currentDays !== originalDays;
    return isNameChanged || isStartDateChanged || isEndDateChanged || isDaysChanged;
  }, [name, startDate, endDate, daysOfWeek, workout]);

  if (!isOpen || !workout) return null;

  const toggleDay = (dayValue) => {
    const numericDay = Number(dayValue);
    setDaysOfWeek(prev => 
      prev.includes(numericDay) 
        ? prev.filter(d => d !== numericDay) 
        : [...prev, numericDay].sort()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;
    setLoading(true);
    try {
      await workoutApi.update(workout.id, { 
        name, 
        startDate, 
        endDate, 
        daysOfWeek: daysOfWeek.map(d => Number(d)) 
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Unable to update the training schedule. Please check again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Calendar className="text-emerald-500" size={24} /> Edit workout schedule
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Tên */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Workout Name</label>
            <input 
              type="text" required
              className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border-none font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>
          {/* Input Ngày */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">From date</label>
              <input 
                type="date" required
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                value={startDate} onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">To date</label>
              <input 
                type="date" required
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                value={endDate} onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {/* Nút chọn Thứ */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Repeat on days</label>
            <div className="flex justify-between gap-1">
              {DAYS.map((day) => {
                const isActive = daysOfWeek.includes(day.value);
                return (
                  <button
                    key={day.value} type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Nút Submit có trạng thái Disabled */}
          <button 
            disabled={!hasChanges || loading}
            className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
              hasChanges && !loading
                ? 'bg-gray-900 text-white hover:bg-black shadow-xl cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );
}