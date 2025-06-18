
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Wifi, WifiOff, FileText, Users, MessageSquare, UserPlus, FolderOpen, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, connectionError, isOfflineMode } = useAuth();

  console.log("Index page - Auth state:", { user, isAuthenticated, loading, connectionError, isOfflineMode });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="text-lg ml-3">Loading...</div>
      </div>
    );
  }

  // Show connection error state
  if (connectionError) {
    return (
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
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto p-8 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
                <Wifi className="h-20 w-20 text-blue-600 relative z-10" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to the Procurement Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your procurement processes with our comprehensive management system. 
              Access tenders, manage committees, and track procurement plans efficiently.
            </p>
            <div className="flex justify-center space-x-4 mb-12">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <TrendingUp className="h-5 w-5" />
                <span>Efficient</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <Clock className="h-5 w-5" />
                <span>Real-time</span>
              </div>
            </div>
            <Button onClick={() => navigate("/login")} size="lg" className="px-8 py-3 text-lg">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-block px-4 py-2 mb-4 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
          Dashboard Overview
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Welcome to the Procurement Portal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your procurement processes efficiently with our comprehensive dashboard
        </p>
      </div>
      
      {/* User Info Card */}
      {user && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user.email ? user.email.charAt(0).toUpperCase() : user.employeeId.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-semibold text-gray-900">{user.email || user.employeeId}</p>
                <p className="text-sm text-blue-600 font-medium">{user.role?.role_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Alert */}
      {isOfflineMode && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Offline Mode</p>
                <p className="text-yellow-700 text-sm">Some features may be limited while the server is unavailable.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Procurement Plan</h2>
          </div>
          <p className="text-gray-600 mb-6">Create and track procurement plans with detailed timelines and requirements.</p>
          <Button 
            onClick={() => navigate("/procurement-plan")} 
            disabled={isOfflineMode}
            className="w-full group-hover:bg-green-600 transition-colors"
          >
            Manage Plans
          </Button>
        </div>

        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Tenders</h2>
          </div>
          <p className="text-gray-600 mb-6">Browse, create, and manage all tender processes from initiation to completion.</p>
          <Button 
            onClick={() => navigate("/tenders")} 
            disabled={isOfflineMode}
            variant="outline"
            className="w-full group-hover:border-blue-600 group-hover:text-blue-600 transition-colors"
          >
            View Tenders
          </Button>
        </div>

        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Committees</h2>
          </div>
          <p className="text-gray-600 mb-6">Create evaluation committees and manage member assignments efficiently.</p>
          <Button 
            onClick={() => navigate("/committee")} 
            disabled={isOfflineMode}
            variant="outline"
            className="w-full group-hover:border-purple-600 group-hover:text-purple-600 transition-colors"
          >
            Manage Committees
          </Button>
        </div>

        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">External Agency</h2>
          </div>
          <p className="text-gray-600 mb-6">Submit and track complaints and communications with external agencies.</p>
          <Button 
            onClick={() => navigate("/complaints")} 
            disabled={isOfflineMode}
            variant="outline"
            className="w-full group-hover:border-orange-600 group-hover:text-orange-600 transition-colors"
          >
            View Complaints
          </Button>
        </div>

        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
          </div>
          <p className="text-gray-600 mb-6">View and manage employee information and organizational structure.</p>
          <Button 
            onClick={() => navigate("/employee-details")} 
            disabled={isOfflineMode}
            variant="outline"
            className="w-full group-hover:border-indigo-600 group-hover:text-indigo-600 transition-colors"
          >
            View Employees
          </Button>
        </div>

        {/* Show only if user is SUPERADMIN */}
        {user?.role?.role_name === "Superadmin" && (
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <UserPlus className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Create User</h2>
            </div>
            <p className="text-gray-600 mb-6">Register new users and assign roles within the procurement system.</p>
            <Button 
              onClick={() => navigate("/create-user")} 
              disabled={isOfflineMode}
              variant="outline"
              className="w-full group-hover:border-red-600 group-hover:text-red-600 transition-colors"
            >
              Register User
            </Button>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="text-center pt-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-500 text-sm">
            Need help? Contact your system administrator or refer to the user documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
