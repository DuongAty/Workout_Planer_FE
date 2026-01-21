import React from 'react';
import { X } from 'lucide-react';

export default function VideoModal({ isOpen, videoUrl, onClose }) {
  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
        
        {/* Nút đóng */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/30 text-white rounded-full transition-all backdrop-blur-md"
        >
          <X size={24} />
        </button>

        {/* Player */}
        <div className="aspect-video w-full flex items-center justify-center bg-black">
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          >
            Your browser does not support video tags.
          </video>
        </div>
      </div>
    </div>
  );
}