import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, LogIn, Dumbbell, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google'; // Import hook

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Cấu hình Google Login Redirect
  const googleLogin = useGoogleLogin({
    flow: 'auth-code', // Quan trọng: Lấy Authorization Code
    ux_mode: 'redirect', // Chuyển trang thay vì Popup
    redirect_uri: `${import.meta.env.VITE_FE_URL}/auth/google/callback`, // Phải khớp 100% với Google Console
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    try {
      await login(data);
      navigate('/dashboard'); 
    } catch (error) {
      setServerError(error.response?.data?.message || "Incorrect username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div onClick={() => navigate('/')} className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 -rotate-3 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95">
            <Dumbbell className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            TD <span className="text-blue-500">Fitness</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2 text-[10px] uppercase tracking-[0.3em]">
            Professional Training Management System
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">  
          {serverError && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
             {/* ... (Giữ nguyên phần input Username/Password của bạn) ... */}
             <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  {...register("username", { required: "Please enter your username" })}
                  placeholder="Username"
                  className={`w-full bg-white/5 border ${errors.username ? 'border-red-500/50' : 'border-white/10'} p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600`}
                />
              </div>
              {errors.username && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  {...register("password", { required: "Please enter your password" })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.password.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (<> <Loader2 className="animate-spin" size={20} /> VERIFYING... </>) : (<> LOGIN <LogIn size={20} /> </>)}
            </button>
          </form>

          <div className="flex items-center my-6 gap-4">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Or</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          {/* Nút Google đã được thay thế logic */}
          <button 
            type="button"
            onClick={() => googleLogin()} 
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
          >
             {/* ... SVG Icon Google giữ nguyên ... */}
             <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-gray-400 text-sm font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 font-black hover:text-blue-300 transition-colors uppercase text-xs">
                Register now
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase font-bold tracking-[0.3em]">
          Powered by TD Fitness System v2.0
        </p>
      </div>
    </div>
  );
}