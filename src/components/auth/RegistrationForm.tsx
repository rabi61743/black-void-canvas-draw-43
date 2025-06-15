import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for TypeScript
interface Role {
  id: number;
  role_name: string;
}

interface User {
  role?: {
    role_name: string;
  };
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  employee_id: string;
  department: string;
  phone: string;
  role: string;
}

interface Errors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  employee_id?: string;
  department?: string;
  phone?: string;
  role?: string;
}

const RegisterForm = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    employee_id: "",
    department: "",
    phone: "",
    role: "",
  });
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, register, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const authToken = token || localStorage.getItem("access_token");
        console.log("Fetching roles with token:", authToken); // Debug log
        if (!authToken) {
          throw new Error("No authentication token found. Please log in again.");
        }

        const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/users/roles/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) {
              throw new Error("Session expired. Please log in again.");
            }
            const refreshResponse = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/users/token/refresh/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            const refreshData = await refreshResponse.json();
            if (refreshResponse.ok) {
              localStorage.setItem("access_token", refreshData.access);
              const retryResponse = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/users/roles/", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${refreshData.access}`,
                },
              });
              const retryData = await retryResponse.json();
              if (!retryResponse.ok) {
                throw new Error(retryData.message || "Failed to fetch roles after token refresh");
              }
              console.log("Roles fetched after refresh:", retryData); // Debug log
              setRoles(retryData);
            } else {
              throw new Error("Session expired. Please log in again.");
            }
          } else {
            throw new Error(data.message || "Failed to fetch roles");
          }
        }
        console.log("Roles fetched:", data); // Debug log
        setRoles(data);
      } catch (error) {
        console.error("Role fetch error:", error); // Debug log
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch roles.",
          variant: "destructive",
        });
      }
    };
    
    console.log("Checking fetchRoles conditions:", { user, token, isSuperAdmin: user?.role?.role_name === "SUPERADMIN" }); // Debug log
    if (user?.role?.role_name === "SUPERADMIN" && token) {
      fetchRoles();
    }
  }, [user, token, toast]);

  const validateForm = () => {
    const newErrors: Errors = {};
    
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.employee_id) newErrors.employee_id = "Employee ID is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
    setErrors((prev) => ({ ...prev, role: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        employee_id: formData.employee_id,
        department: formData.department,
        phone: formData.phone,
        role: parseInt(formData.role), // Backend expects role ID as number
      });
      
      if (success) {
        toast({
          title: "Success",
          description: "User registered successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      const backendErrors = error.response?.data;
      if (backendErrors && typeof backendErrors === "object") {
        const newErrors: Errors = {};
        for (const [field, messages] of Object.entries(backendErrors)) {
          if (field in formData) {
            newErrors[field as keyof Errors] = Array.isArray(messages) ? messages.join(", ") : messages as string;
          }
        }
        setErrors(newErrors);
        toast({
          title: "Registration Failed",
          description: "Please correct the errors in the form.",
          variant: "destructive",
        });
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : error.response?.data?.detail || "Registration failed. Please try again.";
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  if (!user || user.role?.role_name !== "SUPERADMIN") {
    return (
      <Card className="p-6 w-full max-w-md mx-auto mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Permission Denied</h2>
          <p className="text-sm text-gray-500 mt-2">
            Only SUPERADMIN users can access this page.
          </p>
          <Button onClick={handleLogin} className="mt-4">
            Go to Login
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
          <p className="text-sm text-gray-500 text-center">
            Fill in user details to register
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="username">
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.username}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="employee_id">
            Employee ID
          </label>
          <Input
            id="employee_id"
            name="employee_id"
            type="text"
            value={formData.employee_id}
            onChange={handleChange}
            placeholder="Enter employee ID"
            className={errors.employee_id ? "border-red-500" : ""}
          />
          {errors.employee_id && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.employee_id}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="department">
            Department
          </label>
          <Input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleChange}
            placeholder="Enter department"
            className={errors.department ? "border-red-500" : ""}
          />
          {errors.department && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.department}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="phone">
            Phone Number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="role">
            Role
          </label>
          <Select onValueChange={handleRoleChange} value={formData.role}>
            <SelectTrigger className={errors.role ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No roles available
                </div>
              ) : (
                roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.role_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.role}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? "Registering..." : "Register"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleLogin}
            className="text-sm text-primary hover:underline"
          >
            Already have an account? Login here
          </button>
        </div>
      </form>
    </Card>
  );
};

export default RegisterForm;