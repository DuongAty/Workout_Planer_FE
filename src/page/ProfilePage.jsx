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

  const getAvatarUrl = (avatar) => {
    if (!avatar || avatar === 'null') return defaultAvatar;
    if (avatar.startsWith('http')) return avatar;
    return `${API_URL}/${avatar}`;
  };

  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    avatar: '',
    age: '',
    height: '',
    weight: '',
    goal: '',    // enum value as string
    gender: '',  // enum value as string
    provider: '',
    providerId: ''
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
        provider: user.provider ?? '',
        providerId: user.providerId ?? ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast.error("Please select the image format (jpg, png...)");
    }
    const loadingToast = toast.loading("Loading images...");
    setUploading(true);
    setGlobalLoading(true);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const { data } = await authApi.uploadAvatar(user.id, uploadData);
      const rawAvatar = data.avatarUrl || data.avatar;
      const newAvatarWithCacheBuster = `${rawAvatar}?t=${new Date().getTime()}`;
      if (typeof setUser === 'function') {
        setUser({ ...user, avatar: newAvatarWithCacheBuster });
      }
      setFormData(prev => ({ ...prev, avatar: newAvatarWithCacheBuster }));
      toast.success("Update successful!", { id: loadingToast });
    } catch (error) {
      console.error("Upload error:", error.response?.data);
      toast.error(error.response?.data?.message || "Error uploading image", { id: loadingToast });
    } finally {
      setUploading(false);
      setGlobalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading("Saving...");

    const updatePayload = {
      fullname: formData.fullname,
      username: formData.username,
      email: formData.email,
      avatar: formData.avatar,
      age: formData.age !== '' ? Number(formData.age) : null,
      height: formData.height !== '' ? Number(formData.height) : null,
      weight: formData.weight !== '' ? Number(formData.weight) : null,
      goal: formData.goal || null,
      gender: formData.gender || null
      // provider and providerId typically shouldn't be changed from profile form
    };

    try {
      const { data } = await authApi.updateProfile(user.id, updatePayload);
      if (typeof setUser === 'function') {
        setUser(data);
      }
      setIsEditing(false);
      toast.success("Update successful!", { id: loadingToast });
    } catch (error) {
      toast.error(error?.response?.data?.message || "System update error", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const isGoogleUser = user?.provider === 'google';
  const isSocialUser = user?.provider && user.provider !== 'local';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute -bottom-16 left-10">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-3xl border-8 border-white shadow-lg overflow-hidden bg-gray-100 ${uploading ? 'opacity-50' : ''}`}>
                  <img 
                    src={getAvatarUrl(formData?.avatar)}
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
            </div>
          </div>

          <div className="pt-20 p-10">
            <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter">My Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><User size={14}/> Full Name</label>
                  <input disabled={!isEditing} value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Tag size={14}/> Username</label>
                  <input disabled={!isEditing} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">Age</label>
                  <input type="number" disabled={!isEditing} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60" placeholder="e.g. 30" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Ruler size={14}/> Height (cm)</label>
                  <input type="number" disabled={!isEditing} value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60" placeholder="e.g. 175" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Scale size={14}/> Weight (kg)</label>
                  <input type="number" disabled={!isEditing} value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60" placeholder="e.g. 70" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Goal</label>
                  <select disabled={!isEditing} value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60">
                    <option value="">Select goal</option>
                    <option value="maintain">Maintain</option>
                    <option value="lose_weight">Lose Weight</option>
                    <option value="gain_muscle">Gain Muscle</option>
                    {/* Thay các option trên bằng enum thực tế nếu có */}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Gender</label>
                  <select disabled={!isEditing} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    {/* Thay bằng enum Gender thực tế nếu có */}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Mail size={14}/> Email Address</label>
                <input 
                  disabled={!isEditing || isSocialUser} 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className={`w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:border-blue-400 disabled:opacity-60 ${isSocialUser && isEditing ? 'cursor-not-allowed bg-yellow-50' : ''}`} 
                />
                {isSocialUser && isEditing && (
                  <p className="text-[10px] text-amber-600 font-bold italic">* Email linked to {formData.provider} account cannot be changed.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Provider</label>
                <input disabled value={formData.provider} className="w-full bg-gray-100 border p-3 rounded-2xl outline-none text-sm" />
              </div>

              <div className="flex gap-4 pt-4">
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">Edit Profile</button>
                ) : (
                  <>
                    <button type="button" onClick={() => { setIsEditing(false); setFormData(prev => ({ ...prev, fullname: user.fullname || '', username: user.username || '', email: user.email || '', avatar: user.avatar || '', age: user.age ?? '', height: user.height ?? '', weight: user.weight ?? '', goal: user.goal ?? '', gender: user.gender ?? '' })); }} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold text-gray-600">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg flex justify-center items-center gap-2">
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
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
