import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Loader2, Calendar, RefreshCw, ChevronLeft, 
  Activity, BarChart3, ClipboardList, Send,
  Zap, Target, Utensils, Flame, TrendingDown, PlusCircle
} from 'lucide-react';
import { nutritionApi } from '../api/endpoints';

/* --- HELPERS --- */
const fmt = (n) => (n == null || isNaN(n) ? '0' : Intl.NumberFormat().format(Math.round(n)));

const goalLabel = (g) => {
  const map = { maintain: 'Duy trì', lose: 'Giảm cân', gain: 'Tăng cân', gain_muscle: 'Tăng cơ' };
  return map[g] || 'Duy trì';
};

/* --- SUB-COMPONENTS --- */
function StatCard({ title, value, icon: Icon, colorClass, subValue }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
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

  const fetchData = useCallback(async () => {
    try {
      const { data } = await nutritionApi.getDailySummary();
      setSummary(data);
    } catch (err) {
      toast.error('Không thể tải dữ liệu mới nhất');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!mealText.trim()) return toast.error('Hãy nhập những gì bạn đã ăn');
    
    setIsLogging(true);
    const t = toast.loading('AI đang phân tích dinh dưỡng...');
    try {
      await nutritionApi.logMeal(mealText.trim());
      toast.success('Ghi nhận bữa ăn thành công!', { id: t });
      setMealText('');
      fetchData(); // Refresh lại dữ liệu Dashboard
    } catch (err) {
      toast.error('Lỗi phân tích bữa ăn', { id: t });
    } finally {
      setIsLogging(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  const { 
    intake = 0, 
    burned = { bmr: 0, workout: 0, total: 0 }, 
    balance = 0, 
    userGoal, 
    analysis, 
    recentLogs = [] 
  } = summary || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-black text-gray-900 text-lg uppercase tracking-tighter italic">Dinh dưỡng & Calo</h1>
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:rotate-180">
            <RefreshCw size={20} className="text-indigo-600" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        
        {/* ROW 1: STATUS & TARGET */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                  <Zap size={14} fill="currentColor" /> Live Balance
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="text-6xl font-black mb-1 tracking-tighter italic">
                      {fmt(balance)} <span className="text-xl font-normal opacity-50 ml-1">kcal</span>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Net Calories (Intake - Total Burned)</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-sm max-w-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase italic">Phân tích nhanh</span>
                      <span className="text-red-400 text-[10px] font-black uppercase bg-red-400/10 px-2 py-0.5 rounded">DEFICIT</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Bạn đang thâm hụt <b className="text-white">{fmt(Math.abs(balance))} kcal</b>. Trạng thái này hỗ trợ giảm mỡ hiệu quả.
                    </p>
                  </div>
                </div>
              </div>
              <TrendingDown className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <StatCard title="Mục tiêu" value={goalLabel(userGoal)} icon={Target} colorClass="bg-blue-50 text-blue-600" />
            <StatCard title="Ngày ghi nhận" value={summary?.date} icon={Calendar} colorClass="bg-indigo-50 text-indigo-600" />
          </div>
        </div>

        {/* ROW 2: DETAILED METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Nạp vào" value={`${fmt(intake)} kcal`} icon={Utensils} colorClass="bg-orange-50 text-orange-500" subValue="Từ thực phẩm" />
          <StatCard title="Tập luyện" value={`${fmt(burned.workout)} kcal`} icon={Flame} colorClass="bg-red-50 text-red-500" subValue="Năng lượng tiêu hao thêm" />
          <StatCard title="Chuyển hóa" value={`${fmt(burned.bmr)} kcal`} icon={Activity} colorClass="bg-emerald-50 text-emerald-500" subValue="Đốt tự nhiên (BMR)" />
          <StatCard title="Tổng đốt" value={`${fmt(burned.total)} kcal`} icon={TrendingDown} colorClass="bg-gray-100 text-gray-900" subValue="BMR + Workout" />
        </div>

        {/* ROW 3: LOG MEAL & RECENT LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: FORM NHẬP LOG */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleLogMeal} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <PlusCircle className="text-indigo-600" size={24} />
                <h3 className="font-black text-gray-800 text-xl italic uppercase tracking-tighter">AI Log Meal</h3>
              </div>
              <div className="relative">
                <textarea
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  placeholder='Ví dụ: "1 bát phở bò và 1 ly nước cam"'
                  className="w-full p-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 min-h-[140px] text-sm text-gray-700 placeholder:text-gray-300 transition-all"
                  disabled={isLogging}
                />
                <button
                  type="submit"
                  disabled={isLogging || !mealText.trim()}
                  className="absolute bottom-4 right-4 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isLogging ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 font-medium italic text-center uppercase tracking-widest">Powered by AI Nutrition Analysis</p>
            </form>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 size={24} />
                <h3 className="font-black text-lg italic uppercase tracking-tighter">AI Analysis</h3>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed italic">
                {analysis || "Hệ thống đang chờ dữ liệu bữa ăn để phân tích sự cân bằng dinh dưỡng của bạn hôm nay."}
              </p>
            </div>
          </div>

          {/* RIGHT: DANH SÁCH CHI TIẾT BỮA ĂN */}
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-gray-400" size={24} />
                <h3 className="font-black text-gray-800 text-xl italic uppercase tracking-tighter">Bữa ăn gần đây</h3>
              </div>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                {recentLogs.length} logs
              </span>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
              {recentLogs.length > 0 ? recentLogs.map((log, idx) => (
                <div key={idx} className="bg-gray-50 rounded-3xl p-6 border border-transparent hover:border-indigo-100 hover:bg-white transition-all group shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-black text-gray-800 group-hover:text-indigo-600 transition-colors text-lg italic">
                        {log.mealDescription || `Bữa ăn #${recentLogs.length - idx}`}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter flex items-center gap-1 mt-1">
                        <Calendar size={10} /> 
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Vừa xong'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-600 tracking-tighter">+{fmt(log.calories)}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase italic">kcal</div>
                    </div>
                  </div>
                  
                  {/* Macros Detail */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                    <div className="text-center bg-white rounded-2xl p-2 border border-gray-50">
                      <div className="text-[9px] text-gray-400 font-black uppercase italic">Protein</div>
                      <div className="text-sm font-black text-gray-700">{log.protein || 0}g</div>
                    </div>
                    <div className="text-center bg-white rounded-2xl p-2 border border-gray-50">
                      <div className="text-[9px] text-gray-400 font-black uppercase italic">Carbs</div>
                      <div className="text-sm font-black text-gray-700">{log.carbs || 0}g</div>
                    </div>
                    <div className="text-center bg-white rounded-2xl p-2 border border-gray-50">
                      <div className="text-[9px] text-gray-400 font-black uppercase italic">Fat</div>
                      <div className="text-sm font-black text-gray-700">{log.fat || 0}g</div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                   <Utensils size={48} strokeWidth={1} className="mb-4 opacity-20" />
                   <p className="text-xs font-bold uppercase tracking-widest italic">Chưa có dữ liệu bữa ăn</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}