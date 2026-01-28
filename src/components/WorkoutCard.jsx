import React, { useMemo } from "react";
import { 
  CalendarDays, 
  CalendarRange, 
  CalendarSync, 
  ChevronRight, 
  Dumbbell, 
  PencilLine, 
  Trash2 
} from "lucide-react";
import { Link } from "react-router-dom";
import WorkoutProgressChart from "../components/charts/WorkoutProgressChart";
import { formatDate } from "../common/constants";

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
    <div className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full overflow-hidden">
      {/* 1. TOP ACTIONS */}
      <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
        <button onClick={() => onEditSchedule(plan)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors shadow-sm">
          <CalendarSync size={18} />
        </button>
        <button onClick={() => onEditName(plan)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
          <PencilLine size={18} />
        </button>
        <button onClick={() => onDelete(plan.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm">
          <Trash2 size={18} />
        </button>
      </div>
      {/* 2. ICON & HEADER */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 
        ${isMissed ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-200 group-hover:scale-110'}`}>
        <Dumbbell size={32} />
      </div>
      <div className="space-y-4 mb-8">
        <h3 className={`text-2xl font-black uppercase tracking-tight truncate pr-20 ${isMissed ? 'text-gray-400 line-through decoration-red-400' : 'text-gray-900'}`}>
          {plan.name}
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 tracking-widest uppercase">
            <CalendarDays size={14} className="text-blue-500" />
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
          </div>
          <button 
            onClick={() => onOpenTimeline(plan)}
            className={`flex items-center self-start gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all hover:brightness-110 active:scale-95 ${
              nextDate ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <CalendarRange size={14} />
            {nextDate ? `NEXT: ${formatDate(nextDate)}` : "FINISHED"}
          </button>
        </div>
      </div>
      {/* 3. BALANCED FOOTER SECTION */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 mt-auto items-stretch">
        {/* LEFT COLUMN: EXERCISES */}
        <div className="flex flex-col gap-3">
          <div className="bg-gray-50/80 rounded-[1.5rem] p-5 flex flex-col flex-1 border border-transparent group-hover:border-blue-50 transition-colors">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
              Exercises
            </span>
            <span className="text-3xl font-black text-gray-800 leading-none mt-1">
              {plan.numExercises || 0}
            </span>
          </div>
          <Link 
            to={`/workout/${plan.id}`} 
            className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white font-black rounded-[1.2rem] hover:bg-blue-600 transition-all uppercase text-[10px] tracking-[0.15em] group/btn shadow-lg shadow-gray-100"
          >
            DETAILS 
            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
        {/* RIGHT COLUMN: PROGRESS (Căn bằng tiêu đề với bên trái) */}
        <div className="bg-gray-50/80 rounded-[2rem] p-5 flex flex-col border border-transparent group-hover:border-blue-50 transition-all relative overflow-hidden group/progress">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">
            Progress
          </span>
          <div className="flex-1 flex items-center justify-center relative z-10 transition-transform duration-700 group-hover/progress:scale-150 scale-150">
            <WorkoutProgressChart scheduleItems={plan.scheduleItems} />
          </div>
          {/* Trang trí góc card */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-100/30 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};