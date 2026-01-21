import { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext();

// src/context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm này gọi API GET /api/v1/auth/me
  const fetchMe = async () => {
    try {
      const res = await authApi.getMe();
      // res.data sẽ có cấu trúc { fullname: "...", username: "..." }
      setUser(res.data);
      return res.data;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    // Lưu token nhận được từ response
    const { accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // QUAN TRỌNG: Gọi fetchMe ngay lập tức sau khi có token
    return await fetchMe(); 
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // Kiểm tra token khi F5 trang
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) fetchMe().finally(() => setLoading(false));
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);