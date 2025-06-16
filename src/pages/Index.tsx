
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, connectionError, isOfflineMode } = useAuth();

  console.log("Index page - Auth state:", { user, isAuthenticated, loading, connectionError, isOfflineMode });

  if (loading) {
    return (
      <div className="container mx-auto p-8 mt-16">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show connection error state
  if (connectionError) {
    return (
      <div className="container mx-auto p-8 mt-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <WifiOff className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-red-600">Connection Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h2 className="font-semibold text-red-800">Backend Server Unavailable</h2>
            </div>
            <p className="text-red-700 mb-4">
              Unable to connect to the backend server. This could be because:
            </p>
            <ul className="text-left text-red-700 space-y-1">
              <li>• The backend server is not running</li>
              <li>• There's a network connectivity issue</li>
              <li>• The server is experiencing technical difficulties</li>
            </ul>
          </div>
          
          {import.meta.env.DEV && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Development Mode:</strong> Make sure the backend server is running on port 8000
              </p>
            </div>
          )}
          
          <Button onClick={() => window.location.reload()} className="mr-4">
            Retry Connection
          </Button>
          <Button variant="outline" onClick={() => navigate("/login")}>
            Try Login Anyway
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 mt-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Wifi className="h-16 w-16 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold mb-6">Welcome to the Procurement Portal</h1>
          <p className="text-gray-600 mb-6">Please log in to access the system.</p>
          <Button onClick={() => navigate("/login")} size="lg">Go to Login</Button>
        </div>
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

      {isOfflineMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 font-medium">Offline Mode</p>
          </div>
          <p className="text-yellow-700 text-sm">Some features may be limited while the server is unavailable.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Manage Procurement Plan</h2>
          <p className="text-gray-600 mb-4">Create and track plans.</p>
          <Button onClick={() => navigate("/procurement-plan")} disabled={isOfflineMode}>
            Go to Procurement Plan
          </Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">View Tenders</h2>
          <p className="text-gray-600 mb-4">Browse and manage all tenders.</p>
          <Button onClick={() => navigate("/tenders")} disabled={isOfflineMode}>
            Go to Tenders
          </Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Manage Committees</h2>
          <p className="text-gray-600 mb-4">Create or view committees.</p>
          <Button onClick={() => navigate("/committee")} disabled={isOfflineMode}>
            Go to Committee
          </Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">External Agency</h2>
          <p className="text-gray-600 mb-4">Submit and track complaints.</p>
          <Button onClick={() => navigate("/complaints")} disabled={isOfflineMode}>
            Go to External Agency
          </Button>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">View Employees</h2>
          <p className="text-gray-600 mb-4">View All Employees.</p>
          <Button onClick={() => navigate("/employee-details")} disabled={isOfflineMode}>
            Go to Employee
          </Button>
        </div>

        {/* Show only if user is SUPERADMIN */}
        {user?.role?.role_name === "Superadmin" && (
          <div className="border p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Create User</h2>
            <p className="text-gray-600 mb-4">Register a new user in the system.</p>
            <Button onClick={() => navigate("/create-user")} disabled={isOfflineMode}>
              Go to Register
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
