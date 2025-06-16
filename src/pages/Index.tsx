
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  console.log("Index page - Auth state:", { user, isAuthenticated, loading });

  if (loading) {
    return (
      <div className="container mx-auto p-8 mt-16">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6">Welcome to the Procurement Portal</h1>
        <p className="text-gray-600 mb-4">Please log in to access the system.</p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 mt-16">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Procurement Portal</h1>
      
      {user && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Logged in as: <span className="font-semibold">{user.email || user.employeeId}</span></p>
          <p className="text-sm text-gray-600">Role: <span className="font-semibold">{user.role?.role_name || 'N/A'}</span></p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Manage Procurement Plan</h2>
          <p className="text-gray-600 mb-4">Create and track plans.</p>
          <Button onClick={() => navigate("/procurement-plan")}>Go to Procurement Plan</Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">View Tenders</h2>
          <p className="text-gray-600 mb-4">Browse and manage all tenders.</p>
          <Button onClick={() => navigate("/tenders")}>Go to Tenders</Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Manage Committees</h2>
          <p className="text-gray-600 mb-4">Create or view committees.</p>
          <Button onClick={() => navigate("/committee")}>Go to Committee</Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">External Agency</h2>
          <p className="text-gray-600 mb-4">Submit and track complaints.</p>
          <Button onClick={() => navigate("/complaints")}>Go to External Agency</Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">View Employees</h2>
          <p className="text-gray-600 mb-4">View All Employees.</p>
          <Button onClick={() => navigate("/employee-details")}>Go to Employee</Button>
        </div>

        {/* Show only if user is SUPERADMIN */}
        {user?.role?.role_name === "Superadmin" && (
          <div className="border p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Create User</h2>
            <p className="text-gray-600 mb-4">Register a new user in the system.</p>
            <Button onClick={() => navigate("/create-user")}>Go to Register</Button>
          </div>
        )}
      </div>
    </div>
  );
}
