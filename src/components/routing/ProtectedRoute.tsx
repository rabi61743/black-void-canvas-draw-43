
import { Navigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role?.role_name && !allowedRoles.includes(user.role.role_name)) {
    console.log(`ProtectedRoute: User role ${user.role.role_name} not allowed, redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
