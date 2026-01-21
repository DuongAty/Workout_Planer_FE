import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutApi, exerciseApi } from '../api/endpoints';
import { 
  Trash2, Dumbbell, Plus, Search, Filter, Clock, 
  ArrowLeft, LineChart, X, PencilLine, CirclePlay 
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import AddExerciseForm from '../components/modals/AddExerciseForm';
import VideoModal from '../components/modals/VideoModal';
import toast from 'react-hot-toast';

// Constants - Đưa ra ngoài component để tránh khởi tạo lại
const API_URL = import.meta.env.VITE_API_BASE_URL;
const MUSCLE_GROUPS = ["Ngực", "Lưng", "Vai", "Chân", "Mông", "Bụng"];

// Memoized StatItem để tránh re-render lãng phí
const StatItem = memo(({ label, value }) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
    <p className="text-xl font-black text-blue-600 leading-none tracking-tighter">{value}</p>
  </div>
));

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States gộp logic
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ show: false, editing: null });
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    muscleGroup: '',
    duration: ''
  });
  const [debouncedSearch] = useDebounce(filters.search, 500);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workoutApi.getExercises(id, {
        search: debouncedSearch,
        muscleGroup: filters.muscleGroup || undefined,
        duration: filters.duration || undefined
      });
      setWorkoutPlan(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải thông tin bài tập!");
    } finally {
      setLoading(false);
    }
  }, [id, debouncedSearch, filters.muscleGroup, filters.duration]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleForm = (exercise = null) => {
    if (exercise) {
      setFormState({ show: true, editing: exercise });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormState(prev => ({ show: !prev.show, editing: null }));
    }
  };

  const handleDeleteEx = async (exId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")) return;
    
    const loadingToast = toast.loading("Đang xóa...");
    try {
      await exerciseApi.delete(exId);
      toast.success("Đã xóa bài tập", { id: loadingToast });
      fetchDetail();
    } catch (err) { 
      toast.error("Lỗi khi xóa!", { id: loadingToast }); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-500 text-slate-900">
      
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-all mb-8"
      >
        <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
          <ArrowLeft size={18} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em]">Back to Dashboard</span>
      </button>

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">
            {workoutPlan?.name || "Loading..."}
          </h1>
          <p className="text-gray-400 font-bold mt-3 tracking-widest uppercase text-xs">
            Total: {workoutPlan?.numExercises || 0} Exercises
          </p>
        </div>
        <button 
          onClick={() => handleToggleForm()}
          className={`${(formState.show && !formState.editing) ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white shadow-blue-100'} px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all`}
        >
          {formState.show ? <><X size={20} /> CLOSE</> : <><Plus size={20} /> ADD EXERCISE</>}
        </button>
      </header>

      {/* INTEGRATED FORM */}
      {formState.show && (
        <section className="mb-12 p-8 bg-blue-50/50 rounded-[3rem] border-2 border-dashed border-blue-200 animate-in slide-in-from-top duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-blue-900 uppercase italic">
              {formState.editing ? `Edit: ${formState.editing.name}` : 'Add new exercise'}
            </h2>
            <button onClick={() => setFormState({ show: false, editing: null })} className="text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
          </div>
          <AddExerciseForm 
            workoutId={id} 
            initialData={formState.editing} 
            onAdded={() => {
              setFormState({ show: false, editing: null });
              fetchDetail();
            }} 
          />
        </section>
      )}

      {/* FILTER BAR */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 bg-white/50 p-2 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            name="search"
            type="text" 
            placeholder="Search exercise..." 
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] outline-none text-sm font-bold"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <select
            name="muscleGroup"
            value={filters.muscleGroup} 
            onChange={handleFilterChange}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer"
          >
            <option value="">All muscle groups</option>
            {MUSCLE_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
          </select>
        </div>
        <div className="relative">
          <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            name="duration"
            type="number" 
            min="0"
            placeholder="Duration (s)..." 
            value={filters.duration}
            onChange={handleFilterChange}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] outline-none text-sm font-bold"
          />
        </div>
      </section>

      {/* EXERCISE LIST */}
      <section className="space-y-6">
        {loading && !workoutPlan ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          workoutPlan?.exercises?.map((ex) => (
            <div key={ex.id} className="bg-white p-6 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center group hover:border-blue-200 transition-all">
              
              {/* Thumbnail Container */}
              <div className="relative w-32 h-32 bg-gray-50 rounded-[2.5rem] flex-shrink-0 flex items-center justify-center overflow-hidden">
                {ex.thumbnail ? (
                  <img src={`${API_URL}/${ex.thumbnail}`} className="w-full h-full object-cover" alt={ex.name} />
                ) : (
                  <Dumbbell size={40} className="text-gray-200" />
                )}
              </div>

              {/* Info Container */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-4 w-full">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-tight">{ex.name}</h3>
                    <div className="flex gap-4">
                      <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest">
                        {ex.muscleGroup}
                      </span>
                      <button onClick={() => handleToggleForm(ex)} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors">
                        <PencilLine size={14} /> EDIT
                      </button>
                      <button onClick={() => handleDeleteEx(ex.id)} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} /> DELETE
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/tracking/${ex.id}`)}
                    className="bg-blue-50 text-blue-600 p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group/progress"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <LineChart size={24} className="group-hover/progress:scale-110 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Progress</span>
                    </div>
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-5 gap-2 bg-gray-50/80 p-4 rounded-[2rem] items-center">
                  <StatItem label="Sets" value={ex.numberOfSets} />
                  <StatItem label="Reps" value={ex.repetitions} />
                  <StatItem label="Rest" value={`${ex.restTime}s`} />
                  <StatItem label="Time" value={`${ex.duration}s`} />
                  
                  <div className="flex flex-col items-center justify-center border-l border-gray-200/50 h-full">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Tutorial</p>
                    {ex.videoUrl ? (
                      <button 
                        onClick={() => setSelectedVideo(`${API_URL}/${ex.videoUrl}`)}
                        className="text-purple-600 hover:text-purple-700 hover:scale-110 transition-transform active:scale-95"
                      >
                        <CirclePlay size={24} strokeWidth={2.5} />
                      </button>
                    ) : (
                      <CirclePlay size={24} className="text-gray-200" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {!loading && workoutPlan?.exercises?.length === 0 && (
          <p className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest">No exercises found.</p>
        )}
      </section>

      <VideoModal 
        isOpen={!!selectedVideo} 
        videoUrl={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
}

// Thêm Loader component đơn giản
function Loader2({ size, className }) {
  return <Dumbbell size={size} className={`animate-bounce ${className}`} />;
}