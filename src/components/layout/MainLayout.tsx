
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
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-white">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-2 font-semibold text-gray-900">
              Procurement Portal
            </div>
          </header>
          <main className="flex-1 min-w-0 bg-gray-50 p-6 overflow-y-auto">
            <div className="h-full w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
