import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function ChangePasswordModal({ isOpen, onClose, isFirstTime, userId }) {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }

    setLoading(true);
    try {
      await axios.patch(`${API_URL}/api/v1/auth/change-password`, {
        userId,
        currentPassword: isFirstTime ? null : formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      toast.success(isFirstTime ? "Thiết lập mật khẩu thành công!" : "Đổi mật khẩu thành công!");
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
          <X size={24} />
        </button>

        <div className="p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
              {isFirstTime ? "Set Password" : "Change Password"}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {isFirstTime ? "Secure your social account" : "Keep your account safe"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isFirstTime && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <p className="text-[10px] text-red-500 font-bold italic ml-1 mt-1 leading-tight">
                * Mật khẩu phải trên 8 ký tự bao gồm chữ in hoa và số hoặc ký tự đặc biệt
             </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}