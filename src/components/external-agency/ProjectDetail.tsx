import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { DocumentList } from './DocumentList';

interface Document {
  id: string;
  name: string;
  url?: string;
}

interface ProcurementPlan {
  id: number;
  policy_number: string;
  project_name?: string;
}

interface ProjectDetailProps {
  project: {
    title: string;
    status: "approved" | "pending" | "rejected";
    date: string;
    description: string;
    program: string;
    start_date_formatted?: string;
    identification_no: string;
    deadline_date_formatted?: string;
    selected_contractor: string;
    remarks: string;
    documentCount?: number;
    document_count?: number;
    documents?: Document[];
    isNew?: boolean;
    id?: string;
    created_by_email?: string;
    created_by_role?: string;
    procurement_plan?: ProcurementPlan | null; // Allow null explicitly
  };
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const navigate = useNavigate();

  // Enhanced debugging
  console.log("Project Detail Data:", project);
  console.log("Project documents:", project.documents);
  console.log("Procurement Plan Object:", project.procurement_plan);
  if (!project.procurement_plan) {
    console.warn("Procurement plan is undefined or null:", project.procurement_plan);
  } else {
    console.log("Procurement Plan Details:", {
      id: project.procurement_plan.id,
      policy_number: project.procurement_plan.policy_number,
      project_name: project.procurement_plan.project_name,
    });
  }

  const handleDiscussionClick = () => {
    navigate(project.isNew ? '/project-discussion/new' : '/project-discussion/existing', {
      state: {
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          description: project.description,
          comments: []
        }
      }
    });
  };

  const getStatusBadgeStyle = () => {
    switch (project.status) {
      case "approved":
        return "bg-[#DAFBE1] px-4 py-1 rounded-full";
      case "pending":
        return "bg-[#FAFBDA] px-4 py-1 rounded-full";
      case "rejected":
        return "bg-[#CD9284] px-4 py-1 rounded-full";
      default:
        return "bg-[#FAFBDA] px-4 py-1 rounded-full";
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case "approved":
        return "Approve";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const getDocumentCount = () => {
    return project.document_count !== undefined
      ? project.document_count
      : (project.documentCount || 0);
  };

  return (
    <div className="max-w-[1200px] mx-auto bg-white">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-5 bg-white p-10 rounded-[10px] border border-solid border-[#6E7E92]">
          <div className="flex items-center justify-between gap-[9px]">
            <h2 className="text-3xl text-[#333333]">{project.title}</h2>
            <div className={getStatusBadgeStyle()}>{getStatusText()}</div>
          </div>

          <p className="text-[15px] text-[#606975]">Date: {project.date}</p>

          {project.created_by_email && (
            <p className="text-[15px] text-[#606975]">
              Created by: {project.created_by_email}
              {project.created_by_role && <span className="ml-2">({project.created_by_role})</span>}
            </p>
          )}

          <p className="text-xl text-[#606975]">{project.description}</p>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Information</h3>
            <div className="space-y-2">
              <div className="flex"><span className="min-w-[180px]">Program</span><span>: {project.program}</span></div>
              <div className="flex"><span className="min-w-[180px]">Started Date</span><span>: {project.start_date_formatted || "N/A"}</span></div>
              <div className="flex"><span className="min-w-[180px]">Identification No.</span><span>: {project.identification_no}</span></div>
              <div className="flex">
                <span className="min-w-[180px]">Procurement Plan</span>
                <span>: {project.procurement_plan
                  ? `${project.procurement_plan.project_name || project.procurement_plan.policy_number} (${project.procurement_plan.policy_number})`
                  : "N/A"}</span>
              </div>
              <div className="flex"><span className="min-w-[180px]">Deadline Date</span><span>: {project.deadline_date_formatted || "N/A"}</span></div>
              <div className="flex"><span className="min-w-[180px]">Selected Contractor</span><span>: {project.selected_contractor}</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Description</h3>
            <p className="text-[#606975] whitespace-pre-wrap">{project.description}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Documents Required</h3>
            {getDocumentCount() > 0 && project.documents?.length ? (
              <DocumentList
                count={getDocumentCount()}
                documents={project.documents}
              />
            ) : (
              <p className="text-[#606975]">No documents uploaded</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Remarks</h3>
            <p className="text-[#606975] whitespace-pre-wrap">{project.remarks}</p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleDiscussionClick}
              className="flex items-center gap-2 bg-[#1A1F2C] text-white px-6 py-2 rounded-full"
            >
              <MessageSquare className="h-5 w-5" />
              Discussion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// import { useNavigate } from 'react-router-dom';
// import { MessageSquare } from 'lucide-react';
// import { DocumentList } from './DocumentList';

// interface Document {
//   id: string;
//   name: string;
//   url?: string;
// }

// interface ProcurementPlan {
//   id: number;
//   policy_number: string;
//   project_name?: string;
// }

// interface ProjectDetailProps {
//   project: {
//     title: string;
//     status: "approved" | "pending" | "rejected";
//     date: string;
//     description: string;
//     program: string;
//     start_date_formatted?: string;
//     identification_no: string;
//     deadline_date_formatted?: string;
//     selected_contractor: string;
//     remarks: string;
//     documentCount?: number;
//     document_count?: number;
//     documents?: Document[];
//     isNew?: boolean;
//     id?: string;
//     created_by_email?: string;
//     created_by_role?: string;
//     procurement_plan?: ProcurementPlan;
//   };
// }

// export function ProjectDetail({ project }: ProjectDetailProps) {
//   const navigate = useNavigate();

//   console.log("Project Detail Data:", project);
//   console.log("Project documents:", project.documents);
//   console.log("Procurement Plan:", project.procurement_plan); // Added for debugging

//   const handleDiscussionClick = () => {
//     navigate(project.isNew ? '/project-discussion/new' : '/project-discussion/existing', {
//       state: {
//         project: {
//           id: project.id,
//           title: project.title,
//           status: project.status,
//           description: project.description,
//           comments: []
//         }
//       }
//     });
//   };

//   const getStatusBadgeStyle = () => {
//     switch (project.status) {
//       case "approved":
//         return "bg-[#DAFBE1] px-4 py-1 rounded-full";
//       case "pending":
//         return "bg-[#FAFBDA] px-4 py-1 rounded-full";
//       case "rejected":
//         return "bg-[#CD9284] px-4 py-1 rounded-full";
//       default:
//         return "bg-[#FAFBDA] px-4 py-1 rounded-full";
//     }
//   };

//   const getStatusText = () => {
//     switch (project.status) {
//       case "approved":
//         return "Approve";
//       case "pending":
//         return "Pending";
//       case "rejected":
//         return "Rejected";
//       default:
//         return "Pending";
//     }
//   };

//   const getDocumentCount = () => {
//     return project.document_count !== undefined
//       ? project.document_count
//       : (project.documentCount || 0);
//   };

//   return (
//     <div className="max-w-[1200px] mx-auto bg-white">
//       <div className="p-8 space-y-8">
//         <div className="flex flex-col gap-5 bg-white p-10 rounded-[10px] border border-solid border-[#6E7E92]">
//           <div className="flex items-center justify-between gap-[9px]">
//             <h2 className="text-3xl text-[#333333]">{project.title}</h2>
//             <div className={getStatusBadgeStyle()}>{getStatusText()}</div>
//           </div>

//           <p className="text-[15px] text-[#606975]">Date: {project.date}</p>

//           {project.created_by_email && (
//             <p className="text-[15px] text-[#606975]">
//               Created by: {project.created_by_email}
//               {project.created_by_role && <span className="ml-2">({project.created_by_role})</span>}
//             </p>
//           )}

//           <p className="text-xl text-[#606975]">{project.description}</p>

//           <div className="mt-8">
//             <h3 className="text-xl font-semibold mb-4">Information</h3>
//             <div className="space-y-2">
//               <div className="flex"><span className="min-w-[180px]">Program</span><span>: {project.program}</span></div>
//               <div className="flex"><span className="min-w-[180px]">Started Date</span><span>: {project.start_date_formatted || "N/A"}</span></div>
//               <div className="flex"><span className="min-w-[180px]">Identification No.</span><span>: {project.identification_no}</span></div>
//               <div className="flex">
//                 <span className="min-w-[180px]">Procurement Plan</span>
//                 <span>: {project.procurement_plan && project.procurement_plan.policy_number
//                   ? `${project.procurement_plan.project_name || project.procurement_plan.policy_number} (${project.procurement_plan.policy_number})`
//                   : "N/A"}</span>
//               </div>
//               <div className="flex"><span className="min-w-[180px]">Deadline Date</span><span>: {project.deadline_date_formatted || "N/A"}</span></div>
//               <div className="flex"><span className="min-w-[180px]">Selected Contractor</span><span>: {project.selected_contractor}</span></div>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-xl font-semibold mb-4">Description</h3>
//             <p className="text-[#606975] whitespace-pre-wrap">{project.description}</p>
//           </div>

//           <div>
//             <h3 className="text-xl font-semibold mb-4">Documents Required</h3>
//             {getDocumentCount() > 0 && project.documents?.length ? (
//               <DocumentList
//                 count={getDocumentCount()}
//                 documents={project.documents}
//               />
//             ) : (
//               <p className="text-[#606975]">No documents uploaded</p>
//             )}
//           </div>

//           <div>
//             <h3 className="text-xl font-semibold mb-4">Remarks</h3>
//             <p className="text-[#606975] whitespace-pre-wrap">{project.remarks}</p>
//           </div>

//           <div className="flex justify-end pt-4">
//             <button
//               onClick={handleDiscussionClick}
//               className="flex items-center gap-2 bg-[#1A1F2C] text-white px-6 py-2 rounded-full"
//             >
//               <MessageSquare className="h-5 w-5" />
//               Discussion
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }