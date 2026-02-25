import React, { useState, useEffect } from 'react';
import { User, Mail, Tag, Camera, Save, Loader2, ChevronLeft, Scale, Ruler } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, setUser, setLoading: setGlobalLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF5-3YjBcXTqKUlOAeUUtuOLKgQSma2wGG1g&s";

  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    avatar: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
    gender: '',
    provider: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '',
        age: user.age ?? '',
        height: user.height ?? '',
        weight: user.weight ?? '',
        goal: user.goal ?? '',
        gender: user.gender ?? '',
        provider: user.provider ?? 'local',
      });
      setLoading(false);
    }
  }, [user]);

  const getAvatarUrl = (avatar) => {
    if (!avatar || avatar === 'null') return defaultAvatar;
    if (avatar.startsWith('http')) return avatar;
    return `${API_URL}/${avatar}`;
  };

  const renderProviderIcon = (provider) => {
    const p = provider?.toLowerCase();
    if (p === 'google') {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    }
    if (p === 'facebook') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    }
    return <User size={14} className="text-blue-600" />;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error("Vui lòng chọn định dạng ảnh.");
    
    setUploading(true);
    setGlobalLoading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const { data } = await authApi.uploadAvatar(user.id, uploadData);
      const newAvatar = `${data.avatarUrl || data.avatar}?t=${new Date().getTime()}`;
      setUser({ ...user, avatar: newAvatar });
      setFormData(prev => ({ ...prev, avatar: newAvatar }));
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên.");
    } finally {
      setUploading(false);
      setGlobalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading("Đang lưu...");

    try {
      const { data } = await authApi.updateProfile(user.id, {
        ...formData,
        age: formData.age ? Number(formData.age) : null,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
      });
      setUser(data);
      setIsEditing(false);
      toast.success("Cập nhật thành công!", { id: loadingToast });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi hệ thống", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const isSocialUser = formData.provider !== 'local';
  const isFacebook = formData.provider?.toLowerCase() === 'facebook';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute -bottom-16 left-10 flex items-end gap-6">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-3xl border-8 border-white shadow-xl overflow-hidden bg-gray-100 transition-transform duration-500 group-hover:scale-105 ${uploading ? 'opacity-50' : ''}`}>
                  <img 
                    src={getAvatarUrl(formData.avatar)}
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                    onError={(e) => { e.target.src = defaultAvatar }}
                  />
                </div>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                  <Camera size={24} />
                  <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                </label>
              </div>

              <div className="mb-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3 transition-all hover:bg-white">
                <div className="flex items-center justify-center w-7 h-7 bg-white rounded-xl shadow-sm border border-gray-50">
                  {renderProviderIcon(formData.provider)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase text-blue-600 leading-none">
                    {formData.provider} account
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-24 p-10">
            <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter italic">My Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><User size={14}/> Full Name</label>
                  <input disabled={!isEditing} value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60" />
                </div>
                  <input 
                    disabled={true} 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    className={`w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none transition-all disabled:opacity-60 ${isFacebook && isEditing ? 'cursor-not-allowed italic text-gray-400' : 'focus:border-blue-400 focus:bg-white'}`} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">Age</label>
                  <input type="number" disabled={!isEditing} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Ruler size={14}/> Height (cm)</label>
                  <input type="number" disabled={!isEditing} value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Scale size={14}/> Weight (kg)</label>
                  <input type="number" disabled={!isEditing} value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Goal</label>
                  <select disabled={!isEditing} value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60 appearance-none">
                    <option value="">Select goal</option>
                    <option value="lose_weight">Lose Weight</option>
                    <option value="gain_muscle">Gain Muscle</option>
                    <option value="maintain">Maintain</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Gender</label>
                  <select disabled={!isEditing} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60 appearance-none">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Mail size={14}/> Email Address</label>
                {isSocialUser && isEditing && (
                  <p className="text-[10px] text-amber-600 font-bold tracking-tight italic">* Email linked to {formData.provider} account cannot be changed.</p>
                )}
                <input 
                  disabled={!isEditing || isSocialUser} 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none disabled:opacity-60 ${isSocialUser && isEditing ? 'cursor-not-allowed italic text-gray-400' : 'focus:border-blue-400 focus:bg-white'}`} 
                />
                
              </div>

              <div className="flex gap-4 pt-6">
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-blue-600 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs">
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-all uppercase tracking-widest text-xs">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs">
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}