import { useMemo } from "react";
import { formatDate } from "../common/constants";
import { CalendarDays, CalendarRange, CalendarSync, ChevronRight, Dumbbell, PencilLine, Trash2 } from "lucide-react";
import WorkoutProgressChart from "../components/charts/WorkoutProgressChart";
import { Link } from "react-router-dom";

export const WorkoutCard = ({ plan, onDelete, onEditName, onEditSchedule, onOpenTimeline }) => {
  const nextDate = useMemo(() => {
    if (!plan.scheduleItems?.length) return null;
    const today = new Date().setHours(0, 0, 0, 0);
    return plan.scheduleItems
      .map(item => new Date(item.date))
      .filter(date => date >= today)
      .sort((a, b) => a - b)[0] || null;
  }, [plan.scheduleItems]);

  const isMissed = plan.status === 'missed';

  return (
    <div className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 relative flex flex-col">
      <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
        <button onClick={() => onEditSchedule(plan)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors">
          <CalendarSync size={18} />
        </button>
        <button onClick={() => onEditName(plan)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
          <PencilLine size={18} />
        </button>
        <button onClick={() => onDelete(plan.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all 
        ${isMissed ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
        <Dumbbell size={28} />
      </div>

      <div className="space-y-4 mb-8">
        <h3 className={`text-2xl font-black uppercase tracking-tight truncate pr-10 ${isMissed ? 'text-gray-400 line-through decoration-red-400' : 'text-gray-900'}`}>
          {plan.name}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 tracking-widest uppercase">
          <CalendarDays size={14} className="text-blue-500" />
          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
        </div>
        
        <button 
          onClick={() => onOpenTimeline(plan)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-tighter uppercase transition-all hover:scale-105 active:scale-95 ${
            nextDate ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <CalendarRange size={14} />
          {nextDate ? `NEXT TRAINING: ${formatDate(nextDate)}` : "FINISHED"}
        </button>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Exercises</span>
          <span className="text-xl font-black text-gray-800 leading-none">{plan.numExercises || 0}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 text-right">Progress</span>
          <WorkoutProgressChart scheduleItems={plan.scheduleItems} />
        </div>
      </div>

      <Link to={`/workout/${plan.id}`} className="mt-8 flex items-center justify-center w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase text-[10px] tracking-widest group/btn">
        VIEW DETAILS <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};