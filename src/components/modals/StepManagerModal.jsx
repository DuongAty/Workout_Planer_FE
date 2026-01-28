import { useState, useEffect } from 'react';
import { stepOfExerciseApi } from '../../api/endpoints';
import { Plus, X, Save, ListOrdered, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StepManagerModal({ exercise, onClose }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const res = await stepOfExerciseApi.getByExercise(exercise.id);
        const sortedSteps = (res.data || res).sort((a, b) => a.order - b.order);
        setSteps(sortedSteps);
      } catch (err) {
        toast.error("Không thể tải danh sách bước tập");
      }
    };
    fetchSteps();
  }, [exercise.id]);

  const addStep = () => {
    const newOrder = steps.length > 0 ? Math.max(...steps.map(s => s.order)) + 1 : 1;
    setSteps([...steps, { order: newOrder, description: '', isNew: true }]);
  };

const handleDeleteStep = async (stepId, index) => {
  if (stepId) {
    try {
      await stepOfExerciseApi.delete(stepId); // Gọi API xóa
      toast.success("Đã xóa bước thực hiện");
    } catch (error) {
      toast.error("Không thể xóa bước này");
      return;
    }
  }

  const newSteps = steps.filter((_, i) => i !== index);
  setSteps(newSteps);
};

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all(steps.map(step => {
        if (step.isNew) {
          return stepOfExerciseApi.create(exercise.id, { 
            order: step.order, 
            description: step.description 
          });
        } else {
          return stepOfExerciseApi.update(step.id, { 
            description: step.description,
            order: step.order
          });
        }
      }));
      toast.success("Cập nhật các bước tập thành công!");
      onClose();
    } catch (err) {
      toast.error("Lỗi khi lưu dữ liệu");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-black text-blue-900 uppercase text-sm tracking-widest">Execution Steps</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Exercise: {exercise.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        {/* Body */}
        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="absolute left-3 top-4 w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
                {step.order}
              </div>
              <textarea
                className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-sm min-h-[80px] resize-none transition-all shadow-inner"
                value={step.description}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].description = e.target.value;
                  setSteps(newSteps);
                }}
                placeholder="Nhập mô tả bước thực hiện..."
              />
              <button 
                onClick={() => handleDeleteStep(step.id, index)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button 
            onClick={addStep}
            className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-blue-200 hover:text-blue-400 transition-all gap-1"
          >
            <Plus size={24} />
            <span className="text-[10px] font-black uppercase">Add Next Step</span>
          </button>
        </div>
        {/* Footer */}
        <div className="p-6 bg-gray-50 flex gap-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}