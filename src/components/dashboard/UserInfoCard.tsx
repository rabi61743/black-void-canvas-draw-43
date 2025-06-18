
import React from 'react';

interface User {
  email?: string;
  employeeId: string;
  role?: {
    role_name?: string;
  };
}

interface UserInfoCardProps {
  user: User;
}

export const UserInfoCard = ({ user }: UserInfoCardProps) => {
  return (
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
  );
};
