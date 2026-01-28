import { useEffect, useState, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutApi, exerciseApi, stepOfExerciseApi } from '../api/endpoints';
import { 
  Trash2, Dumbbell, Plus, Search, Filter, Clock, 
  ArrowLeft, LineChart, X, PencilLine, CirclePlay, 
  ListOrdered, Loader2 as LucideLoader, ChevronDown,
  BookOpen, Play, CheckCircle2
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import AddExerciseForm from '../components/modals/AddExerciseForm';
import VideoModal from '../components/modals/VideoModal';
import StepManagerModal from '../components/modals/StepManagerModal';
import toast from 'react-hot-toast';
import { MUSCLE_GROUPS } from '../common/constants';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const StatItem = memo(({ label, value }) => (
  <div className="flex flex-col items-center justify-center text-center px-1 min-w-0 w-full">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1 truncate w-full">{label}</p>
    <p className="text-lg md:text-xl font-black text-blue-600 leading-none tracking-tighter break-all w-full">{value}</p>
  </div>
));

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ show: false, editing: null });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  const [expandedId, setExpandedId] = useState(null);
  const [stepsMap, setStepsMap] = useState({}); 
  const [stepsLoading, setStepsLoading] = useState({});

  const [filters, setFilters] = useState({ search: '', muscleGroup: '', duration: '' });
  const [debouncedSearch] = useDebounce(filters.search, 500);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workoutApi.getExercises(id, {
        search: debouncedSearch,
        muscleGroup: filters.muscleGroup || undefined,
        duration: filters.duration || undefined,
      });
      setWorkoutPlan(res.data);
    } catch (err) {
      toast.error("Unable to load assignment information!");
    } finally {
      setLoading(false);
    }
  }, [id, debouncedSearch, filters.muscleGroup, filters.duration]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleCompleteToday = async () => {
    if (!workoutPlan || !workoutPlan.scheduleItems || workoutPlan.scheduleItems.length === 0) {
      toast.error("No training schedule found!"); 
      return;
    }
    const todayStr = new Date().toLocaleDateString('en-CA'); 

    const todayItem = workoutPlan.scheduleItems.find(item => {
      const itemDateStr = new Date(item.date).toLocaleDateString('en-CA');
      return itemDateStr === todayStr;
    });

    if (todayItem) {
      if (todayItem.status === 'completed') {
        toast.success("You've completed your workout for today!", { icon: '👏' });
        return;
      }
      try {
        setLoading(true);
        await workoutApi.updateItemStatus(todayItem.id, { status: 'completed' });
        toast.success("Great! I've accomplished my goal for today.");
        await fetchDetail();
        navigate('/dashboard');
      } catch (err) {
        toast.error("Connection error while updating status.");
      } finally {
        setLoading(false);
      }
    } else {
      toast("There is no workout scheduled for this exercise today.", { icon: '📅' });
    }
  };

  const fetchStepsByExercise = async (exerciseId) => {
    if (stepsMap[exerciseId]) return;
    try {
      setStepsLoading(prev => ({ ...prev, [exerciseId]: true }));
      const res = await stepOfExerciseApi.getByExercise(exerciseId); 
      setStepsMap(prev => ({ ...prev, [exerciseId]: res.data }));
    } catch (err) {
      toast.error("Unable to load the instructions!");
    } finally {
      setStepsLoading(prev => ({ ...prev, [exerciseId]: false }));
    }
  };

  const toggleExpand = (exId) => {
    const isOpening = expandedId !== exId;
    setExpandedId(isOpening ? exId : null);
    if (isOpening) fetchStepsByExercise(exId);
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
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await exerciseApi.delete(exId);
      toast.success("Assignment deleted");
      fetchDetail();
    } catch (err) { toast.error("Error deleting!"); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-500 text-slate-900 pb-20">
      
      {/* BACK BUTTON */}
      <button onClick={() => navigate('/dashboard')} className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-all mb-8">
        <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
          <ArrowLeft size={18} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em]">Back to Dashboard</span>
      </button>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none break-all">
            {workoutPlan?.name || "Loading..."}
          </h1>
          <p className="text-gray-400 font-bold mt-3 tracking-widest uppercase text-xs">
            Total: {workoutPlan?.numExercises || 0} Exercises
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto flex-shrink-0">
          <button 
            onClick={() => handleToggleForm()} 
            className={`${(formState.show && !formState.editing) ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white shadow-blue-100'} px-8 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all`}
          >
            {formState.show ? <><X size={20} /> CLOSE</> : <><Plus size={20} /> ADD EXERCISE</>}
          </button>
        </div>
      </header>
      {formState.show && (
        <div className="mb-12 p-8 bg-white rounded-[3rem] border-2 border-dashed border-blue-200 shadow-inner animate-in slide-in-from-top duration-500">
          <AddExerciseForm 
            workoutId={id} 
            initialData={formState.editing}
            onAdded={() => {
              setFormState({ show: false, editing: null });
              fetchDetail();
              toast.success(formState.editing ? "Cập nhật thành công!" : "Thêm bài tập thành công!");
            }}
            onCancel={() => setFormState({ show: false, editing: null })}
          />
        </div>
      )}

      {/* FILTERS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 bg-white/50 p-2 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input name="search" type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] outline-none text-sm font-bold" />
        </div>
        <div className="relative">
          <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <select name="muscleGroup" value={filters.muscleGroup} onChange={(e) => setFilters({...filters, muscleGroup: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer">
            <option value="">All muscle groups</option>
            {MUSCLE_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
          </select>
        </div>
        <div className="relative">
          <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input name="duration" type="number" placeholder="Duration..." value={filters.duration} onChange={(e) => setFilters({...filters, duration: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] outline-none text-sm font-bold" />
        </div>
      </section>

      {/* LIST */}
      <section className="space-y-6 mb-12">
        {loading && !workoutPlan ? (
          <div className="flex justify-center py-10"><LucideLoader className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          workoutPlan?.exercises?.map((ex) => {
            const isExpanded = expandedId === ex.id;
            return (
              <div key={ex.id} className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 transition-all group">
                <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative w-32 h-32 bg-gray-50 rounded-[2.5rem] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {ex.thumbnail ? <img src={`${API_URL}/${ex.thumbnail}`} className="w-full h-full object-cover" alt={ex.name} /> : <Dumbbell size={40} className="text-gray-200" />}
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between items-start mb-4 w-full gap-4">
                      <div className="flex flex-col gap-2 min-w-0">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tighter leading-tight break-all">
                          {ex.name}
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest">{ex.muscleGroup}</span>
                          <button onClick={() => handleToggleForm(ex)} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors"><PencilLine size={14} /> EDIT</button>
                          <button onClick={() => { setSelectedExercise(ex); setShowStepModal(true); }} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-orange-500 transition-colors"><ListOrdered size={14} /> STEPS</button>
                          <button onClick={() => handleDeleteEx(ex.id)} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /> DELETE</button>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/tracking/${ex.id}`)} className="bg-blue-50 text-blue-600 p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex-shrink-0">
                        <div className="flex flex-col items-center gap-1"><LineChart size={24} /><span className="text-[8px] font-black uppercase tracking-tighter">Progress</span></div>
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1 bg-gray-50/80 p-4 rounded-[2rem] items-center">
                      <StatItem label="Sets" value={ex.numberOfSets} />
                      <StatItem label="Reps" value={ex.repetitions} />
                      <StatItem label="Rest" value={`${ex.restTime}s`} />
                      <StatItem label="Time" value={`${ex.duration}s`} />
                      <div className="flex flex-col items-center justify-center border-l border-gray-200/50 h-full w-full">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Details</p>
                        <button 
                          onClick={() => toggleExpand(ex.id)}
                          className={`p-1.5 rounded-full transition-all duration-500 ${isExpanded ? 'bg-blue-600 text-white rotate-180' : 'text-gray-400 hover:text-blue-600 bg-white shadow-sm'}`}
                        >
                          <ChevronDown size={22} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-8 pb-8 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col gap-8 bg-slate-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <ListOrdered size={14} /> Training Steps
                        </h4>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 h-[250px] overflow-y-auto shadow-sm custom-scrollbar">
                          {stepsLoading[ex.id] ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2"><LucideLoader className="animate-spin text-orange-500" size={24} /></div>
                          ) : stepsMap[ex.id]?.length > 0 ? (
                            <ul className="space-y-4 pr-2">
                              {stepsMap[ex.id].sort((a,b) => a.order - b.order).map((step, idx) => (
                                <li key={step.id} className="flex gap-4 text-sm text-gray-700 items-start">
                                  <span className="flex-shrink-0 w-6 h-6 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5">{idx + 1}</span>
                                  <span className="font-medium leading-relaxed break-all flex-1">{step.description}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex items-center justify-center h-full"><p className="text-xs italic text-gray-400 uppercase font-bold text-center">No steps found</p></div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2"><Play size={14} /> Video Tutorial</h4>
                        <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-black relative shadow-lg">
                          {ex.videoUrl ? <video src={`${API_URL}/${ex.videoUrl}`} className="w-full h-full object-contain" controls /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-900"><CirclePlay size={48} className="opacity-20 mb-2" /><span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Video Available</span></div>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><BookOpen size={14} /> Exercise Notes</h4>
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 text-sm text-gray-600 italic shadow-sm border-l-4 border-l-blue-400 break-all">{ex.note || "No specific notes."}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* NEW FOOTER ACTION SECTION */}
      {!loading && workoutPlan && (
        <div className="flex flex-col items-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full mb-4"></div>
          <button 
            onClick={handleCompleteToday}
            className="w-full md:w-auto min-w-[300px] bg-emerald-600 text-white px-12 py-5 rounded-[2.5rem] font-black shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all text-lg tracking-tight"
          >
            <CheckCircle2 size={24} /> COMPLETE WORKOUT TODAY
          </button>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mark this plan as finished for today</p>
        </div>
      )}

      {/* MODALS */}
      <VideoModal isOpen={!!selectedVideo} videoUrl={selectedVideo} exerciseId={selectedExercise?.id} exerciseName={selectedExercise?.name} onClose={() => setSelectedVideo(null)} />
      {showStepModal && selectedExercise && (
        <StepManagerModal 
          exercise={selectedExercise} 
          onClose={() => { 
            setShowStepModal(false); 
            setStepsMap(prev => { const next = {...prev}; delete next[selectedExercise.id]; return next; });
            if (expandedId === selectedExercise.id) fetchStepsByExercise(selectedExercise.id);
            setSelectedExercise(null); 
          }} 
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c2c2e7; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5970f7; }
      `}</style>
    </div>
  );
}