// ProcurementPlanView.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProcurementPlan } from "@/types/procurement-plan";
import { format } from 'date-fns';
import { 
  Users, 
  FileText, 
  Search, 
  Building2, 
  FileCheck,
  MessageSquare,
  Clock,
  AlertCircle,
  ChevronRight,
  UserPlus 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { projectsApi } from '@/services/api';

interface ProcurementPlanViewProps {
  open: boolean;
  onClose: () => void;
  plan: ProcurementPlan;
}

interface Document {
  id: string;
  name: string;
  url?: string;
}

interface Complaint {
  id: string;
  content: string;
  author: string;
  role: string;
  date: string;
  created_at: string;
  attachments?: Document[];
  user_email?: string;
  user_role?: string;
}

const ProcurementPlanView: React.FC<ProcurementPlanViewProps> = ({ open, onClose, plan }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  useEffect(() => {
    console.log('Plan data:', plan);
    const fetchComplaints = async () => {
      if (!plan.id) return;
      setLoadingComplaints(true);
      try {
        const response = await projectsApi.getById(plan.id.toString());
        const mappedComplaints = (response.data.comments || []).map((comment: any) => ({
          ...comment,
          attachments: comment.attachments ? comment.attachments.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url
          })) : undefined
        }));
        setComplaints(mappedComplaints);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load complaints for status.",
          variant: "destructive",
        });
        console.error("Error fetching complaints:", error);
      } finally {
        setLoadingComplaints(false);
      }
    };

    if (open) fetchComplaints();
  }, [open, plan, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isValidDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const formatDate = (dateStr: string | undefined | null) => {
    return isValidDate(dateStr) ? format(new Date(dateStr), 'PPP') : 'N/A';
  };

  const handleNavigate = (path: string, requiresCommittee: boolean = false, project?: any) => {
    if (requiresCommittee && !plan.committee) {
      toast({
        title: "Committee Required",
        description: "Please form a committee first before accessing this section.",
        variant: "destructive",
      });
      navigate(`/committee/create?procurement_plan_id=${plan.id}`);
      return;
    }
    onClose();
    navigate(path, { state: { project } });
  };

  const projectSections = [
    {
      title: "Committee",
      icon: plan.committee ? Users : UserPlus,
      status: plan.committee ? "View Committee" : "Formation Required",
      statusColor: plan.committee ? "text-green-600" : "text-yellow-600",
      path: plan.committee ? `/committees/${plan.committee._id}` : `/committee/create?procurement_plan_id=${plan.id}`,
      requiresCommittee: false
    },
    {
      title: "Specification",
      icon: FileText,
      status: "Draft",
      statusColor: "text-blue-600",
      path: `/specification/${plan.id}`,
      requiresCommittee: true
    },
    {
      title: "Review",
      icon: Search,
      status: "Not Started",
      statusColor: "text-gray-600",
      path: `/review/${plan.id}`,
      requiresCommittee: true
    },
    {
      title: "Tender",
      icon: Building2,
      status: "Not Created",
      statusColor: "text-gray-600",
      path: `/tender/${plan.id}`,
      requiresCommittee: true
    },
    {
      title: "Evaluation",
      icon: FileCheck,
      status: "Pending",
      statusColor: "text-gray-600",
      path: `/evaluation/${plan.id}`,
      requiresCommittee: true
    },
    {
      title: "External Agency",
      icon: MessageSquare,
      status: loadingComplaints ? "Loading..." : complaints.length === 0 ? "No Complaints" : `${complaints.length} Complaint${complaints.length > 1 ? 's' : ''}`,
      statusColor: loadingComplaints ? "text-gray-600" : complaints.length === 0 ? "text-green-600" : "text-orange-600",
      path: `/project/${plan.id}`,
      requiresCommittee: true,
      project: {
        id: plan.id.toString(),
        title: plan.project_name,
        status: "pending",
        one_line_description: "",
        document_count: 0,
        date: plan.created_at,
        description: "",
        program: "",
        start_date_formatted: "",
        identification_no: "",
        deadline_date_formatted: "",
        selected_contractor: "",
        remarks: "",
        created_by_email: "",
        created_by_role: "",
        procurement_plan: plan
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full md:max-w-4xl lg:max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Procurement Plan Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Clock className="h-4 w-4" />
              <span>Project Timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">Planning Phase</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className={plan.committee ? "text-green-600 font-medium" : "text-gray-400"}>
                {plan.committee ? "Committee Formed" : "Committee Formation"}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Specification</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Tender</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Policy Number</h3>
                <p className="text-gray-700">{plan.policy_number}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Department</h3>
                <p className="text-gray-700">{plan.department}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Project Name</h3>
                <p className="text-gray-700">{plan.project_name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Created At</h3>
                <p className="text-gray-700">{formatDate(plan.created_at)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Estimated Cost</h3>
                <p className="text-gray-700">NPR {formatCurrency(plan.estimated_cost)}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Proposed Budget</h3>
                <p className="text-gray-700">NPR {formatCurrency(plan.budget)}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Budget Percentage</h3>
                <p className="text-gray-700">{plan.proposed_budget_percentage}%</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Committee</h3>
                {plan.committee ? (
                  <div>
                    <p className="text-gray-700">
                      {plan.committee.name} ({plan.committee.committee_type})
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => handleNavigate(`/committees/${plan.committee._id}`)}
                    >
                      View Committee Details
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700">No committee assigned</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => handleNavigate(`/committee/create?procurement_plan_id=${plan.id}`)}
                    >
                      Create Committee
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Project Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectSections.map((section) => (
                <button
                  key={section.title}
                  onClick={() => handleNavigate(section.path, section.requiresCommittee, section.project)}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="h-5 w-5 text-gray-500" />
                    <div className="text-left">
                      <h4 className="font-medium">{section.title}</h4>
                      <p className={`text-sm ${section.statusColor}`}>{section.status}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="font-medium">
                  {!plan.committee 
                    ? "Committee Formation Required"
                    : "Upcoming Deadline"}
                </h4>
                <p className="text-sm">
                  {!plan.committee 
                    ? "Please form a committee to proceed with other sections"
                    : "Committee formation deadline in 5 days"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quarterly Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plan.quarterly_targets.map((target) => (
                <div key={target.id} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{target.quarter}</h4>
                  <p className="text-sm text-gray-600 mb-2">{target.target_details || "No details provided"}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    target.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    target.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {target.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcurementPlanView;


// import React, { useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { ProcurementPlan } from "@/types/procurement-plan";
// import { format } from 'date-fns';
// import { 
//   Users, 
//   FileText, 
//   Search, 
//   Building2, 
//   FileCheck,
//   MessageSquare,
//   Clock,
//   AlertCircle,
//   ChevronRight,
//   UserPlus 
// } from "lucide-react";
// import { useNavigate } from 'react-router-dom';
// import { useToast } from "@/hooks/use-toast";

// interface ProcurementPlanViewProps {
//   open: boolean;
//   onClose: () => void;
//   plan: ProcurementPlan;
// }

// const ProcurementPlanView: React.FC<ProcurementPlanViewProps> = ({ open, onClose, plan }) => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
  
//   useEffect(() => {
//     console.log('Plan data:', plan);
//   }, [plan]);

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-NP', {
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const isValidDate = (dateStr: string | undefined | null) => {
//     if (!dateStr) return false;
//     const date = new Date(dateStr);
//     return !isNaN(date.getTime());
//   };

//   const formatDate = (dateStr: string | undefined | null) => {
//     return isValidDate(dateStr) ? format(new Date(dateStr), 'PPP') : 'N/A';
//   };

//   const handleNavigate = (path: string, requiresCommittee: boolean = false) => {
//     if (requiresCommittee && !plan.committee) {
//       toast({
//         title: "Committee Required",
//         description: "Please form a committee first before accessing this section.",
//         variant: "destructive",
//       });
//       navigate(`/committee/create?procurement_plan_id=${plan.id}`);
//       return;
//     }
//     onClose();
//     navigate(path);
//   };

//   const projectSections = [
//     {
//       title: "Committee",
//       icon: plan.committee ? Users : UserPlus,
//       status: plan.committee ? "View Committee" : "Formation Required",
//       statusColor: plan.committee ? "text-green-600" : "text-yellow-600",
//       path: plan.committee ? `/committees/${plan.committee._id}` : `/committee/create?procurement_plan_id=${plan.id}`,
//       requiresCommittee: false
//     },
//     {
//       title: "Specification",
//       icon: FileText,
//       status: "Draft",
//       statusColor: "text-blue-600",
//       path: `/specification/${plan.id}`,
//       requiresCommittee: true
//     },
//     {
//       title: "Review",
//       icon: Search,
//       status: "Not Started",
//       statusColor: "text-gray-600",
//       path: `/review/${plan.id}`,
//       requiresCommittee: true
//     },
//     {
//       title: "Tender",
//       icon: Building2,
//       status: "Not Created",
//       statusColor: "text-gray-600",
//       path: `/tender/${plan.id}`,
//       requiresCommittee: true
//     },
//     {
//       title: "Evaluation",
//       icon: FileCheck,
//       status: "Pending",
//       statusColor: "text-gray-600",
//       path: `/evaluation/${plan.id}`,
//       requiresCommittee: true
//     },
//     {
//       title: "Complaints",
//       icon: MessageSquare,
//       status: "No Complaints",
//       statusColor: "text-green-600",
//       path: `/complaints/${plan.id}`,
//       requiresCommittee: true
//     }
//   ];

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-[95vw] w-full md:max-w-4xl lg:max-w-6xl h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>View Procurement Plan Details</DialogTitle>
//         </DialogHeader>
        
//         <div className="space-y-6">
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
//               <Clock className="h-4 w-4" />
//               <span>Project Timeline</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-green-600 font-medium">Planning Phase</span>
//               <ChevronRight className="h-4 w-4 text-gray-400" />
//               <span className={plan.committee ? "text-green-600 font-medium" : "text-gray-400"}>
//                 {plan.committee ? "Committee Formed" : "Committee Formation"}
//               </span>
//               <ChevronRight className="h-4 w-4 text-gray-400" />
//               <span className="text-gray-400">Specification</span>
//               <ChevronRight className="h-4 w-4 text-gray-400" />
//               <span className="text-gray-400">Tender</span>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold mb-1">Policy Number</h3>
//                 <p className="text-gray-700">{plan.policy_number}</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-1">Department</h3>
//                 <p className="text-gray-700">{plan.department}</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-1">Project Name</h3>
//                 <p className="text-gray-700">{plan.project_name}</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-1">Created At</h3>
//                 <p className="text-gray-700">{formatDate(plan.created_at)}</p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold mb-1">Estimated Cost</h3>
//                 <p className="text-gray-700">NPR {formatCurrency(plan.estimated_cost)}</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-1">Proposed Budget</h3>
//                 <p className="text-gray-700">NPR {formatCurrency(plan.budget)}</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-1">Budget Percentage</h3>
//                 <p className="text-gray-700">{plan.proposed_budget_percentage}%</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-1">Committee</h3>
//                 {plan.committee ? (
//                   <div>
//                     <p className="text-gray-700">
//                       {plan.committee.name} ({plan.committee.committee_type})
//                     </p>
//                     <Button 
//                       variant="link" 
//                       className="p-0 h-auto text-blue-600"
//                       onClick={() => handleNavigate(`/committees/${plan.committee._id}`)}
//                     >
//                       View Committee Details
//                     </Button>
//                   </div>
//                 ) : (
//                   <div>
//                     <p className="text-gray-700">No committee assigned</p>
//                     <Button 
//                       variant="link" 
//                       className="p-0 h-auto text-blue-600"
//                       onClick={() => handleNavigate(`/committee/create?procurement_plan_id=${plan.id}`)}
//                     >
//                       Create Committee
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3 className="font-semibold mb-4">Project Sections</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {projectSections.map((section) => (
//                 <button
//                   key={section.title}
//                   onClick={() => handleNavigate(section.path, section.requiresCommittee)}
//                   className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex items-center gap-3">
//                     <section.icon className="h-5 w-5 text-gray-500" />
//                     <div className="text-left">
//                       <h4 className="font-medium">{section.title}</h4>
//                       <p className={`text-sm ${section.statusColor}`}>{section.status}</p>
//                     </div>
//                   </div>
//                   <ChevronRight className="h-4 w-4 text-gray-400" />
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//             <div className="flex items-center gap-2 text-orange-700">
//               <AlertCircle className="h-5 w-5" />
//               <div>
//                 <h4 className="font-medium">
//                   {!plan.committee 
//                     ? "Committee Formation Required"
//                     : "Upcoming Deadline"}
//                 </h4>
//                 <p className="text-sm">
//                   {!plan.committee 
//                     ? "Please form a committee to proceed with other sections"
//                     : "Committee formation deadline in 5 days"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3 className="font-semibold mb-4">Quarterly Targets</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {plan.quarterly_targets.map((target) => (
//                 <div key={target.id} className="p-4 bg-gray-50 rounded-lg">
//                   <h4 className="font-medium mb-2">{target.quarter}</h4>
//                   <p className="text-sm text-gray-600 mb-2">{target.target_details || "No details provided"}</p>
//                   <span className={`text-xs font-medium px-2 py-1 rounded ${
//                     target.status === 'Completed' ? 'bg-green-100 text-green-800' :
//                     target.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
//                     'bg-gray-100 text-gray-800'
//                   }`}>
//                     {target.status}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="mt-6">
//           <Button onClick={onClose}>Close</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ProcurementPlanView;



