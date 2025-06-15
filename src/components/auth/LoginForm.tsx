// import React, { useState, useEffect } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import { useNavigate } from "react-router-dom";
// import { Loader2, AlertCircle } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Checkbox } from "@/components/ui/checkbox";

// const LoginForm = () => {
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showResetForm, setShowResetForm] = useState(false);
//   const [resetEmail, setResetEmail] = useState("");
//   const [errors, setErrors] = useState<{ identifier?: string; password?: string; resetEmail?: string }>({});
  
//   const { login, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/', { replace: true });
//     }
//   }, [isAuthenticated, navigate]);

//   useEffect(() => {
//     const rememberedIdentifier = localStorage.getItem("rememberedIdentifier");
//     if (rememberedIdentifier) {
//       setIdentifier(rememberedIdentifier);
//       setRememberMe(true);
//     }
//   }, []);

//   const validateForm = () => {
//     const newErrors: { identifier?: string; password?: string } = {};
    
//     if (!identifier) {
//       newErrors.identifier = "Employee ID is required";
//     }
    
//     if (!password) {
//       newErrors.password = "Password is required";
//     } else if (password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateResetForm = () => {
//     const newErrors: { resetEmail?: string } = {};
    
//     if (!resetEmail) {
//       newErrors.resetEmail = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
//       newErrors.resetEmail = "Invalid email format";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const success = await login(identifier, password);
      
//       if (success) {
//         if (rememberMe) {
//           localStorage.setItem("rememberedIdentifier", identifier);
//         } else {
//           localStorage.removeItem("rememberedIdentifier");
//         }
        
//         navigate('/', { replace: true });
//       }
//     } catch (error) {
//       toast({
//         title: "Login Failed",
//         description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePasswordReset = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateResetForm()) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/forgot-password`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email: resetEmail }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to send reset email');
//       }

//       toast({
//         title: "Password Reset Email Sent",
//         description: "Check your email for password reset instructions.",
//       });
      
//       setShowResetForm(false);
//       setResetEmail("");
//     } catch (error) {
//       toast({
//         title: "Reset Failed",
//         description: error instanceof Error ? error.message : "Failed to send reset email",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="p-6 w-full max-w-md mx-auto mt-20">
//       {!showResetForm ? (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <h2 className="text-2xl font-bold text-center">Login</h2>
//             <p className="text-sm text-gray-500 text-center">
//               Enter your credentials to access the system
//             </p>
//           </div>
          
//           <div className="space-y-2">
//             <label className="text-sm font-medium" htmlFor="identifier">
//               Employee ID
//             </label>
//             <Input
//               id="identifier"
//               type="text"
//               value={identifier}
//               onChange={(e) => {
//                 setIdentifier(e.target.value);
//                 setErrors({ ...errors, identifier: undefined });
//               }}
//               placeholder="Enter your employee ID"
//               className={errors.identifier ? "border-red-500" : ""}
//             />
//             {errors.identifier && (
//               <p className="text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="h-4 w-4" />
//                 {errors.identifier}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium" htmlFor="password">
//               Password
//             </label>
//             <Input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => {
//                 setPassword(e.target.value);
//                 setErrors({ ...errors, password: undefined });
//               }}
//               placeholder="Enter your password"
//               className={errors.password ? "border-red-500" : ""}
//             />
//             {errors.password && (
//               <p className="text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="h-4 w-4" />
//                 {errors.password}
//               </p>
//             )}
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id="remember"
//                 checked={rememberMe}
//                 onCheckedChange={(checked) => setRememberMe(checked as boolean)}
//               />
//               <label
//                 htmlFor="remember"
//                 className="text-sm text-gray-500 cursor-pointer"
//               >
//                 Remember me
//               </label>
//             </div>
//             <button
//               type="button"
//               onClick={() => setShowResetForm(true)}
//               className="text-sm text-primary hover:underline"
//             >
//               Forgot password?
//             </button>
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : null}
//             {isLoading ? "Logging in..." : "Login"}
//           </Button>
//         </form>
//       ) : (
//         <form onSubmit={handlePasswordReset} className="space-y-4">
//           <div className="space-y-2">
//             <h2 className="text-2xl font-bold text-center">Reset Password</h2>
//             <p className="text-sm text-gray-500 text-center">
//               Enter your email to receive reset instructions
//             </p>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium" htmlFor="resetEmail">
//               Email
//             </label>
//             <Input
//               id="resetEmail"
//               type="email"
//               value={resetEmail}
//               onChange={(e) => {
//                 setResetEmail(e.target.value);
//                 setErrors({ ...errors, resetEmail: undefined });
//               }}
//               placeholder="Enter your email"
//               className={errors.resetEmail ? "border-red-500" : ""}
//             />
//             {errors.resetEmail && (
//               <p className="text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="h-4 w-4" />
//                 {errors.resetEmail}
//               </p>
//             )}
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : null}
//             {isLoading ? "Sending..." : "Send Reset Link"}
//           </Button>

//           <div className="text-center">
//             <button
//               type="button"
//               onClick={() => setShowResetForm(false)}
//               className="text-sm text-primary hover:underline"
//             >
//               Back to login
//             </button>
//           </div>
//         </form>
//       )}
//     </Card>
//   );
// };

// export default LoginForm;



import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const LoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; resetEmail?: string }>({});

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem("rememberedIdentifier");
    if (rememberedIdentifier) {
      setIdentifier(rememberedIdentifier);
      setRememberMe(true);
    }
  }, []);

  const validateLoginForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier) newErrors.identifier = "Employee ID is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors: { resetEmail?: string } = {};
    if (!resetEmail) newErrors.resetEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(resetEmail)) newErrors.resetEmail = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    try {
      const success = await login(identifier, password);
      if (success) {
        if (rememberMe) {
          localStorage.setItem("rememberedIdentifier", identifier);
        } else {
          localStorage.removeItem("rememberedIdentifier");
        }
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send reset email");
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setShowResetForm(false);
      setResetEmail("");
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto mt-20">
      {!showResetForm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-center">Login</h2>
            <p className="text-sm text-gray-500 text-center">Enter your credentials to access the system</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="identifier">
              Employee ID
            </label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrors(prev => ({ ...prev, identifier: undefined }));
              }}
              placeholder="Enter your employee ID"
              className={errors.identifier ? "border-red-500" : ""}
            />
            {errors.identifier && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.identifier}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-center">Reset Password</h2>
            <p className="text-sm text-gray-500 text-center">Enter your email to receive reset instructions</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="resetEmail">
              Email
            </label>
            <Input
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setErrors(prev => ({ ...prev, resetEmail: undefined }));
              }}
              placeholder="Enter your email"
              className={errors.resetEmail ? "border-red-500" : ""}
            />
            {errors.resetEmail && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.resetEmail}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowResetForm(false)}
              className="text-sm text-primary hover:underline"
            >
              Back to login
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default LoginForm;