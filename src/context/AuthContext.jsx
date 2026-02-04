import { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      return res.data;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return await fetchMe(); 
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) fetchMe().finally(() => setLoading(false));
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);