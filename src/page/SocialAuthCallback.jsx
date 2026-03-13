// src/page/SocialAuthCallback.jsx
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function SocialAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = location.pathname.split('/')[2];

    if (code && !called.current) {
      called.current = true;
      
      const verify = async () => {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/${provider}`, { code });
          const { accessToken, refreshToken } = res.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          if (login) login({ accessToken, refreshToken });
          
          // Chuyển hướng về dashboard
          window.location.href = '/dashboard'; 
        } catch (error) {
          console.error(`${provider} Auth Failed`, error);
          navigate('/login');
        }
      };
      verify();
    }
  }, [searchParams, location, navigate, login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] font-sans relative overflow-hidden">
      {/* Background Decor đồng bộ trang Login */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Icon */}
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 animate-pulse">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>

        {/* Loading Spinner & Text */}
        <div className="bg-[#1e293b]/50 backdrop-blur-xl px-8 py-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <div className="text-center">
            <h2 className="text-white text-sm font-black uppercase tracking-[0.2em] italic">
              Authenticating
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Please wait a moment...
            </p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 text-center z-10">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">
          TD Fitness Secure Login
        </p>
      </div>
    </div>
  );
}