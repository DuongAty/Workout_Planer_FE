// src/components/Navbar.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react'; // Thêm icon để đẹp hơn

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Ảnh mặc định nếu avatar của user là null
  const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
      <Link to="/" className="text-xl font-black text-blue-600 tracking-tighter uppercase">
        WORKOUT PLANNER
      </Link>

      <div className="flex items-center gap-4">
        
        {user ? (
          <div className="flex items-center gap-3 bg-gray-50 pl-2 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
            {/* KHỐI HIỂN THỊ AVATAR */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200 flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = defaultAvatar }} 
                />
              ) : (
                <UserIcon size={20} className="text-gray-400" />
              )}
            </div>

            {/* Thông tin User */}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-gray-800 leading-none">
                {user.fullname || user.username}
              </p>
              <p className="text-[10px] text-gray-400 font-bold">
                @{user.username}
              </p>
            </div>

            {/* Nút Đăng xuất dạng Icon */}
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">
              Login
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition">
              START
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}