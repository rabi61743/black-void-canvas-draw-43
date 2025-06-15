import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  Users,
  Settings,
  Bell,
  UserPlus,
  FolderOpen,
  FileSearch,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { NavigationItem } from "@/types/navigation";
import DesktopNavigation from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { UserMenu } from "./UserMenu";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCommitteeSubItems, setShowCommitteeSubItems] = useState(false);
  const isMobile = useIsMobile();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowCommitteeSubItems(false);
  }, [location.pathname]);

  const navigationItems: NavigationItem[] = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Specifications", path: "/specifications", icon: FileSearch }, // Updated to point to list view
    { name: "Tenders", path: "/tenders", icon: FileText },
    {
      name: "Committee",
      path: "/committee",
      icon: Users,
      subItems: [
        { name: "Create Committee", path: "/committee/create", icon: UserPlus },
        { name: "View Committees", path: "/committee", icon: FolderOpen },
      ],
    },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target instanceof HTMLAnchorElement && e.target.href.startsWith("http")) {
      return;
    }
  };

  const handleOpenComplaints = () => {
    navigate("/complaints");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50" onClick={handleNavClick}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            <h1
              onClick={() => navigate("/")}
              className="text-xl font-semibold text-gray-900 cursor-pointer"
            >
              Procurement Portal
            </h1>
          </div>

          {/* Desktop navigation items */}
          <div className="hidden md:flex gap-4 items-center">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="text-sm"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4 mr-1" />
                {item.name}
              </Button>
            ))}

            {/* Complaints button */}
            <Button
              variant="outline"
              className="text-sm"
              onClick={handleOpenComplaints}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              External Agency
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobile && (
          <div className="md:hidden">
            <MobileNavigation
              items={navigationItems}
              isOpen={isMenuOpen}
              showCommitteeSubItems={showCommitteeSubItems}
              setShowCommitteeSubItems={setShowCommitteeSubItems}
              onClose={() => setIsMenuOpen(false)}
            />
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleOpenComplaints}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Complaints
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;



// import { useNavigate } from "react-router-dom";
// import {
//   Menu,
//   X,
//   Home,
//   FileText,
//   Users,
//   Settings,
//   Bell,
//   UserPlus,
//   FolderOpen,
//   FileSearch,
//   MessageSquare,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useState, useEffect } from "react";
// import { useIsMobile } from "@/hooks/use-mobile";
// import { useLocation } from "react-router-dom";
// import { NavigationItem } from "@/types/navigation";
// import DesktopNavigation from "./DesktopNavigation";
// import { MobileNavigation } from "./MobileNavigation";
// import { UserMenu } from "./UserMenu";

// const Navigation = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [showCommitteeSubItems, setShowCommitteeSubItems] = useState(false);
//   const isMobile = useIsMobile();

//   // Close menu when route changes
//   useEffect(() => {
//     setIsMenuOpen(false);
//     setShowCommitteeSubItems(false);
//   }, [location.pathname]);

//   const navigationItems: NavigationItem[] = [
//     { name: "Dashboard", path: "/", icon: Home },
//     { name: "Tenders", path: "/tenders", icon: FileText },
//     { name: "Specification", path: "/specification/1", icon: FileSearch },
//     {
//       name: "Committee",
//       path: "/committee",
//       icon: Users,
//       subItems: [
//         { name: "Create Committee", path: "/committee/create", icon: UserPlus },
//         { name: "View Committees", path: "/committee", icon: FolderOpen },
//       ],
//     },
//     { name: "Settings", path: "/settings", icon: Settings },
//     { name: "Notifications", path: "/notifications", icon: Bell },
//   ];

//   const handleNavClick = (e: React.MouseEvent<HTMLElement>) => {
//     if (e.target instanceof HTMLAnchorElement && e.target.href.startsWith("http")) {
//       return;
//     }
//   };

//   const handleOpenComplaints = () => {
//     navigate("/complaints"); // Navigate to /complaints instead of opening a new tab
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50" onClick={handleNavClick}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center gap-4">
//             {isMobile && (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="md:hidden transition-colors"
//               >
//                 {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </Button>
//             )}
//             <h1
//               onClick={() => navigate("/")}
//               className="text-xl font-semibold text-gray-900 cursor-pointer"
//             >
//               Procurement Portal
//             </h1>
//           </div>

//           {/* Desktop navigation items */}
//           <div className="hidden md:flex gap-4 items-center">
//             {navigationItems.map((item, index) => (
//               <Button
//                 key={index}
//                 variant="ghost"
//                 className="text-sm"
//                 onClick={() => navigate(item.path)}
//               >
//                 <item.icon className="h-4 w-4 mr-1" />
//                 {item.name}
//               </Button>
//             ))}

//             {/* Complaints button now navigates to /complaints */}
//             <Button
//               variant="outline"
//               className="text-sm"
//               onClick={handleOpenComplaints}
//             >
//               <MessageSquare className="h-4 w-4 mr-1" />
//               External Agency
//             </Button>
//           </div>
          

//           <div className="flex items-center gap-4">
//             <UserMenu />
//           </div>
//         </div>

//         {/* Mobile navigation */}
//         <div className="md:hidden">
//           <MobileNavigation
//             items={navigationItems}
//             isOpen={isMenuOpen}
//             showCommitteeSubItems={showCommitteeSubItems}
//             setShowCommitteeSubItems={setShowCommitteeSubItems}
//             onClose={() => setIsMenuOpen(false)}
//           />
//           <Button
//             variant="outline"
//             className="w-full mt-2"
//             onClick={handleOpenComplaints}
//           >
//             <MessageSquare className="h-4 w-4 mr-1" />
//             Complaints
//           </Button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navigation;



