import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { workoutApi } from '../api/endpoints';
import { 
  Trash2, Dumbbell, ChevronRight, LayoutGrid, 
  CalendarDays, Search, Loader2, Hash, 
  CalendarRange, Activity, PencilLine,
  CalendarSync, Plus, X, Clock
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CreateWorkoutModal from '../components/modals/CreateWorkoutModal';
import EditWorkoutModal from '../components/modals/EditWorkoutModal';
import ScheduleModal from '../components/modals/ScheduleModal';
import WorkoutTimelineModal from '../components/modals/WorkoutTimelineModal';
import toast from 'react-hot-toast';
import { formatDate, INITIAL_FILTERS, DEBOUNCE_DELAY } from '../common/constants';
import { WorkoutCard } from '../components/WorkoutCard';

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeModal, setActiveModal] = useState({ type: null, data: null });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);

  // Khởi tạo todayOnly là chuỗi rỗng
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS, todayOnly: '' });

  // Helper để lấy chuỗi ngày hôm nay YYYY-MM-DD
  const getTodayString = () => new Date().toISOString().split('T')[0];

  // Click outside calendar
  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setShowCalendar(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadData = useCallback(async (currentFilters, isAppend = false) => {
    try {
      isAppend ? setLoadingMore(true) : setLoading(true);
      
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '' && v !== null)
      );

      const res = await workoutApi.getAll(params);
      const rawData = res.data?.data || [];
      
      setHasMore(currentFilters.page < (res.data.totalPages || 1));
      setWorkouts(prev => isAppend ? [...prev, ...rawData] : rawData);
    } catch (err) {
      toast.error("Failed to load workouts");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const isFirstRender = useRef(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!isFirstRender.current) return;
      isFirstRender.current = false; 

      try {
        await workoutApi.checkAllAutoMissed();
        await loadData(filters, false);
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu:", err);
        loadData(filters, false);
      }
    };
    initializeDashboard();
  }, []); 

  useEffect(() => {
    const handler = setTimeout(() => {
      loadData({ ...filters, page: 1 }, false);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [filters.search, filters.numExercises, filters.startDate, filters.endDate, filters.todayOnly, loadData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const toggleTodayFilter = () => {
    setFilters(prev => ({ 
      ...prev, 
      todayOnly: prev.todayOnly === '' ? getTodayString() : '', 
      page: 1 
    }));
  };

  const handleDateSelect = (value) => {
    if (value?.[0] && value?.[1]) {
      setFilters(prev => ({
        ...prev,
        startDate: value[0].toISOString().split('T')[0],
        endDate: value[1].toISOString().split('T')[0],
        todayOnly: '', 
        page: 1
      }));
      setShowCalendar(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout plan?")) return;
    try {
      await workoutApi.delete(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Error deleting");
    }
  };

  const closeModal = () => setActiveModal({ type: null, data: null });

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg">
                <LayoutGrid size={24} strokeWidth={3} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">My Workouts</h1>
            </div>
            <p className="text-gray-400 font-bold text-[10px] tracking-[0.3em] uppercase pl-1 italic">
              TODAY: {formatDate(new Date())}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/measurements" className="flex items-center gap-2 bg-white border-2 border-gray-900 text-gray-900 px-6 py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all hover:bg-gray-50 shadow-sm">
              <Activity size={16} strokeWidth={3} /> Body Measurements
            </Link>
            <button onClick={() => setActiveModal({ type: 'CREATE' })} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] flex items-center justify-center gap-2 uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              <Plus size={18} /> Create
            </button>
          </div>
        </div>

        {/* FILTERS & TOOLS */}
        <div className="flex flex-col md:flex-row gap-3 mb-4 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm items-center">
          <div className="flex-[2] relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input name="search" placeholder="Find training program name..." className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" onChange={handleFilterChange} />
          </div>
          
          <div className="flex-1 relative w-full">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="number" min="0" name="numExercises" placeholder="Exercises..." className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" onChange={handleFilterChange} value={filters.numExercises} />
          </div>

          <div className="flex-1 relative w-full" ref={calendarRef}>
            <button onClick={() => setShowCalendar(!showCalendar)} className="w-full flex items-center gap-3 pl-4 pr-4 py-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all overflow-hidden">
              <CalendarRange size={16} className="text-blue-500 shrink-0" />
              <span className="truncate">{filters.startDate ? `${filters.startDate} / ${filters.endDate}` : "Filter by date..."}</span>
              {filters.startDate && <X size={14} className="ml-auto hover:text-red-500" onClick={(e) => { e.stopPropagation(); setFilters(prev => ({...prev, startDate: '', endDate: ''})) }} />}
            </button>
            {showCalendar && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-white p-4 rounded-3xl shadow-2xl border border-gray-100">
                <Calendar onChange={handleDateSelect} selectRange={true} />
              </div>
            )}
          </div>

          {/* NÚT LỌC TODAY NHỎ GỌN */}
          <button 
            onClick={toggleTodayFilter}
            className={`flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-[10px] font-black transition-all border-2 ${
              filters.todayOnly !== '' 
              ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100' 
              : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200 hover:text-orange-500'
            }`}
          >
            <Clock size={14} className={filters.todayOnly !== '' ? 'animate-pulse' : ''} />
            TODAY
          </button>
        </div>

        {/* Trạng thái filter active */}
        {filters.todayOnly !== '' && (
          <div className="mb-6 flex items-center gap-2 px-2 animate-in fade-in slide-in-from-left duration-300">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
              Filtering for date: {filters.todayOnly}
            </span>
          </div>
        )}

        {/* GRID */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {workouts.length > 0 ? workouts.map((plan) => (
                <WorkoutCard 
                  key={plan.id} 
                  plan={plan} 
                  onDelete={handleDelete}
                  onEditName={(p) => setActiveModal({ type: 'EDIT_NAME', data: p })}
                  onEditSchedule={(p) => setActiveModal({ type: 'EDIT_SCHEDULE', data: p })}
                  onOpenTimeline={(p) => setActiveModal({ type: 'TIMELINE', data: p })}
                />
              )) : (
                <div className="col-span-full py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4">
                  <Dumbbell size={48} className="text-gray-200" />
                  <div className="text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No workouts found</p>
                    {filters.todayOnly !== '' && (
                      <button onClick={toggleTodayFilter} className="mt-2 text-blue-600 font-black text-[10px] uppercase underline">View all programs</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {hasMore && filters.todayOnly === '' && (
              <div className="mt-16 flex justify-center">
                <button 
                  onClick={() => {
                    const nextPage = filters.page + 1;
                    setFilters(f => ({ ...f, page: nextPage }));
                    loadData({ ...filters, page: nextPage }, true);
                  }} 
                  disabled={loadingMore} 
                  className="px-12 py-4 bg-white border-2 border-gray-900 rounded-2xl font-black text-[11px] tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all flex items-center gap-2"
                >
                  {loadingMore && <Loader2 size={14} className="animate-spin" />} SEE MORE
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      <CreateWorkoutModal isOpen={activeModal.type === 'CREATE'} onClose={closeModal} onSuccess={() => loadData(filters)} />
      <EditWorkoutModal isOpen={activeModal.type === 'EDIT_NAME'} workout={activeModal.data} onClose={closeModal} onSuccess={() => loadData(filters)} />
      <ScheduleModal isOpen={activeModal.type === 'EDIT_SCHEDULE'} workout={activeModal.data} onClose={closeModal} onSuccess={() => loadData(filters)} />
      <WorkoutTimelineModal isOpen={activeModal.type === 'TIMELINE'} workout={activeModal.data} onClose={closeModal} onSuccess={() => loadData(filters)} />
    </div>
  );
}