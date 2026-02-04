import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <Link to="/" className="text-xl font-black text-blue-600 tracking-tighter uppercase">
        WORKOUT PLANNER
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 bg-gray-50 pl-2 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
            {/* SỬA TẠI ĐÂY: Dùng div thay vì p để tránh lỗi nested p và nhận onClick chuẩn hơn */}
            <div 
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="flex items-center gap-3 cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200 flex items-center justify-center group-hover:border-blue-400 transition-all">
                {user.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}/${user.avatar}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous" // THÊM DÒNG NÀY để xử lý lỗi CORS ảnh
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = defaultAvatar; 
                    }} 
                  />
                ) : (
                  <UserIcon size={20} className="text-gray-400" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                {/* Dùng div để không vi phạm quy tắc HTML */}
                <div className="text-xs font-black text-gray-800 leading-none group-hover:text-blue-600 transition-colors">
                  {user.fullname || user.username}
                </div>
                <div className="text-[10px] text-gray-400 font-bold">
                  @{user.username}
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                logout();
                navigate('/login');
              }}
              className="ml-2 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition">START</Link>
          </div>
        )}
      </div>
    </nav>
  );
}