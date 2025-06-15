import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role?.role_name && !allowedRoles.includes(user.role.role_name)) {
    console.log(`ProtectedRoute: User role ${user.role.role_name} not allowed, redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}