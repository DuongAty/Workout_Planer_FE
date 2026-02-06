import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CalendarPicker from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Loader2, Calendar as CalendarIcon, RefreshCw, ChevronLeft, 
  Activity, BarChart3, ClipboardList, Send,
  Zap, Target, Utensils, Flame, TrendingDown, PlusCircle,
  MessageSquare
} from 'lucide-react';
import { nutritionApi } from '../api/endpoints';
import { formatDate } from '../common/constants';

/* --- HELPERS --- */
const fmt = (n) => (n == null || isNaN(n) ? '0' : Intl.NumberFormat().format(Math.round(n)));

const goalLabel = (g) => {
  const map = { maintain: 'Duy trì', lose: 'Giảm cân', gain: 'Tăng cân', gain_muscle: 'Tăng cơ' };
  return map[g] || 'Duy trì';
};

/**
 * Hàm định dạng ngày YYYY-MM-DD chuẩn không bị lệch múi giờ
 */
const formatDateCalo = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
};

/* --- SUB-COMPONENTS --- */
function StatCard({ title, value, icon: Icon, colorClass, subValue, onClick, active }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-5 rounded-[2rem] border transition-all duration-300 ${
        active ? 'border-indigo-500 shadow-md scale-[1.02]' : 'border-gray-100 shadow-sm'
      } ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''} relative overflow-hidden`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{title}</div>
          <div className="text-xl font-black text-gray-800">{value}</div>
          {subValue && <div className="text-[10px] text-gray-500 font-medium">{subValue}</div>}
        </div>
      </div>
    </div>
  );
}

/* --- MAIN PAGE --- */
export default function CaloriePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mealText, setMealText] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Sử dụng helper function để có YYYY-MM-DD chính xác gửi lên API
  const dateString = formatDateCalo(selectedDate);

  const fetchData = useCallback(async (dateStr) => {
    setLoading(true);
    try {
      // Gọi đến API /summary?date=YYYY-MM-DD
      const { data } = await nutritionApi.getDailySummary(dateStr);
      setSummary(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải dữ liệu ngày ' + dateStr);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(dateString); 
  }, [dateString, fetchData]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!mealText.trim()) return toast.error('Hãy nhập những gì bạn đã ăn');
    
    setIsLogging(true);
    const t = toast.loading('AI đang phân tích dinh dưỡng...');
    try {
      await nutritionApi.logMeal(mealText.trim());
      toast.success('Ghi nhận bữa ăn thành công!', { id: t });
      setMealText('');
      fetchData(dateString); 
    } catch (err) {
      toast.error('Lỗi phân tích bữa ăn', { id: t });
    } finally {
      setIsLogging(false);
    }
  };

  const { 
    intake = 0, 
    burned = { bmr: 0, workout: 0, total: 0 }, 
    balance = 0, 
    userGoal, 
    analysis, 
    recentLogs = [] 
  } = summary || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans relative">
      <style>{`
        .react-calendar { width: 320px; border: none; font-family: inherit; border-radius: 1.5rem; padding: 10px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
        .react-calendar__tile--active { background: #4f46e5 !important; border-radius: 0.75rem; }
        .react-calendar__tile--now { background: #eef2ff !important; color: #4f46e5 !important; border-radius: 0.75rem; }
        .react-calendar__tile:hover { border-radius: 0.75rem; }
        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f8fafc; border-radius: 0.5rem; }
      `}</style>

      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-black text-gray-900 text-lg uppercase tracking-tighter italic">Dinh dưỡng & Calo</h1>
          <button onClick={() => fetchData(dateString)} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:rotate-180">
            <RefreshCw size={20} className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* TOP PANEL: STATUS & DATE SELECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                  <Zap size={14} fill="currentColor" /> {dateString === formatDate(new Date()) ? 'Live Status' : 'History View'}
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="text-6xl font-black mb-1 tracking-tighter italic">
                      {fmt(balance)} <span className="text-xl font-normal opacity-50 ml-1">kcal</span>
                    </div>
                    <div className="text-sm text-gray-400 font-medium italic">Cân bằng (Nạp vào - Tổng đốt)</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-sm max-w-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase italic">Phân tích nhanh</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${balance <= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                        {balance <= 0 ? 'DEFICIT' : 'SURPLUS'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed italic">
                      Bạn đang {balance <= 0 ? 'thâm hụt' : 'dư'} <b className="text-white">{fmt(Math.abs(balance))} kcal</b>. Trạng thái này hỗ trợ <b>{balance <= 0 ? 'giảm mỡ' : 'tăng cân'}</b>.
                    </p>
                  </div>
                </div>
              </div>
              <TrendingDown className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <StatCard title="Mục tiêu" value={goalLabel(userGoal)} icon={Target} colorClass="bg-blue-50 text-blue-600" />
            
            <div className="relative">
              <StatCard 
                title="Ngày ghi nhận" 
                value={formatDate(dateString)} 
                icon={CalendarIcon} 
                colorClass="bg-indigo-50 text-indigo-600"
                subValue="Nhấn để chọn lịch"
                active={showCalendar}
                onClick={() => setShowCalendar(!showCalendar)}
              />
              
              {showCalendar && (
                <div className="absolute top-full right-0 mt-3 z-50 animate-in fade-in zoom-in duration-200">
                  <CalendarPicker
                    onChange={handleDateChange}
                    value={selectedDate}
                    maxDate={new Date()}
                    locale="vi-VN"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Đã nạp (Intake)" value={`${fmt(intake)} kcal`} icon={Utensils} colorClass="bg-orange-50 text-orange-500" subValue="Dựa trên thực phẩm" />
          <StatCard title="Tập luyện" value={`${fmt(burned.workout)} kcal`} icon={Flame} colorClass="bg-red-50 text-red-500" subValue="Năng lượng tiêu hao" />
          <StatCard title="Chuyển hóa (BMR)" value={`${fmt(burned.bmr)} kcal`} icon={Activity} colorClass="bg-emerald-50 text-emerald-500" subValue="Đốt tự nhiên khi nghỉ" />
          <StatCard title="Tổng đốt cháy" value={`${fmt(burned.total)} kcal`} icon={TrendingDown} colorClass="bg-gray-100 text-gray-900" subValue="BMR + Tập luyện" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: LOGGING & ANALYSIS */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleLogMeal} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <PlusCircle className="text-indigo-600" size={24} />
                <h3 className="font-black text-gray-800 text-xl italic uppercase tracking-tighter italic">AI Log Meal</h3>
              </div>
              <div className="relative">
                <textarea
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  placeholder='Ví dụ: "1 bát phở bò và 1 ly nước cam"'
                  className="w-full p-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 min-h-[140px] text-sm text-gray-700 transition-all"
                  disabled={isLogging}
                />
                <button
                  type="submit"
                  disabled={isLogging || !mealText.trim()}
                  className="absolute bottom-4 right-4 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isLogging ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-widest italic opacity-50">Powered by AI Nutrition Analysis</p>
            </form>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 size={24} />
                <h3 className="font-black text-lg italic uppercase tracking-tighter">AI Analysis</h3>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed italic">
                {analysis || "Hệ thống đang chờ dữ liệu bữa ăn để phân tích sự cân bằng dinh dưỡng của bạn hôm nay."}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: RECENT LOGS */}
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-gray-400" size={24} />
                <h3 className="font-black text-gray-800 text-xl italic uppercase tracking-tighter">Bữa ăn ngày {formatDate(dateString)}</h3>
              </div>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic border border-indigo-100">
                {recentLogs.length} logs
              </span>
            </div>
            
            <div className="space-y-4">
              {recentLogs.length > 0 ? recentLogs.map((log, idx) => (
                <div key={log.id || idx} className="bg-gray-50 rounded-3xl p-6 border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                      <div className="font-black text-gray-800 text-lg italic leading-tight">
                        {log.mealDescription}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-2 flex items-center gap-1">
                        <CalendarIcon size={10} /> 
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'Vừa xong'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-600 tracking-tighter">+{fmt(log.calories)}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase italic text-center">kcal</div>
                    </div>
                  </div>

                  {/* MACROS */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-[9px] text-gray-400 font-black uppercase mb-1">Protein</div>
                      <div className="text-sm font-black text-gray-700">{log.protein || 0}g</div>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <div className="text-[9px] text-gray-400 font-black uppercase mb-1">Carbs</div>
                      <div className="text-sm font-black text-gray-700">{log.carbs || 0}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] text-gray-400 font-black uppercase mb-1">Fat</div>
                      <div className="text-sm font-black text-gray-700">{log.fat || 0}g</div>
                    </div>
                  </div>

                  {log.advice && (
                    <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl flex gap-3 items-start border border-indigo-100 shadow-inner">
                      <MessageSquare size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-indigo-800 font-medium italic leading-relaxed">
                        {log.advice}
                      </p>
                    </div>
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                   <Utensils size={64} strokeWidth={1} className="mb-4 opacity-10" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic text-center leading-loose">
                    Dữ liệu trống <br/> 
                    <span className="text-gray-400">Không tìm thấy bản ghi nào cho ngày này</span>
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Popover overlay */}
      {showCalendar && (
        <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setShowCalendar(false)}></div>
      )}
    </div>
  );
}