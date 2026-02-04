import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { measurementApi } from '../api/endpoints';
import MeasurementChart from '../components/charts/MeasurementChart';
import { Activity, TrendingUp, Plus, Loader2, ChevronLeft, Calendar as CalendarIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MUSCLE_GROUPS } from '../common/constants';

export default function BodyMeasurements() {
  const [selectedGroup, setSelectedGroup] = useState('Ngực');
  const [chartData, setChartData] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return [start, end];
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateForApi = (date) => date.toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    setLoading(true);
    try {
      const startDate = formatDateForApi(dateRange[0]);
      const endDate = formatDateForApi(dateRange[1]);
      const [chartRes, progRes] = await Promise.all([
        measurementApi.getChartData(selectedGroup, startDate, endDate),
        measurementApi.getLatestProgress(selectedGroup)
      ]);
      setChartData(chartRes.data || []);
      setProgress(progRes.data || null);
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, dateRange]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const val = parseFloat(newValue);
    if (!newValue || isNaN(val) || isSaving) return;

    setIsSaving(true);
    try {
      await measurementApi.create({ 
        key: selectedGroup, 
        value: val 
      });
      toast.success('Đã cập nhật số đo mới!');
      setNewValue('');
      loadData();
    } catch (err) {
      toast.error('Lỗi khi lưu dữ liệu');
    } finally {
      setIsSaving(false);
    }
  };

  const diffDisplay = useMemo(() => {
    if (!progress || progress.diff === undefined) return null;
    const isPositive = progress.diff > 0;
    return (
      <div className={`mb-2 flex items-center text-sm font-bold px-2 py-0.5 rounded-lg bg-white/20`}>
        {isPositive ? '+' : ''}{progress.diff}
        <TrendingUp size={16} className={`ml-1 ${isPositive ? 'rotate-0' : 'rotate-180'} transition-transform`} />
      </div>
    );
  }, [progress]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-sans pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors w-fit">
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Body Stats</h1>
          <nav className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl overflow-x-auto max-w-full no-scrollbar shadow-inner">
            {MUSCLE_GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                  selectedGroup === g 
                    ? 'bg-white shadow-md text-blue-600 scale-105' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                }`}
              >
                {g}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-blue-600">
            <Plus size={20} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase italic tracking-widest">New Entry</span>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="relative">
              <input 
                type="number" min="0" step="0.1" value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value (cm)..."
                disabled={isSaving}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm transition-all disabled:opacity-50"
              />
            </div>
            <button 
              disabled={isSaving || !newValue}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
              {isSaving ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Save result"}
            </button>
          </form>
        </section>
        {/* Highlight Progress Card */}
        <section className="md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Activity size={200} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Activity size={32} strokeWidth={2.5} />
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                {progress?.status || 'Active Tracking'}
              </span>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase opacity-70 tracking-[0.2em] mb-2">Current {selectedGroup}</p>
              <div className="flex items-end gap-3">
                <span className="text-7xl font-black italic tracking-tighter">
                  {progress?.current?.value ?? progress?.current ?? '--'}
                </span>
                {diffDisplay}
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* History & Chart Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 italic">
            <TrendingUp size={14} /> Analysis & History
          </h3>
          <div className="relative" ref={calendarRef}>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all active:scale-95"
            >
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Time period</span>
                <span className="text-[11px] font-bold text-gray-700">
                  {dateRange[0]?.toLocaleDateString('vi-VN')} - {dateRange[1]?.toLocaleDateString('vi-VN')}
                </span>
              </div>
              <CalendarIcon size={18} className="text-blue-600" />
            </button>
            {showCalendar && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 min-w-[320px] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-[10px] font-black uppercase text-blue-600">Select Range</span>
                  <button onClick={() => setShowCalendar(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={14} /></button>
                </div>
                <Calendar
                  onChange={(val) => {
                    setDateRange(val);
                    if (val[1]) setShowCalendar(false);
                  }}
                  value={dateRange}
                  selectRange={true}
                  className="border-none font-sans rounded-xl"
                />
              </div>
            )}
          </div>
        </div>
        <div className="min-h-[400px] w-full bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Syncing data...</span>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <MeasurementChart data={chartData} />
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-gray-300 gap-4">
              <div className="p-6 bg-gray-50 rounded-full">
                <Activity size={48} strokeWidth={1} className="opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No metrics recorded</p>
                <p className="text-[9px] font-medium opacity-60">Try adjusting your date range filter</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}