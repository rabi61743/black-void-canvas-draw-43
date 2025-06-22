
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
    <div className="enterprise-user-info">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user.email ? user.email.charAt(0).toUpperCase() : user.employeeId.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{user.email || user.employeeId}</p>
          <p className="text-sm text-blue-600">{user.role?.role_name || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};
