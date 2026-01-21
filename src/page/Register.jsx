import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/endpoints';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Gọi API Register
      await authApi.register({
        fullname: data.fullname,
        username: data.username,
        password: data.password
      });

      toast.success("Congratulations! You have successfully registered.");
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || "Username already exists or system error.";
      toast.error("Registration error: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Hiệu ứng nền Blur Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 rotate-3">
            <Dumbbell className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            TD <span className="text-blue-500">Fitness</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2 text-[10px] uppercase tracking-[0.3em]">
            Professional Training Management System
          </p>
        </div>

        {/* Card Đăng Ký */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  {...register("fullname")}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600"
                  required 
                />
              </div>
            </div>

            {/* Tên đăng nhập */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  {...register("username")}
                  placeholder="tranduong_gym"
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600"
                  required 
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600"
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nút Submit */}
            <button 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> PROCESSING...
                </>
              ) : (
                <>
                  Register Account <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-gray-400 text-sm font-medium">
              You already have an account?{' '}
              <Link to="/login" className="text-blue-400 font-black hover:text-blue-300 transition-colors">
                LOGIN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}