import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Trong khi đang kiểm tra token (getMe), hiển thị màn hình chờ
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng về trang Login
  // Đồng thời lưu lại trang hiện tại (location) để sau khi login xong có thể quay lại trang đó
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập vào component con
  return children;
};

export default ProtectedRoute;