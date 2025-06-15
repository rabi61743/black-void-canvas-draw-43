
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
import { Button } from "@/components/ui/button";

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
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <h1
          onClick={() => navigate("/")}
          className="text-lg font-semibold cursor-pointer hover:text-gray-600"
        >
          Procurement Portal
        </h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                
                if (item.subItems) {
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        onClick={() => setShowCommitteeSubItems(!showCommitteeSubItems)}
                        className={`w-full ${
                          isActive(item.path) ? "bg-gray-100" : ""
                        }`}
                      >
                        <Icon />
                        <span>{item.name}</span>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${showCommitteeSubItems ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      {showCommitteeSubItems && (
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <SidebarMenuSubItem key={subItem.path}>
                                <SidebarMenuSubButton
                                  onClick={() => handleNavigation(subItem.path)}
                                  className={
                                    isActive(subItem.path) ? "bg-gray-100" : ""
                                  }
                                >
                                  <SubIcon />
                                  <span>{subItem.name}</span>
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
                      className={isActive(item.path) ? "bg-gray-100" : ""}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {/* External Agency button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleExternalAgency}
                  className={isActive("/complaints") ? "bg-gray-100" : ""}
                >
                  <MessageSquare />
                  <span>External Agency</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
