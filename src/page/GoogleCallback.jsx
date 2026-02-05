import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const called = useRef(false);

  useEffect(() => {
  const code = searchParams.get('code');
  const hasToken = localStorage.getItem('accessToken');
  if (hasToken) {
    navigate('/dashboard', { replace: true });
    return;
  }
  if (code && !called.current) {
    called.current = true;
   const verifyGoogle = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google`, { code });
    const result = res.data.data || res.data; 
    const { accessToken, refreshToken } = result;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (login) login({ accessToken, refreshToken });
      window.location.href = '/dashboard'; 
    }
  } catch (error) {
    console.error('Lỗi API:', error.response?.data);
    navigate('/login');
  }
};
    verifyGoogle();
  }
}, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
       <h2 className="animate-pulse">AUTHENTICATING...</h2>
    </div>
  );
}