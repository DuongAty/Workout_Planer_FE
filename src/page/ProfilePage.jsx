import React, { useState, useEffect } from 'react';
import { User, Mail, Tag, Camera, Save, Loader2, ChevronLeft, Scale, Ruler, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';

export default function ProfilePage() {
  const { user, setUser, setLoading: setGlobalLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF5-3YjBcXTqKUlOAeUUtuOLKgQSma2wGG1g&s";

  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', avatar: '', age: '', height: '', weight: '', goal: '', gender: '', provider: '',
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

  const isSocialUser = formData.provider !== 'local';
  const isFirstTimePassword = isSocialUser && !user?.password;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setGlobalLoading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const { data } = await authApi.uploadAvatar(user.id, uploadData);
      const newAvatar = `${data.avatarUrl || data.avatar}?t=${new Date().getTime()}`;
      setUser({ ...user, avatar: newAvatar });
      setFormData(prev => ({ ...prev, avatar: newAvatar }));
      toast.success("Avatar updated!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setGlobalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading("Saving...");
    try {
      const { data } = await authApi.updateProfile(user.id, {
        ...formData,
        age: formData.age ? Number(formData.age) : null,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
      });
      setUser(data);
      setIsEditing(false);
      toast.success("Profile updated!", { id: loadingToast });
    } catch (error) {
      toast.error("Update failed", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 italic font-sans">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium transition-colors not-italic">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute -bottom-16 left-10 flex items-end gap-6">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-3xl border-8 border-white shadow-xl overflow-hidden bg-gray-100 transition-transform duration-500 group-hover:scale-105 ${uploading ? 'opacity-50' : ''}`}>
                  <img 
                    src={formData.avatar?.startsWith('http') ? formData.avatar : `${API_URL}/${formData.avatar}`} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                    onError={(e) => { e.target.src = defaultAvatar }} 
                  />
                </div>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                  <Camera size={24} />
                  <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="mb-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3">
                <span className="text-[11px] font-black uppercase text-blue-600 leading-none not-italic">{formData.provider} account</span>
              </div>
            </div>
          </div>

          <div className="pt-24 p-10">
            <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter italic">My Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 not-italic"><User size={14}/> Full Name</label>
                  <input disabled={!isEditing} value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 not-italic"><Tag size={14}/> Username</label>
                  <input disabled={true} value={formData.username} className="w-full bg-gray-200 border border-gray-100 p-4 rounded-2xl outline-none opacity-60 italic text-gray-500 cursor-not-allowed" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest not-italic">Age</label>
                  <input type="number" disabled={!isEditing} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 not-italic"><Ruler size={14}/> Height (cm)</label>
                  <input type="number" disabled={!isEditing} value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 not-italic"><Scale size={14}/> Weight (kg)</label>
                  <input type="number" disabled={!isEditing} value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest not-italic">Goal</label>
                  <select disabled={!isEditing} value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all disabled:opacity-60 appearance-none">
                    <option value="">Select goal</option>
                    <option value="lose_weight">Lose Weight</option>
                    <option value="gain_muscle">Gain Muscle</option>
                    <option value="maintain">Maintain</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 not-italic"><Mail size={14}/> Email Address</label>
                <input disabled={!isEditing || isSocialUser} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none transition-all disabled:opacity-60 ${isSocialUser && isEditing ? 'italic text-gray-400' : ''}`} />
              </div>

              {/* SECURITY SECTION */}
              <div className="pt-4 border-t border-gray-100 mt-8">
                <div className="flex items-center justify-between bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1 not-italic">Account Security</h4>
                      <p className="text-[10px] text-gray-500 font-medium italic">Update your password to stay safe.</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsPassModalOpen(true)} 
                    className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-md not-italic
                      ${isFirstTimePassword ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200" : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-gray-100"}`}
                  >
                    {isFirstTimePassword ? "Setup First Password" : "Change Password"}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-blue-600 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs not-italic">
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-all uppercase tracking-widest text-xs not-italic">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs not-italic">
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPassModalOpen} 
        onClose={() => setIsPassModalOpen(false)} 
        isFirstTime={isFirstTimePassword} 
        userId={user?.id} 
      />
    </div>
  );
}