import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useAuth(); // Giả sử hàm này dùng để lưu user/token vào state

  useEffect(() => {
    // 1. Lấy đúng key từ URL (Phải khớp với res.redirect ở Backend)
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      // 2. Lưu vào LocalStorage để duy trì phiên đăng nhập khi F5
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 3. Cập nhật vào AuthContext để UI thay đổi ngay lập tức (ẩn nút Login, hiện Avatar)
      if (setAuthData) {
        setAuthData({ accessToken, refreshToken, isAuthenticated: true });
      }
      console.log('Authentication successful!');
      
      // 4. Điều hướng về Dashboard
      navigate('/dashboard');
    } else {
      // Nếu thiếu token, coi như lỗi
      console.error('Token not found in URL');
      navigate('/login?error=auth_failed');
    }
  }, [location, navigate, setAuthData]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="font-bold uppercase tracking-widest text-xs">
        Verifying Google account...
      </p>
    </div>
  );
}