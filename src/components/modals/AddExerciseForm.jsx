import { useState, useEffect, useRef } from 'react';
import { exerciseApi } from '../../api/endpoints';
import { Upload, X, Image as ImageIcon, Film, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddExerciseForm({ workoutId, onAdded, initialData }) {
  const muscleGroups = ["Ngực", "Lưng", "Vai", "Tay", "Chân", "Mông", "Bụng"];
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', muscleGroup: '', numberOfSets: 3, repetitions: 12, restTime: 60, duration: 300, note: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('video'); 
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        muscleGroup: initialData.muscleGroup || '',
        numberOfSets: initialData.numberOfSets || 0,
        repetitions: initialData.repetitions || 0,
        restTime: initialData.restTime || 0,
        duration: initialData.duration || 0,
        note: initialData.note || ''
      });
      if (initialData.videoUrl) {
        setMediaType('video');
        setPreviewUrl(initialData.videoUrl);
      } else if (initialData.thumbnailUrl) {
        setMediaType('thumbnail');
        setPreviewUrl(initialData.thumbnailUrl);
      }
    } else {
      setFormData({ name: '', muscleGroup: '', numberOfSets: 3, repetitions: 12, restTime: 60, duration: 300, note: '' });
      setPreviewUrl('');
      setMediaFile(null);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (mediaType === 'video' && !file.type.startsWith('video/')) {
        toast.error("Please select a video file!");
        return;
      }
      if (mediaType === 'thumbnail' && !file.type.startsWith('image/')) {
        toast.error("Please select a image file!");
        return;
      }
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      numberOfSets: Number(formData.numberOfSets),
      repetitions: Number(formData.repetitions),
      restTime: Number(formData.restTime),
      duration: Number(formData.duration)
    };

    try {
      let exerciseId = initialData?.id;
      if (initialData) {
        await exerciseApi.update(initialData.id, payload);
      } else {
        const res = await exerciseApi.create(workoutId, payload);
        exerciseId = res?.id || res?.data?.id || res?.data?.data?.id; 
        if (!exerciseId) {
          throw new Error("Unable to retrieve Exercise ID from the server!");
        }
      }
      if (mediaFile && exerciseId) {
        await exerciseApi.uploadMedia(exerciseId, mediaFile, mediaType);
      }
      toast.success(initialData ? "Update successful!" : "Successful added exercise!");
      if (onAdded) onAdded(); 
      
      if (!initialData) {
        setMediaFile(null);
        setPreviewUrl('');
        setFormData({ name: '', muscleGroup: '', numberOfSets: 3, repetitions: 12, restTime: 60, duration: 300, note: '' });
      }
    } catch (err) {
      console.error("Error details:", err);
      const errorMsg = err.response?.data?.message || err.message || "Data manipulation error!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 shadow-inner relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-[2.5rem]">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <span className="text-xs font-bold text-blue-600">Processing...</span>
          </div>
        </div>
      )}
      <h3 className="text-center font-black text-blue-800 uppercase text-xs tracking-[0.3em] mb-8">
        {initialData ? `Editing: ${initialData.name}` : 'Add new exercises to the schedule.'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-400 ml-2 mb-1 uppercase">Name Exercises</label>
              <input 
                required placeholder="VD: Bench Press"
                className="p-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-400 ml-2 mb-1 uppercase">Muscle Group</label>
              <select 
                required
                className="p-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 appearance-none"
                value={formData.muscleGroup}
                onChange={e => setFormData({...formData, muscleGroup: e.target.value})}
              >
                <option value="" disabled>-- Choose muscle group --</option>
                {muscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 mb-3 uppercase flex justify-between items-center">
                    <span>Attachments</span>
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        <button 
                            type="button"
                            onClick={() => { setMediaType('video'); setMediaFile(null); setPreviewUrl(''); }}
                            className={`p-1.5 rounded-md transition-all ${mediaType === 'video' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                        >
                            <Film size={14} />
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setMediaType('thumbnail'); setMediaFile(null); setPreviewUrl(''); }}
                            className={`p-1.5 rounded-md transition-all ${mediaType === 'thumbnail' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`}
                        >
                            <ImageIcon size={14} />
                        </button>
                    </div>
                </label>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept={mediaType === 'video' ? "video/*" : "image/*"}
                    onChange={handleFileChange}
                />
                {!previewUrl ? (
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all group"
                    >
                        <Upload size={20} className="text-gray-300 group-hover:text-blue-500 mb-2" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Upload {mediaType === 'video' ? 'Video' : 'Thumbnail'}
                        </span>
                    </div>
                ) : (
                    <div className="relative rounded-xl overflow-hidden bg-black group">
                        {mediaType === 'video' ? (
                            <video src={previewUrl} className="w-full h-32 object-cover opacity-90" controls />
                        ) : (
                            <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover opacity-90" />
                        )}
                        <button 
                            type="button"
                            onClick={() => { setMediaFile(null); setPreviewUrl(''); }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 ml-2 mb-1 uppercase">Sets</label>
                    <input type="number" min="0" className="w-full p-4 rounded-2xl border-none bg-white shadow-sm font-bold text-blue-600 outline-none"
                    value={formData.numberOfSets} onChange={e => setFormData({...formData, numberOfSets: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 ml-2 mb-1 uppercase">Reps</label>
                    <input type="number" min="0" className="w-full p-4 rounded-2xl border-none bg-white shadow-sm font-bold text-blue-600 outline-none"
                    value={formData.repetitions} onChange={e => setFormData({...formData, repetitions: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 ml-2 mb-1 uppercase">Rest (s)</label>
                    <input type="number" min="0" className="w-full p-4 rounded-2xl border-none bg-white shadow-sm font-bold text-blue-600 outline-none"
                    value={formData.restTime} onChange={e => setFormData({...formData, restTime: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 ml-2 mb-1 uppercase">Total (s)</label>
                    <input type="number" min="0" className="w-full p-4 rounded-2xl border-none bg-white shadow-sm font-bold text-blue-600 outline-none"
                    value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-400 ml-2 mb-1 uppercase">Note</label>
                <textarea 
                    placeholder="Technical notes..."
                    className="w-full p-4 rounded-2xl border-none bg-white shadow-sm h-[140px] focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                />
            </div>
        </div>
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className={`w-full mt-8 py-4 rounded-2xl font-black shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
          initialData ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
        } text-white disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {loading ? 'Processing...' : (initialData ? 'SAVE UPDATED INFORMATION' : 'CONFIRM ADDING EXERCISE')}
      </button>
    </form>
  );
}