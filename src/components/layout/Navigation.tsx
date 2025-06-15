
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const isMobile = useIsMobile();

  // Navigation is now handled by the AppSidebar component
  // This component is kept for backward compatibility but doesn't render anything
  // The sidebar navigation is integrated into the App.tsx layout
  
  return null;
};

export default Navigation;
