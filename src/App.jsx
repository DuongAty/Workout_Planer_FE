import { Routes, Route, Navigate } from 'react-router-dom';
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
import ProfilePage from './page/ProfilePage';
import CaloriePage from './page/CaloriePage';

// Component bao bọc Layout chính (Có Navbar và Container)
const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="container mx-auto py-6 px-4">
      {children}
    </main>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        {/* NHÓM 1: Các trang FULL SCREEN (Không có Navbar/Container) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout><Dashboard /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workout/:id" 
          element={
            <ProtectedRoute>
              <MainLayout><WorkoutDetail /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tracking/:exerciseId" 
          element={
            <ProtectedRoute>
              <MainLayout><ExerciseTracking /></MainLayout>
            </ProtectedRoute>
          } 
        />
          <Route 
          path="/calories" 
          element={
            <ProtectedRoute>
              <MainLayout><CaloriePage
               /></MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="/profile/:userId"
        element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>}
        />
        <Route 
          path="/measurements" 
          element={
            <ProtectedRoute>
              <MainLayout><BodyMeasurements /></MainLayout>
            </ProtectedRoute>
          } 
        />
        {/* Điều hướng mặc định cho các route không tồn tại */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}