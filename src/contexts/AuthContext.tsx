
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
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
          setUser(response.data);
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
      
      const { access, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      setToken(access);
      setUser(userData);
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

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user && !connectionError,
    login,
    logout,
    loading,
    connectionError,
    isOfflineMode
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
