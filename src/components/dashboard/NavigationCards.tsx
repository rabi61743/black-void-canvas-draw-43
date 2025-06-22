
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
    <div className="enterprise-nav-grid">
      <div className="enterprise-nav-card group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Procurement Plan</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Create and track procurement plans with detailed timelines.</p>
        <Button 
          onClick={() => navigate("/procurement-plan")} 
          disabled={isOfflineMode}
          className="w-full"
          size="sm"
        >
          Manage Plans
        </Button>
      </div>

      <div className="enterprise-nav-card group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <FolderOpen className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Tenders</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Browse and manage all tender processes from initiation to completion.</p>
        <Button 
          onClick={() => navigate("/tenders")} 
          disabled={isOfflineMode}
          variant="outline"
          className="w-full"
          size="sm"
        >
          View Tenders
        </Button>
      </div>

      <div className="enterprise-nav-card group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Committees</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Create evaluation committees and manage member assignments.</p>
        <Button 
          onClick={() => navigate("/committee")} 
          disabled={isOfflineMode}
          variant="outline"
          className="w-full"
          size="sm"
        >
          Manage Committees
        </Button>
      </div>

      <div className="enterprise-nav-card group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <MessageSquare className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">External Agency</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Submit and track communications with external agencies.</p>
        <Button 
          onClick={() => navigate("/complaints")} 
          disabled={isOfflineMode}
          variant="outline"
          className="w-full"
          size="sm"
        >
          View Complaints
        </Button>
      </div>

      <div className="enterprise-nav-card group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Employees</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">View and manage employee information and organizational structure.</p>
        <Button 
          onClick={() => navigate("/employee-details")} 
          disabled={isOfflineMode}
          variant="outline"
          className="w-full"
          size="sm"
        >
          View Employees
        </Button>
      </div>

      {user?.role?.role_name === "Superadmin" && (
        <div className="enterprise-nav-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <UserPlus className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Create User</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Register new users and assign roles within the system.</p>
          <Button 
            onClick={() => navigate("/create-user")} 
            disabled={isOfflineMode}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Register User
          </Button>
        </div>
      )}
    </div>
  );
};
