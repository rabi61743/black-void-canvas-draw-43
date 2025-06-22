
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Users,
  Settings,
  Bell,
  UserPlus,
  FolderOpen,
  FileSearch,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { UserMenu } from "./UserMenu";
import { NavigationItem } from "@/types/navigation";
import { useState } from "react";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCommitteeSubItems, setShowCommitteeSubItems] = useState(false);

  const navigationItems: NavigationItem[] = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Specifications", path: "/specifications", icon: FileSearch },
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
    { name: "Procurement Plan", path: "/procurement-plan", icon: FileText },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleExternalAgency = () => {
    navigate("/complaints");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 h-16 flex items-center">
        <h1
          onClick={() => navigate("/")}
          className="text-lg font-semibold cursor-pointer hover:text-blue-100 text-white truncate"
        >
          Procurement Portal
        </h1>
      </SidebarHeader>
      
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                
                if (item.subItems) {
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        onClick={() => setShowCommitteeSubItems(!showCommitteeSubItems)}
                        className={`w-full hover:bg-blue-50 text-gray-700 hover:text-blue-600 py-3 px-4 rounded-lg transition-colors ${
                          isActive(item.path) ? "bg-blue-100 text-blue-700" : ""
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform flex-shrink-0 ${showCommitteeSubItems ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      {showCommitteeSubItems && (
                        <SidebarMenuSub className="mt-2">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <SidebarMenuSubItem key={subItem.path}>
                                <SidebarMenuSubButton
                                  onClick={() => handleNavigation(subItem.path)}
                                  className={`hover:bg-blue-50 text-gray-600 hover:text-blue-600 py-2.5 px-4 rounded-md transition-colors ${
                                    isActive(subItem.path) ? "bg-blue-100 text-blue-700" : ""
                                  }`}
                                >
                                  <SubIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{subItem.name}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.path)}
                      className={`hover:bg-blue-50 text-gray-700 hover:text-blue-600 py-3 px-4 rounded-lg transition-colors ${
                        isActive(item.path) ? "bg-blue-100 text-blue-700" : ""
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {/* External Agency button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleExternalAgency}
                  className={`hover:bg-blue-50 text-gray-700 hover:text-blue-600 py-3 px-4 rounded-lg transition-colors ${
                    isActive("/complaints") ? "bg-blue-100 text-blue-700" : ""
                  }`}
                >
                  <MessageSquare className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">External Agency</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-white h-16 flex items-center border-t">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
