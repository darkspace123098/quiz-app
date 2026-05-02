import { Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider, useAdmin } from "./admin/context/AdminContext";
import { AdminLayout } from "./admin/components/AdminLayout";
import { AdminLogin } from "./admin/screens/AdminLogin";
import { Overview } from "./admin/screens/Overview";
import { Contestants } from "./admin/screens/Contestants";
import { Questions } from "./admin/screens/Questions";
import { Results } from "./admin/screens/Results";
import { Recordings } from "./admin/screens/Recordings";
import { Classes } from "./admin/screens/Classes";
import { AddAdmin } from "./admin/screens/AddAdmin";
import StudentApp from "./StudentApp";

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAdmin();

  if (loading) return null; // Or a loading spinner

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAdmin();

  if (loading) return null;

  if (admin?.role !== "superadmin") {
    return <Navigate to="/admin/overview" replace />;
  }

  return <>{children}</>;
};

export default function AppRouter() {
  return (
    <AdminProvider>
      <Routes>
        {/* Student Routes */}
        <Route path="/*" element={<StudentApp />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route 
          path="/admin/overview" 
          element={<ProtectedAdminRoute><Overview /></ProtectedAdminRoute>} 
        />
        <Route 
          path="/admin/contestants" 
          element={<ProtectedAdminRoute><Contestants /></ProtectedAdminRoute>} 
        />
        <Route 
          path="/admin/questions" 
          element={<ProtectedAdminRoute><Questions /></ProtectedAdminRoute>} 
        />
        <Route 
          path="/admin/results" 
          element={<ProtectedAdminRoute><Results /></ProtectedAdminRoute>} 
        />
        <Route 
          path="/admin/recordings" 
          element={<ProtectedAdminRoute><Recordings /></ProtectedAdminRoute>} 
        />
        <Route 
          path="/admin/classes" 
          element={
            <ProtectedAdminRoute>
              <SuperAdminRoute><Classes /></SuperAdminRoute>
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/add" 
          element={
            <ProtectedAdminRoute>
              <SuperAdminRoute><AddAdmin /></SuperAdminRoute>
            </ProtectedAdminRoute>
          } 
        />

        {/* Redirect /admin to /admin/overview */}
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
      </Routes>
    </AdminProvider>
  );
}
