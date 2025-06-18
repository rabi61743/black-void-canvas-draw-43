
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, WifiOff } from "lucide-react";

export const ConnectionError = () => {
  const navigate = useNavigate();

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
};
