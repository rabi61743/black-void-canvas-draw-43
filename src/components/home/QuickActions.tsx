import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, FileText, Users, MessageSquare, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onShowCommitteeForm: () => void;
  onShowTenderForm: () => void;
  onShowVendorForm: () => void;
  onShowComplaints?: () => void; // Make optional to avoid override
}

const QuickActions = ({
  onShowCommitteeForm,
  onShowTenderForm,
  onShowVendorForm,
  onShowComplaints,
}: QuickActionsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role?.role_name === "SUPERADMIN";

  const handleCreateUser = () => {
    console.log("Navigating to /register");
    navigate("/register");
  };

  const handleShowComplaints = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("handleShowComplaints triggered, redirecting to /complaints");
    navigate("/complaints"); // Navigate to /complaints instead of external redirect
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-purple-500" />
          <h3 className="text-lg font-semibold">Committee Formation</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Create and manage specification committees
        </p>
        <Button onClick={onShowCommitteeForm} className="w-full">
          Create Committee
        </Button>
      </Card>

      <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold">Active Tenders</h3>
        </div>
        <p className="text-gray-600 mb-4">
          View and manage ongoing tender processes
        </p>
        <Button variant="outline" className="w-full" onClick={onShowTenderForm}>
          Create Tender
        </Button>
      </Card>

      <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-semibold">Vendor Management</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Register and manage vendor profiles
        </p>
        <Button variant="outline" className="w-full" onClick={onShowVendorForm}>
          Register Vendor
        </Button>
      </Card>

      <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-6 w-6 text-orange-500" />
          <h3 className="text-lg font-semibold">Complaints</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Manage and track complaints
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={onShowComplaints || handleShowComplaints} // Use prop if provided, otherwise use local handler
        >
          View Complaints
        </Button>
      </Card>

      {isSuperAdmin && (
        <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="h-6 w-6 text-indigo-500" />
            <h3 className="text-lg font-semibold">Create User</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Register new users in the system
          </p>
          <Button variant="outline" className="w-full" onClick={handleCreateUser}>
            Create User
          </Button>
        </Card>
      )}
    </div>
  );
};

export default QuickActions;



// // frontend-main/src/components/QuickActions.tsx
// import React from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Building2, FileText, Users, MessageSquare, UserPlus } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// interface QuickActionsProps {
//   onShowCommitteeForm: () => void;
//   onShowTenderForm: () => void;
//   onShowVendorForm: () => void;
//   onShowComplaints?: () => void; // Make optional to avoid override
// }

// const QuickActions = ({
//   onShowCommitteeForm,
//   onShowTenderForm,
//   onShowVendorForm,
//   onShowComplaints,
// }: QuickActionsProps) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const isSuperAdmin = user?.role?.role_name === "SUPERADMIN";

//   const handleCreateUser = () => {
//     console.log("Navigating to /register");
//     navigate("/register");
//   };

//   const handleShowComplaints = (event: React.MouseEvent<HTMLButtonElement>) => {
//     event.preventDefault();
//     event.stopPropagation();
//     console.log("handleShowComplaints triggered, redirecting to http://localhost:3001/");
//     window.location.assign("http://localhost:3001/"); // Use assign for clarity
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <Users className="h-6 w-6 text-purple-500" />
//           <h3 className="text-lg font-semibold">Committee Formation</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           Create and manage specification committees
//         </p>
//         <Button onClick={onShowCommitteeForm} className="w-full">
//           Create Committee
//         </Button>
//       </Card>

//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <FileText className="h-6 w-6 text-blue-500" />
//           <h3 className="text-lg font-semibold">Active Tenders</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           View and manage ongoing tender processes
//         </p>
//         <Button variant="outline" className="w-full" onClick={onShowTenderForm}>
//           Create Tender
//         </Button>
//       </Card>

//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <Building2 className="h-6 w-6 text-green-500" />
//           <h3 className="text-lg font-semibold">Vendor Management</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           Register and manage vendor profiles
//         </p>
//         <Button variant="outline" className="w-full" onClick={onShowVendorForm}>
//           Register Vendor
//         </Button>
//       </Card>

//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <MessageSquare className="h-6 w-6 text-orange-500" />
//           <h3 className="text-lg font-semibold">Complaints</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           Manage and track complaints
//         </p>
//         <Button
//           variant="outline"
//           className="w-full"
//           onClick={handleShowComplaints} // Use local handler directly
//         >
//           View Complaints
//         </Button>
//       </Card>

//       {isSuperAdmin && (
//         <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//           <div className="flex items-center gap-3 mb-4">
//             <UserPlus className="h-6 w-6 text-indigo-500" />
//             <h3 className="text-lg font-semibold">Create User</h3>
//           </div>
//           <p className="text-gray-600 mb-4">
//             Register new users in the system
//           </p>
//           <Button variant="outline" className="w-full" onClick={handleCreateUser}>
//             Create User
//           </Button>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default QuickActions;



// import React from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Building2, FileText, Users, MessageSquare, UserPlus } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// interface QuickActionsProps {
//   onShowCommitteeForm: () => void;
//   onShowTenderForm: () => void;
//   onShowVendorForm: () => void;
//   onShowComplaints: () => void;
// }

// const QuickActions = ({
//   onShowCommitteeForm,
//   onShowTenderForm,
//   onShowVendorForm,
//   onShowComplaints,
// }: QuickActionsProps) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const isSuperAdmin = user?.role?.role_name === "SUPERADMIN";

//   const handleCreateUser = () => {
//     navigate("/register");
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <Users className="h-6 w-6 text-purple-500" />
//           <h3 className="text-lg font-semibold">Committee Formation</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           Create and manage specification committees
//         </p>
//         <Button onClick={onShowCommitteeForm} className="w-full">
//           Create Committee
//         </Button>
//       </Card>

//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <FileText className="h-6 w-6 text-blue-500" />
//           <h3 className="text-lg font-semibold">Active Tenders</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           View and manage ongoing tender processes
//         </p>
//         <Button variant="outline" className="w-full" onClick={onShowTenderForm}>
//           Create Tender
//         </Button>
//       </Card>

//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <Building2 className="h-6 w-6 text-green-500" />
//           <h3 className="text-lg font-semibold">Vendor Management</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           Register and manage vendor profiles
//         </p>
//         <Button variant="outline" className="w-full" onClick={onShowVendorForm}>
//           Register Vendor
//         </Button>
//       </Card>

//       <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//         <div className="flex items-center gap-3 mb-4">
//           <MessageSquare className="h-6 w-6 text-orange-500" />
//           <h3 className="text-lg font-semibold">Complaints</h3>
//         </div>
//         <p className="text-gray-600 mb-4">
//           Manage and track complaints
//         </p>
//         <Button variant="outline" className="w-full" onClick={onShowComplaints}>
//           View Complaints
//         </Button>
//       </Card>

//       {isSuperAdmin && (
//         <Card className="p-6 glass-card fade-in hover:shadow-xl transition-shadow">
//           <div className="flex items-center gap-3 mb-4">
//             <UserPlus className="h-6 w-6 text-indigo-500" />
//             <h3 className="text-lg font-semibold">Create User</h3>
//           </div>
//           <p className="text-gray-600 mb-4">
//             Register new users in the system
//           </p>
//           <Button variant="outline" className="w-full" onClick={handleCreateUser}>
//             Create User
//           </Button>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default QuickActions;



