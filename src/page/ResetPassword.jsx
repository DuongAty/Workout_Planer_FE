import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }
    if (!token) {
      return toast.error("Token không hợp lệ hoặc đã hết hạn");
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/auth/reset-password`, {
        token: token,
        newPassword: newPassword
      });

      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] font-sans p-4 relative overflow-hidden">
      {/* Background Decor tương tự trang Login */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      {/* Logo Section */}
      <div className="mb-8 text-center relative z-10">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          TD <span className="text-blue-500 text-3xl">Fitness</span>
        </h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
          Professional Training Management System
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full bg-[#1e293b]/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10">
        <h2 className="text-white text-sm font-black uppercase tracking-widest text-center mb-8 italic">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPass ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0f172a]/50 border border-white/5 p-4 pl-12 rounded-2xl outline-none text-white focus:border-blue-500 transition-all placeholder:text-gray-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPass ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0f172a]/50 border border-white/5 p-4 pl-12 rounded-2xl outline-none text-white focus:border-blue-500 transition-all placeholder:text-gray-600"
                placeholder="••••••••"
              />
                            <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:-translate-y-1 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs mt-4 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Reset Password <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            Back to <span className="text-blue-500">Login</span>
          </button>
        </div>
      </div>

      {/* Footer tương tự trang Login */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">
          Powered by TD Fitness System v2.0
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;