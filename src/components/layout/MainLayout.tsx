
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import './LayoutStyles.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="sidebar-layout">
        <AppSidebar />
        <div className="main-content-offset">
          <header className="enterprise-header-bar">
            <SidebarTrigger className="h-8 w-8 hover:bg-gray-100 rounded-md transition-colors md:hidden" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-800">Procurement Portal</h1>
            </div>
          </header>
          <main className="enterprise-main-content">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
