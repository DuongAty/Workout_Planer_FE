import React from 'react';
import { Dumbbell, ChartBar, Shield, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleStartNow = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <span className="inline-block py-1 px-4 rounded-full bg-blue-600/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
              Fitness Management 2.0
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-8">
              NÂNG TẦM <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                THỂ HÌNH
              </span> CỦA BẠN
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto lg:mx-0">
              Quản lý lịch tập thông minh, theo dõi khối lượng tập luyện và tối ưu hóa kết quả cùng TD Fitness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* CẬP NHẬT: Button kiểm tra User để điều hướng */}
              <button 
                onClick={handleStartNow}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                BẮT ĐẦU NGAY <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2">
                <Play size={18} fill="white" /> XEM DEMO
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
             <div className="relative z-10 rounded-[2.5rem] border-8 border-white/5 overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000" 
                  alt="Workout Preview" 
                  className="w-full h-auto"
                />
             </div>
          </div>
        </div>
      </section>
      {/* --- FEATURES SECTION --- */}
      <section className="py-32 container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Tính năng độc quyền</h2>
          <p className="text-gray-500 max-w-2xl mx-auto italic">Được thiết kế để tối ưu hóa trải nghiệm tập luyện hàng ngày của bạn.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Dumbbell size={32} />}
            title="Quản lý bài tập"
            desc="Tạo và tùy chỉnh danh sách bài tập cho từng nhóm cơ: Ngực, Vai, Lưng, Chân..."
          />
          <FeatureCard 
            icon={<ChartBar size={32} />}
            title="Theo dõi Reps/Sets"
            desc="Lưu trữ chi tiết khối lượng tập, thời gian nghỉ và ghi chú kỹ thuật cho mỗi bài."
          />
          <FeatureCard 
            icon={<Shield size={32} />}
            title="Bảo mật dữ liệu"
            desc="Toàn bộ lịch trình và tiến độ của bạn được đồng bộ an toàn trên đám mây."
          />
        </div>
      </section>
      {/* --- CTA SECTION --- */}
      <section className="container mx-auto px-6 pb-32">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-center text-white">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black mb-8 uppercase tracking-tighter">Sẵn sàng cho phiên bản <br/> tốt nhất của bạn?</h2>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 size={20} className="text-emerald-400" /> Miễn phí 100%</div>
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 size={20} className="text-emerald-400" /> Không quảng cáo</div>
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 size={20} className="text-emerald-400" /> Đồng bộ Real-time</div>
            </div>
            {/* CẬP NHẬT: Tận dụng handleStartNow cho cả nút dưới cùng */}
            <button 
              onClick={handleStartNow}
              className="px-12 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-gray-100 transition-all inline-block shadow-2xl transform active:scale-95 uppercase tracking-widest text-sm"
            >
              Tham gia ngay
            </button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-white rounded-full" />
          </div>
        </div>
      </section>
      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="font-black text-xl tracking-tighter mb-4 uppercase">TD <span className="text-blue-600">Fitness</span></p>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">© 2026 Workout Manager. Built for Champions.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-gray-50 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}