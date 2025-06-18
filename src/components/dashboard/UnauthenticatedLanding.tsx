
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wifi, CheckCircle, TrendingUp, Clock } from "lucide-react";

export const UnauthenticatedLanding = () => {
  const navigate = useNavigate();

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
};
