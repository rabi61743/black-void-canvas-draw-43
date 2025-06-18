
import React from 'react';
import { WifiOff } from "lucide-react";

export const OfflineAlert = () => {
  return (
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
  );
};
