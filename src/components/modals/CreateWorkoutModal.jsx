import { useState } from 'react';
import { workoutApi } from '../../api/endpoints';
import { X, Calendar, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = [
  { label: 'CN', value: 0 }, { label: 'T2', value: 1 }, { label: 'T3', value: 2 },
  { label: 'T4', value: 3 }, { label: 'T5', value: 4 }, { label: 'T6', value: 5 }, { label: 'T7', value: 6 }
];

export default function CreateWorkoutModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    daysOfWeek: []
  });

  if (!isOpen) return null;

  const toggleDay = (val) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(val) 
        ? prev.daysOfWeek.filter(d => d !== val) 
        : [...prev.daysOfWeek, val].sort()
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedEnd = new Date(formData.endDate);
  selectedEnd.setHours(0, 0, 0, 0);

  // Validation logic
  if (selectedEnd < today) {
    toast.error(`The end date cannot be a date in the past. (before ${today.toLocaleDateString('vi-VN')})!`);
    return;
  }

  try {
    await workoutApi.create(formData);
    onSuccess();
    onClose();
  } catch (err) {
    toast.error("Error creating workout!");
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase tracking-tighter">Create new workout</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Workout Name</label>
            <input 
              type="text" required placeholder="VD: Workout Ngực"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Start</label>
              <input 
                type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-xs"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">End</label>
              <input 
                type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-xs"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Days of the week</label>
            <div className="flex justify-between gap-1">
              {DAYS.map(day => (
                <button
                  key={day.value} type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                    formData.daysOfWeek.includes(day.value) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-200">
            CREATE NOW
          </button>
        </form>
      </div>
    </div>
  );
}