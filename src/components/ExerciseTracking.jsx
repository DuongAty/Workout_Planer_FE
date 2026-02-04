import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, TrendingUp, History as HistoryIcon, 
  Calendar, Weight, Filter, LineChart as ChartIcon 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ExerciseTracking() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL; 
  const [progressData, setProgressData] = useState(null);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ weight: '', reps: '', rpe: '' });
    const [filters, setFilters] = useState({
    startDate: '2026-01-01',
    endDate: new Date().toISOString().split('T')[0]
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: getAuthHeader() };
      const [statsRes, progressRes, timelineRes] = await Promise.all([
        axios.get(`${API_BASE}/api/tracking/stats/${exerciseId}`, config),
        axios.get(`${API_BASE}/api/tracking/${exerciseId}/progress`, config),
        axios.get(`${API_BASE}/api/tracking/${exerciseId}/timeline`, {
          ...config,
          params: { startDate: filters.startDate, endDate: filters.endDate }
        })
      ]);
      setStats(statsRes.data);
      setProgressData(progressRes.data);
      setTimeline(timelineRes.data);  
    } catch (err) {
      console.error("Data loading error:", err.response?.data || err.message);
    }
  }, [exerciseId, filters]);

  useEffect(() => {
    if (exerciseId) fetchData();
  }, [exerciseId, fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/tracking/${exerciseId}/set`, 
        {
          weight: Number(formData.weight),
          reps: Number(formData.reps),
          rpe: formData.rpe ? Number(formData.rpe) : undefined
        },
        { headers: getAuthHeader() }
      );
      setFormData({ weight: '', reps: '', rpe: '' });
      fetchData();
      toast.success("Results have been recorded!");
    } catch (err) {
      toast.error("Error saving results!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      {/* Header & Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-8 font-black text-xs tracking-widest uppercase transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 sticky top-6">
            <h2 className="text-xl font-black mb-8 uppercase italic flex items-center gap-2 text-gray-800">
              <Activity size={20} className="text-blue-600" /> Record new results
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Weight (kg)</label>
                <input 
                  type="number" min="0" step="0.5" required 
                  value={formData.weight} 
                  onChange={e => setFormData({...formData, weight: e.target.value})} 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Repetitions (reps)</label>
                <input 
                  type="number" min="0" required 
                  value={formData.reps} 
                  onChange={e => setFormData({...formData, reps: e.target.value})} 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">RPE (1-10)</label>
                <input 
                  type="number" min="0" step="0.5" max="10" 
                  value={formData.rpe} 
                  onChange={e => setFormData({...formData, rpe: e.target.value})} 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
              >
                {loading ? 'Saving...' : 'Save This Set'}
              </button>
            </form>
          </div>
        </div>
        {/* CỘT PHẢI: THỐNG KÊ, BIỂU ĐỒ & LỊCH SỬ */}
        <div className="lg:col-span-2 space-y-8">
           {/* 1. THẺ THỐNG KÊ */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatBox 
                icon={<TrendingUp size={20}/>} 
                label="1RM Estimated" 
                value={`${stats?.personalRecord1RM || 0}kg`} 
                color="bg-gray-900 text-white" 
              />
              <StatBox 
                icon={<HistoryIcon size={20}/>} 
                label="Total Volume" 
                value={`${stats?.totalVolume || 0}kg`} 
                color="bg-blue-600 text-white" 
              />
              <StatBox 
                icon={<Weight size={20}/>} 
                label="Personal Record" 
                value={`${timeline?.[0]?.personalRecord || 0}kg`} 
                color="bg-purple-600 text-white" 
              />
           </div>
           {/* 2. BIỂU ĐỒ TIẾN TRIỂN (Sử dụng dữ liệu từ getTimelineProgress) */}
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <h3 className="font-black text-gray-800 uppercase italic flex items-center gap-3">
                  <ChartIcon size={20} className="text-blue-600" /> Progress Analysis
                </h3>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl">
                    <Filter size={14} className="text-gray-400 ml-1"/>
                    <input 
                      type="date" 
                      value={filters.startDate} 
                      onChange={e => setFilters({...filters, startDate: e.target.value})} 
                      className="text-[10px] font-bold bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                    />
                    <span className="text-gray-300">→</span>
                    <input 
                      type="date" 
                      value={filters.endDate} 
                      onChange={e => setFilters({...filters, endDate: e.target.value})} 
                      className="text-[10px] font-bold bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                    />
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 10, fontWeight: '800', fill: '#94a3b8'}} 
                        tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis yAxisId="left" hide />
                    <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                        labelStyle={{ fontWeight: '900', color: '#1f2937', marginBottom: '5px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }} />
                    <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="max1RM" 
                        name="Power (1RM)" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 8 }} 
                    />
                    <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="totalVolume" 
                        name="Weight (Volume)" 
                        stroke="#9333ea" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
           {/* 3. LỊCH SỬ CHI TIẾT */}
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-800 uppercase italic mb-8 flex items-center gap-3">
                <Calendar size={20} className="text-blue-600" /> Training diary
              </h3>
              <div className="space-y-4">
                {progressData?.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between p-5 bg-gray-50/50 hover:bg-blue-50 rounded-[2rem] transition-all border border-transparent hover:border-blue-100">
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-[65px]">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Date</p>
                        <p className="text-xs font-black text-gray-800">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="h-8 w-[1px] bg-gray-200"></div>
                      <div>
                        <p className="text-lg font-black text-gray-900 leading-none">
                          {item.weight}kg <span className="text-gray-300 mx-1">×</span> {item.reps} <span className="text-[10px] text-gray-400 uppercase">Reps</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.rpe && (
                        <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-3 py-1.5 rounded-xl uppercase">RPE {item.rpe}</span>
                      )}
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Volume</p>
                        <p className="text-sm font-black text-blue-600">{item.volume}kg</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!progressData?.history || progressData.history.length === 0) && (
                  <div className="py-20 text-center">
                    <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs italic">There is no data available in this range.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
function StatBox({ icon, label, value, color }) {
  return (
    <div className={`${color} p-6 rounded-[2.5rem] shadow-lg shadow-blue-900/5 transition-transform hover:scale-[1.02]`}>
      <div className="opacity-60 mb-2">{icon}</div>
      <p className="text-[10px] uppercase font-black tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter leading-none">{value}</p>
    </div>
  );
}