import { Routes, Route, Navigate } from "react-router";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Profile from "../pages/Profile";
import Students from "../pages/Students";
import StudentImportPreview from "../pages/StudentImportPreview";
import Officers from "../pages/Officers";
import Grievances from "../pages/Grievances";
import GrievanceDetail from "../pages/GrievanceDetail";
import NotFound from "../pages/NotFound";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard Layout with Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route
          path="/students/import-preview"
          element={<StudentImportPreview />}
        />
        <Route path="/officers" element={<Officers />} />
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/grievances/:id" element={<GrievanceDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
