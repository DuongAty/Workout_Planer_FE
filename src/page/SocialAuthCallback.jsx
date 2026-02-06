// src/page/SocialAuthCallback.jsx
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
          const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/${provider}` || `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google`, { code });
          const { accessToken, refreshToken } = res.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          if (login) login({ accessToken, refreshToken });
          window.location.href = '/dashboard'; 
        } catch (error) {
          console.error(`${provider} Auth Failed`, error);
          navigate('/login');
        }
      };
      verify();
    }
  }, [searchParams, location, navigate, login]);

  return <div>Authenticating... Please wait</div>;
}