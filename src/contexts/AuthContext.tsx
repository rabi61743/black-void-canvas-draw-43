


// import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { useToast } from "@/hooks/use-toast";

// interface Role {
//   id: number;
//   role_name: string;
//   parent: number | null;
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: Role | null;
//   employee_id: string; // Changed to match backend
//   department: string | null;
//   phoneNumber: string | null;
//   designation: string | null;
//   isActive: boolean;
//   otpEnabled: boolean;
//   permissions: string[];
// }

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   token: string | null;
//   employees: User[];
//   employeesLoading: boolean;
//   employeesError: string | null;
// }

// interface RegisterData {
//   employee_id: string;
//   username: string;
//   email: string;
//   password: string;
//   phone?: string;
//   department?: string;
//   role?: number;
// }

// interface UpdateUserData {
//   name?: string;
//   email?: string;
//   role?: number;
//   department?: string;
//   phoneNumber?: string;
//   designation?: string;
//   isActive?: boolean;
//   otpEnabled?: boolean;
// }

// interface AuthMethods {
//   login: (identifier: string, password: string) => Promise<boolean>;
//   register: (userData: RegisterData) => Promise<boolean>;
//   logout: () => void;
//   hasPermission: (permission: string) => boolean;
//   fetchEmployees: () => Promise<void>;
//   refetchEmployees: () => Promise<void>;
//   updateUser: (userId: string, userData: UpdateUserData) => Promise<boolean>;
//   deleteUser: (userId: string) => Promise<boolean>;
// }

// type AuthContextType = AuthState & AuthMethods;

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [state, setState] = useState<AuthState>(() => {
//     const token = localStorage.getItem("access_token");
//     const user = localStorage.getItem("user");
    
//     return {
//       user: user ? JSON.parse(user) : null,
//       isAuthenticated: !!token,
//       token: token || null,
//       employees: [],
//       employeesLoading: false,
//       employeesError: null,
//     };
//   });
  
//   const { toast } = useToast();

//   const refreshToken = async () => {
//     const refresh = localStorage.getItem("refresh_token");
//     if (!refresh) return false;
//     try {
//       console.log("Attempting token refresh");
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refresh }),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || "Token refresh failed");
//       setState(prev => ({ ...prev, token: data.access }));
//       localStorage.setItem("access_token", data.access);
//       console.log("Token refreshed");
//       return true;
//     } catch (error) {
//       console.error("Token refresh failed:", error);
//       return false;
//     }
//   };

//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         setState(prev => ({
//           ...prev,
//           isAuthenticated: false,
//           user: null,
//           token: null,
//         }));
//         return;
//       }

//       try {
//         const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/`, {
//           method: "GET",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           if (response.status === 401) {
//             const refreshed = await refreshToken();
//             if (refreshed) {
//               const newToken = localStorage.getItem("access_token");
//               const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/`, {
//                 method: "GET",
//                 headers: {
//                   "Authorization": `Bearer ${newToken}`,
//                   "Content-Type": "application/json",
//                 },
//               });
//               if (!retryResponse.ok) throw new Error("Retry failed");
//               const data = await retryResponse.json();
//               setState(prev => ({
//                 ...prev,
//                 user: data,
//                 isAuthenticated: true,
//                 token: newToken,
//               }));
//               return;
//             }
//           }
//           throw new Error("Failed to fetch user");
//         }

//         const data = await response.json();
//         setState(prev => ({
//           ...prev,
//           user: data,
//           isAuthenticated: true,
//           token,
//         }));
//       } catch (error) {
//         console.error("Auth check failed:", error);
//         setState(prev => ({
//           ...prev,
//           isAuthenticated: false,
//           user: null,
//           token: null,
//         }));
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//       }
//     };

//     checkAuth();
//   }, []);

//   useEffect(() => {
//     if (state.token) {
//       localStorage.setItem("access_token", state.token);
//       if (state.user) {
//         localStorage.setItem("user", JSON.stringify(state.user));
//       }
//       fetchEmployees();
//     } else {
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("refresh_token");
//       localStorage.removeItem("user");
//     }
//   }, [state.token]);

//   const login = async (identifier: string, password: string): Promise<boolean> => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ employee_id: identifier, password }),
//       });
  
//       const data = await response.json();
  
//       if (!response.ok) {
//         console.log("Login error response:", data);
//         throw new Error(data.detail || 'Login failed');
//       }
  
//       setState(prev => ({
//         ...prev,
//         user: data.user,
//         isAuthenticated: true,
//         token: data.access,
//       }));
//       localStorage.setItem("access_token", data.access);
//       localStorage.setItem("refresh_token", data.refresh);
  
//       toast({
//         title: "Login Successful",
//         description: `Welcome back, ${data.user?.name || 'User'}!`,
//       });
      
//       return true;
//     } catch (error) {
//       console.log("Login catch error:", error);
//       toast({
//         title: "Login Failed",
//         description: error instanceof Error ? error.message : "Invalid credentials",
//         variant: "destructive",
//       });
//       return false;
//     }
//   };

//   const register = async (userData: RegisterData): Promise<boolean> => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/register/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${state.token}`,
//         },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || data.detail || 'Registration failed');
//       }

//       toast({
//         title: "Registration Successful",
//         description: `User ${userData.username} registered successfully!`,
//       });
      
//       return true;
//     } catch (error) {
//       toast({
//         title: "Registration Failed",
//         description: error instanceof Error ? error.message : "Registration failed",
//         variant: "destructive",
//       });
//       return false;
//     }
//   };

//   const fetchEmployees = async (): Promise<void> => {
//     if (!state.token) return;
    
//     try {
//       setState(prev => ({
//         ...prev,
//         employeesLoading: true,
//         employeesError: null,
//       }));
      
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/`, {
//         method: 'GET',
//         headers: {
//           "Authorization": `Bearer ${state.token}`,
//           "Content-Type": "application/json",
//         },
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (!data || !data.data || !Array.isArray(data.data.users)) {
//         throw new Error("Invalid data format received from server");
//       }
      
//       setState(prev => ({
//         ...prev,
//         employees: data.data.users,
//         employeesLoading: false,
//       }));
//     } catch (err) {
//       setState(prev => ({
//         ...prev,
//         employeesError: err instanceof Error ? err.message : "Failed to fetch employees",
//         employeesLoading: false,
//       }));
//     }
//   };

//   const refetchEmployees = async (): Promise<void> => {
//     await fetchEmployees();
//   };

//   const updateUser = async (userId: string, userData: UpdateUserData): Promise<boolean> => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/${userId}/`, {
//         method: 'PATCH',
//         headers: {
//           "Authorization": `Bearer ${state.token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || data.detail || 'Failed to update user');
//       }

//       toast({
//         title: "Update Successful",
//         description: `User has been updated.`,
//       });

//       await refetchEmployees();
//       return true;
//     } catch (error) {
//       toast({
//         title: "Update Failed",
//         description: error instanceof Error ? error.message : "Failed to update user",
//         variant: "destructive",
//       });
//       return false;
//     }
//   };

//   const deleteUser = async (userId: string): Promise<boolean> => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/${userId}/`, {
//         method: 'DELETE',
//         headers: {
//           "Authorization": `Bearer ${state.token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         throw new Error(data.message || data.detail || 'Failed to delete user');
//       }

//       toast({
//         title: "Deletion Successful",
//         description: "User has been deleted.",
//       });

//       await refetchEmployees();
//       return true;
//     } catch (error) {
//       toast({
//         title: "Deletion Failed",
//         description: error instanceof Error ? error.message : "Failed to delete user",
//         variant: "destructive",
//       });
//       return false;
//     }
//   };

//   const logout = () => {
//     setState({
//       user: null,
//       isAuthenticated: false,
//       token: null,
//       employees: [],
//       employeesLoading: false,
//       employeesError: null,
//     });
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     toast({
//       title: "Logged Out",
//       description: "You have been successfully logged out.",
//     });
//   };

//   const hasPermission = (permission: string): boolean => {
//     if (!state.user) return false;
//     return state.user.permissions.includes(permission) || 
//            state.user.role?.role_name === 'SUPERADMIN';
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       ...state,
//       login,
//       register,
//       logout,
//       hasPermission,
//       fetchEmployees,
//       refetchEmployees,
//       updateUser,
//       deleteUser,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };


import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: number;
  role_name: string;
  parent: number | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role | null;
  employee_id: string;
  department: string | null;
  phoneNumber: string | null;
  designation: string | null;
  isActive: boolean;
  otpEnabled: boolean;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  employees: User[];
  employeesLoading: boolean;
  employeesError: string | null;
}

interface RegisterData {
  employee_id: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  role?: number;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: number;
  department?: string;
  phoneNumber?: string;
  designation?: string;
  isActive?: boolean;
  otpEnabled?: boolean;
}

interface AuthMethods {
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  fetchEmployees: () => Promise<void>;
  refetchEmployees: () => Promise<void>;
  updateUser: (userId: string, userData: UpdateUserData) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

type AuthContextType = AuthState & AuthMethods;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    return {
      user: user ? JSON.parse(user) : null,
      isAuthenticated: !!token,
      token,
      employees: [],
      employeesLoading: false,
      employeesError: null,
    };
  });

  const { toast } = useToast();

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return false;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Token refresh failed");
      }

      const data = await response.json();
      setState(prev => ({ ...prev, token: data.access }));
      localStorage.setItem("access_token", data.access);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
        }));
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
              const newToken = localStorage.getItem("access_token");
              const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/`, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              });
              if (!retryResponse.ok) throw new Error("Retry failed after token refresh");
              const data = await retryResponse.json();
              setState(prev => ({
                ...prev,
                user: data,
                isAuthenticated: true,
                token: newToken,
              }));
              return;
            }
          }
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setState(prev => ({
          ...prev,
          user: data,
          isAuthenticated: true,
          token,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
        }));
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem("access_token", state.token);
      if (state.user) localStorage.setItem("user", JSON.stringify(state.user));
      fetchEmployees();
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }, [state.token]);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL); // Debug
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employee_id: identifier, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Login error response:", errorText);
        throw new Error(errorText || "Login failed");
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        user: data.user,
        isAuthenticated: true,
        token: data.access,
      }));
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user?.name || "User"}!`,
      });
      return true;
    } catch (error) {
      console.error("Login catch error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${state.token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed");
      }

      toast({
        title: "Registration Successful",
        description: `User ${userData.username} registered successfully!`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchEmployees = async (): Promise<void> => {
    if (!state.token) return;

    try {
      setState(prev => ({
        ...prev,
        employeesLoading: true,
        employeesError: null,
      }));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${state.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch employees");
      }

      const data = await response.json();
      if (!data?.data?.users || !Array.isArray(data.data.users)) {
        throw new Error("Invalid data format received from server");
      }

      setState(prev => ({
        ...prev,
        employees: data.data.users,
        employeesLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        employeesError: error instanceof Error ? error.message : "Failed to fetch employees",
        employeesLoading: false,
      }));
    }
  };

  const refetchEmployees = async () => fetchEmployees();

  const updateUser = async (userId: string, userData: UpdateUserData): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/${userId}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${state.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update user");
      }

      toast({
        title: "Update Successful",
        description: "User has been updated.",
      });
      await refetchEmployees();
      return true;
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/${userId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${state.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete user");
      }

      toast({
        title: "Deletion Successful",
        description: "User has been deleted.",
      });
      await refetchEmployees();
      return true;
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      token: null,
      employees: [],
      employeesLoading: false,
      employeesError: null,
    });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.includes(permission) || state.user.role?.role_name === "SUPERADMIN";
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        hasPermission,
        fetchEmployees,
        refetchEmployees,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};