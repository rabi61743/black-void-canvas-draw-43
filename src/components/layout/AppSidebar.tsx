
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  ClipboardList,
  Building,
  MessageSquare
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Procurement', path: '/procurement', icon: FileText },
  { name: 'Committees', path: '/committees', icon: Users },
  { name: 'Specifications', path: '/specifications', icon: ClipboardList },
  { name: 'Tenders', path: '/tenders', icon: Building },
  { name: 'Complaints', path: '/complaints', icon: MessageSquare },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
      </div>
      <nav className="mt-4">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
