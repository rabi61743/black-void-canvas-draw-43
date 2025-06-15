import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth(); // get logged-in user info

  return (
    <div className="container mx-auto p-8 mt-16">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Procurement Portal</h1>

      
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
        {user?.role?.role_name === "SUPERADMIN" && (
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



