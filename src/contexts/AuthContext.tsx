
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("AuthProvider: Initializing authentication...");
      const storedToken = localStorage.getItem('access_token');
      console.log("AuthProvider: Stored token:", storedToken ? "exists" : "none");
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authApi.getCurrentUser();
          console.log("AuthProvider: Current user response:", response.data);
          setUser(response.data);
        } catch (error) {
          console.error("AuthProvider: Failed to get current user:", error);
          localStorage.removeItem('access_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    console.log("AuthProvider: Attempting login for:", employeeId);
    console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    
    try {
      const response = await authApi.login(employeeId, password);
      console.log("AuthProvider: Login response:", response.data);
      
      const { access, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      setToken(access);
      setUser(userData);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.email || userData.employeeId}!`
      });
      
      return true;
    } catch (error: any) {
      console.error("Login catch error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    console.log("AuthProvider: Logging out...");
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    loading
  };

  console.log("AuthProvider: Current auth state:", {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated: !!token && !!user,
    loading
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
