// ProjectDiscussion.tsx
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExistingProjectDiscussion } from "@/components/external-agency/ExistingProjectDiscussion";
import { projectsApi } from "@/services/api";

interface Document {
  id: string;
  name: string;
  url?: string;
}

interface Comment {
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

interface ProcurementPlan {
  id: number;
  policy_number: string;
  project_name?: string;
}

interface ProjectDetail {
  id: string;
  title: string;
  status: string;
  description: string;
  program: string;
  start_date: string;
  start_date_formatted: string;
  deadline_date: string;
  deadline_date_formatted: string;
  identification_no: string;
  selected_contractor: string;
  remarks: string;
  documents: Document[];
  comments: Comment[];
  created_by_email?: string;
  created_by_role?: string;
  procurement_plan?: ProcurementPlan;
}

interface Project {
  id: string;
  title: string;
  status: string;
  one_line_description: string;
  document_count: number;
  date: string;
}

export default function ProjectDiscussion() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const hasProjectData = location.state?.project;
  const [project, setProject] = useState<Project | null>(hasProjectData || null);
  const [loading, setLoading] = useState(!hasProjectData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasProjectData || !id) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await projectsApi.getById(id);
        const projectDetail: ProjectDetail = {
          ...response.data,
          documents: response.data.documents.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url
          })),
          comments: response.data.comments.map((comment: any) => ({
            ...comment,
            attachments: comment.attachments ? comment.attachments.map((doc: any) => ({
              id: doc.id,
              name: doc.name,
              url: doc.url
            })) : undefined
          }))
        };
        const mappedProject: Project = {
          id: projectDetail.id,
          title: projectDetail.title,
          status: projectDetail.status,
          one_line_description: projectDetail.description || "",
          document_count: projectDetail.documents?.length || 0,
          date: projectDetail.start_date_formatted || projectDetail.start_date || new Date().toISOString()
        };
        setProject(mappedProject);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load complaint");
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, hasProjectData]);

  if (loading) return <div className="container mx-auto p-4">Loading complaint...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  if (project) {
    return <ExistingProjectDiscussion />;
  }

  return (
    <div className="max-w-[1200px] mx-auto bg-white">
      <header className="w-full h-[78px] border-b border-gray-300 flex items-center px-8">
        <h1 className="font-semibold text-4xl text-black">Complaint</h1>
      </header>

      <div className="p-8">
        <Card className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-semibold text-[#333333] mb-2">Complaint Title</h2>
              <p className="text-xl text-[#333333]">Discussion on Complaint</p>
            </div>
            <div className="bg-[#FAFBDA] text-black px-6 py-1 rounded-full border border-[#F7FF00]">
              Pending
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Start discussion</h3>
            <Card className="p-6 bg-[#F6F8FA]">
              <Textarea
                placeholder="Ask your questions"
                className="min-h-[200px] mb-4 bg-white"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">B</Button>
                  <Button variant="ghost" size="sm">I</Button>
                  <Button variant="ghost" size="sm">U</Button>
                  <Button variant="ghost" size="sm">Link</Button>
                  <Button variant="ghost" size="sm">Image</Button>
                  <Button variant="ghost" size="sm">File</Button>
                  <Button variant="ghost" size="sm">More</Button>
                </div>
                <Button>Comment</Button>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useParams, useLocation } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { ExistingProjectDiscussion } from "@/components/external-agency/ExistingProjectDiscussion";
// import { projectsApi } from "@/services/api";

// interface Project {
//   id: string;
//   title: string;
//   status: string;
//   one_line_description: string;
//   document_count: number;
//   date: string;
// }

// export default function ProjectDiscussion() {
//   const { id } = useParams<{ id: string }>();
//   const location = useLocation();
//   const hasProjectData = location.state?.project;
//   const [project, setProject] = useState<Project | null>(hasProjectData || null);
//   const [loading, setLoading] = useState(!hasProjectData);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (hasProjectData || !id) {
//       setLoading(false);
//       return;
//     }

//     const fetchProject = async () => {
//       try {
//         const response = await projectsApi.getById(id);
//         setProject(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching project:", err);
//         setError("Failed to load complaint");
//         setLoading(false);
//       }
//     };

//     fetchProject();
//   }, [id, hasProjectData]);

//   if (loading) return <div className="container mx-auto p-4">Loading complaint...</div>;
//   if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

//   if (project) {
//     return <ExistingProjectDiscussion />;
//   }

//   return (
//     <div className="max-w-[1200px] mx-auto bg-white">
//       <header className="w-full h-[78px] border-b border-gray-300 flex items-center px-8">
//         <h1 className="font-semibold text-4xl text-black">Complaint</h1>
//       </header>

//       <div className="p-8">
//         <Card className="p-8">
//           <div className="flex justify-between items-start mb-4">
//             <div>
//               <h2 className="text-3xl font-semibold text-[#333333] mb-2">Complaint Title</h2>
//               <p className="text-xl text-[#333333]">Discussion on Complaint</p>
//             </div>
//             <div className="bg-[#FAFBDA] text-black px-6 py-1 rounded-full border border-[#F7FF00]">
//               Pending
//             </div>
//           </div>

//           <div className="mt-8">
//             <h3 className="text-xl font-semibold mb-4">Start discussion</h3>
//             <Card className="p-6 bg-[#F6F8FA]">
//               <Textarea
//                 placeholder="Ask your questions"
//                 className="min-h-[200px] mb-4 bg-white"
//               />
//               <div className="flex justify-between items-center">
//                 <div className="flex gap-2">
//                   <Button variant="ghost" size="sm">B</Button>
//                   <Button variant="ghost" size="sm">I</Button>
//                   <Button variant="ghost" size="sm">U</Button>
//                   <Button variant="ghost" size="sm">Link</Button>
//                   <Button variant="ghost" size="sm">Image</Button>
//                   <Button variant="ghost" size="sm">File</Button>
//                   <Button variant="ghost" size="sm">More</Button>
//                 </div>
//                 <Button>Comment</Button>
//               </div>
//             </Card>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }