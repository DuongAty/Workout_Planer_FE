import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, ListOrdered, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { stepOfExerciseApi } from '../../api/endpoints';

export default function VideoModal({ isOpen, videoUrl, exerciseId, exerciseName, onClose }) {
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSteps = async () => {
      if (isOpen && exerciseId) {
        try {
          setLoading(true);
          const response = await stepOfExerciseApi.getByExercise(exerciseId); //
          setSteps(response.data || []);
        } catch (error) {
          console.error("Fetch steps error:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSteps();
  }, [isOpen, exerciseId]); //

  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row h-[85vh] max-h-[800px]">
        
        {/* NÚT ĐÓNG MODAL */}
        <button 
          onClick={() => {
            setShowSteps(false);
            onClose();
          }} 
          className="absolute top-6 right-6 z-[110] p-2 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all border border-white/10"
        >
          <X size={20} />
        </button>

        {/* PHẦN VIDEO PLAYER */}
        <div className={`relative transition-all duration-700 ease-in-out bg-black flex items-center justify-center ${showSteps ? 'md:w-2/3' : 'md:w-full'}`}>
          <video src={videoUrl} controls autoPlay className="w-full h-full object-contain shadow-2xl">
            Your browser does not support video tags.
          </video>

          {/* NÚT MŨI TÊN THU NHỎ - CHỮ "STEP" */}
          <button 
            onClick={() => setShowSteps(!showSteps)}
            className={`absolute top-1/2 -translate-y-1/2 z-50 py-3 px-1.5 transition-all duration-500 flex flex-col items-center gap-1 group
              ${showSteps 
                ? 'right-0 bg-white text-blue-600 rounded-l-xl shadow-[-5px_0_15px_rgba(0,0,0,0.15)]' 
                : 'right-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105'
              }`}
          >
            {showSteps ? (
              <>
                <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180 opacity-80">Step</span>
              </>
            ) : (
              <>
                <ChevronLeft size={18} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">Step</span>
              </>
            )}
          </button>
        </div>

        {/* SIDEBAR DANH SÁCH STEPS */}
        <div 
          className={`bg-white transition-all duration-700 ease-in-out flex flex-col relative
            ${showSteps ? 'md:w-1/3 opacity-100' : 'w-0 opacity-0 invisible'}`}
        >
          <div className="p-6 border-b border-gray-100 flex flex-col gap-1 bg-white sticky top-0 z-10">
            <h3 className="text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
              <ListOrdered size={14} /> Execution
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{exerciseName}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center text-blue-600">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : steps.length > 0 ? (
              steps.sort((a, b) => a.order - b.order).map((step, idx) => (
                <div key={step.id || idx} className="flex gap-3 animate-in slide-in-from-right duration-500">
                  <div className="flex-shrink-0 w-7 h-7 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg flex items-center justify-center border border-blue-100/50">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed italic pt-1">
                    {step.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 py-10">
                <ListOrdered size={32} strokeWidth={1} />
                <p className="text-[9px] font-black uppercase tracking-widest">No steps recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}