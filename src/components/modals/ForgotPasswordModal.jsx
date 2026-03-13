import React, { useState } from 'react';
import { Mail, X, Loader2, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/endpoints';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      toast.success("Yêu cầu đã được gửi! Vui lòng kiểm tra email.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi yêu cầu reset mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-md">
      <div className="bg-[#1e293b] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-10">
          {!isSuccess ? (
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 text-blue-500 rounded-2xl mb-4">
                  <Mail size={28} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Reset Password</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Nhập email để nhận liên kết khôi phục</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Gửi yêu cầu</>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 text-green-500 rounded-full mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Chúng tôi đã gửi hướng dẫn đổi mật khẩu tới <span className="text-white font-bold">{email}</span>. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
              </p>
              <button
                onClick={onClose}
                className="mt-8 w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}