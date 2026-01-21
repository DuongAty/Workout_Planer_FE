import { Routes, Route, Navigate } from 'react-router-dom';
import { HashRouter as Router } from 'react-router-dom';
import Navbar from './components/layouts/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './page/Dashboard';
import WorkoutDetail from './page/WorkoutDetail';
import Login from './page/Login';
import Register from './page/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './page/LandingPage';
import GoogleCallback from './page/GoogleCallback';
import ExerciseTracking from './components/ExerciseTracking';
import BodyMeasurements from './page/BodyMeasurements';
import { Toaster } from 'react-hot-toast';

// Component phụ trợ để quyết định trang chủ hiển thị gì
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? <Dashboard /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            {/* Route trang chủ: Tự điều hướng dựa trên auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/tracking/:exerciseId" element={<ExerciseTracking />} />
            <Route path="/measurements" element={<BodyMeasurements />} />
            {/* Các trang yêu cầu bảo mật */}
            <Route 
              path="/workout/:id" 
              element={
                <ProtectedRoute>
                  <WorkoutDetail />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}