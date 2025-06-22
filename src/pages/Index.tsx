
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { OfflineAlert } from "@/components/dashboard/OfflineAlert";
import { NavigationCards } from "@/components/dashboard/NavigationCards";
import { ConnectionError } from "@/components/dashboard/ConnectionError";
import { UnauthenticatedLanding } from "@/components/dashboard/UnauthenticatedLanding";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

export default function Index() {
  const { user, isAuthenticated, loading, connectionError, isOfflineMode } = useAuth();

  console.log("Index page - Auth state:", { user, isAuthenticated, loading, connectionError, isOfflineMode });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="text-lg ml-3">Loading...</div>
      </div>
    );
  }

  if (connectionError) {
    return <ConnectionError />;
  }

  if (!isAuthenticated) {
    return <UnauthenticatedLanding />;
  }

  return (
    <div className="enterprise-dashboard">
      <WelcomeHeader />
      
      {user && <UserInfoCard user={user} />}

      {isOfflineMode && <OfflineAlert />}

      <NavigationCards user={user} isOfflineMode={isOfflineMode} />

      <DashboardFooter />
    </div>
  );
}
