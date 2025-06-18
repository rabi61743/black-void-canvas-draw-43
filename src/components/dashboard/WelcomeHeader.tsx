
import React from 'react';

export const WelcomeHeader = () => {
  return (
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
  );
};
