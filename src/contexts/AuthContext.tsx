
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, usersApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { User as UserType, UpdateUserData } from '@/types/employee';

interface User {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  employee_id: string; // Add both for compatibility
  role: {
    id: number;
    role_name: string;
    parent: any;
  };
  department: string | null;
  phoneNumber: string;
  designation: string;
  isActive: boolean;
  otpEnabled: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  connectionError: boolean;
  isOfflineMode: boolean;
  // Employee management
  employees: UserType[];
  employeesLoading: boolean;
  employeesError: string | null;
  refetchEmployees: () => Promise<void>;
  updateUser: (id: string, userData: UpdateUserData) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  // Permissions
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("AuthProvider: Initializing authentication...");
      console.log("AuthProvider: Environment:", {
        isDevelopment,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        mode: import.meta.env.MODE
      });
      
      const storedToken = localStorage.getItem('access_token');
      console.log("AuthProvider: Stored token:", storedToken ? "exists" : "none");
      
      if (storedToken) {
        setToken(storedToken);
        try {
          console.log("AuthProvider: Attempting to get current user...");
          const response = await authApi.getCurrentUser();
          console.log("AuthProvider: Current user response:", response.data);
          const userData = response.data as User;
          // Ensure both employee_id and employeeId are available for compatibility
          const userWithCompatibility: User = {
            ...userData,
            employeeId: userData.employee_id || userData.employeeId,
            employee_id: userData.employee_id || userData.employeeId
          };
          setUser(userWithCompatibility);
          setConnectionError(false);
        } catch (error: any) {
          console.error("AuthProvider: Failed to get current user:", error);
          
          // Check if it's a connection error
          if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || error.response?.status === 502) {
            console.log("AuthProvider: Backend connection failed, entering offline mode");
            setConnectionError(true);
            setIsOfflineMode(true);
            
            if (isDevelopment) {
              toast({
                title: "Backend Connection Failed",
                description: "Running in offline mode. Please start the backend server.",
                variant: "destructive"
              });
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('access_token');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [isDevelopment, toast]);

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    console.log("AuthProvider: Attempting login for:", employeeId);
    console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    
    try {
      setConnectionError(false);
      const response = await authApi.login(employeeId, password);
      console.log("AuthProvider: Login response:", response.data);
      
      const loginData = response.data as { access: string; user: User };
      const { access, user: userData } = loginData;
      
      localStorage.setItem('access_token', access);
      setToken(access);
      
      // Ensure both employee_id and employeeId are available for compatibility
      const userWithCompatibility: User = {
        ...userData,
        employeeId: userData.employee_id || userData.employeeId,
        employee_id: userData.employee_id || userData.employeeId
      };
      setUser(userWithCompatibility);
      setIsOfflineMode(false);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.email || userData.employeeId}!`
      });
      
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if it's a connection error
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || error.response?.status === 502) {
        setConnectionError(true);
        toast({
          title: "Connection Failed",
          description: "Cannot connect to the server. Please check if the backend is running.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const logout = () => {
    console.log("AuthProvider: Logging out...");
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setIsOfflineMode(false);
    setConnectionError(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  const refetchEmployees = async () => {
    if (!token) return;
    
    setEmployeesLoading(true);
    setEmployeesError(null);
    
    try {
      const response = await usersApi.getAll();
      setEmployees(response.data as UserType[]);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      setEmployeesError(error.message || "Failed to fetch employees");
    } finally {
      setEmployeesLoading(false);
    }
  };

  const updateUser = async (id: string, userData: UpdateUserData): Promise<boolean> => {
    try {
      await usersApi.update(id, userData);
      await refetchEmployees(); // Refresh the list
      toast({
        title: "User Updated",
        description: "User has been successfully updated."
      });
      return true;
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await usersApi.delete(id);
      await refetchEmployees(); // Refresh the list
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted."
      });
      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete user.",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      await authApi.register(userData);
      toast({
        title: "Registration Successful",
        description: "User has been successfully registered."
      });
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register user.",
        variant: "destructive"
      });
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin users have all permissions
    if (user.role?.role_name === 'admin' || user.role?.role_name === 'Superadmin') {
      return true;
    }
    
    // Check if user has the specific permission
    return user.permissions?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user && !connectionError,
    login,
    logout,
    loading,
    connectionError,
    isOfflineMode,
    employees,
    employeesLoading,
    employeesError,
    refetchEmployees,
    updateUser,
    deleteUser,
    register,
    hasPermission
  };

  console.log("AuthProvider: Current auth state:", {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated: !!token && !!user && !connectionError,
    loading,
    connectionError,
    isOfflineMode
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
