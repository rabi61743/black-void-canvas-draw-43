
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, MessageSquare, UserPlus, FolderOpen } from "lucide-react";

interface User {
  role?: {
    role_name?: string;
  };
}

interface NavigationCardsProps {
  user: User | null;
  isOfflineMode: boolean;
}

export const NavigationCards = ({ user, isOfflineMode }: NavigationCardsProps) => {
  const navigate = useNavigate();

  return (
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
  );
};
