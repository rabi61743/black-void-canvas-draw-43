
import { LogOut, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role?.role_name;

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start h-auto p-2 hover:bg-gray-100"
        >
          <User className="h-4 w-4 mr-2" />
          <div className="flex flex-col items-start text-xs">
            <span className="font-medium">{user?.name || "Guest User"}</span>
            <span className="text-gray-500">{user?.email || "guest@example.com"}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || "Guest User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "guest@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userRole === "SUPERADMIN" && (
          <>
            <DropdownMenuItem
              onClick={() => navigate("/created-user")}
              className="cursor-pointer"
            >
              <Users className="mr-2 h-4 w-4" />
              View Users
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
