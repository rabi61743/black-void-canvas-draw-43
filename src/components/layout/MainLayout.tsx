
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

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
      <div className="min-h-screen flex w-full relative">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-6 shadow-sm sticky top-0 z-50">
            <SidebarTrigger className="h-8 w-8 hover:bg-gray-100 rounded-md transition-colors" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-800">Procurement Portal</h1>
            </div>
          </header>
          <main className="flex-1 p-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
