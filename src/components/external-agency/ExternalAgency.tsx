// // frontend/src/ExternalAgency.tsx
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { SearchBar } from "./SearchBar";
// import { FilterDropdown } from "./FilterDropdown";
// import { ProjectCard } from "./ProjectCard";
// import { AddProjectForm } from "./AddProjectForm";
// import { ProjectDetail } from "./ProjectDetail";
// import { useToast } from "@/hooks/use-toast";
// import { ChevronLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { projectsApi } from "@/services/api";

// interface Document {
//   id: string;
//   name: string;
//   url?: string;
// }

// interface Project {
//   id: string;
//   title: string;
//   status: "approved" | "pending" | "rejected";
//   date: string;
//   one_line_description: string;
//   document_count: number;
//   documents?: Document[];
// }

// export function ExternalAgency() {
//   const [isAddFormOpen, setIsAddFormOpen] = useState(false);
//   const [selectedProject, setSelectedProject] = useState<any>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [sortFilter, setSortFilter] = useState("default");
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const fetchProjects = async () => {
//     setLoading(true);
//     try {
//       const response = await projectsApi.getAll(searchQuery, statusFilter, sortFilter);
//       setProjects(response.data);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to fetch projects",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, [searchQuery, statusFilter, sortFilter]);

//   const handleFormSubmit = async (values: any) => {
//     try {
//       const formattedValues = {
//         title: values.projectName,
//         one_line_description: values.oneLineDescription,
//         description: values.description,
//         program: values.program,
//         start_date: values.startDate.toISOString().split('T')[0],
//         deadline_date: values.deadlineDate.toISOString().split('T')[0],
//         identification_no: values.identification_no,
//         selected_contractor: values.selected_contractor,
//         remarks: values.remarks || "",
//         procurement_plan: values.procurement_plan
//       };
      
//       const response = await projectsApi.create(formattedValues);
//       console.log("Project creation response:", response.data);

//       if (!response.data.id) {
//         throw new Error("Project creation failed - no project ID returned");
//       }

//       const projectId = response.data.id;
      
//       if (!projectId) {
//         throw new Error("Failed to get project ID from the response");
//       }

//       if (values.attachments && values.attachments.length > 0) {
//         const files = values.attachments.map((attachment: any) => attachment.file);
//         await projectsApi.uploadDocuments(projectId, files);
//       }
      
//       fetchProjects();
      
//       setIsAddFormOpen(false);
      
//       toast({
//         title: "Project submitted",
//         description: "Your project has been submitted and is pending approval."
//       });
//     } catch (error) {
//       console.error("Error submitting project:", error);
//       toast({
//         title: "Error",
//         description: "Failed to create project. Please check server logs for details.",
//         variant: "destructive",
//       });
//     }
//   };
  
//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//   };

//   const filteredAndSortedProjects = projects
//     .filter((project) => {
//       if (searchQuery.trim()) {
//         const searchStr = searchQuery.toLowerCase().trim();
//         if (!project.title.toLowerCase().startsWith(searchStr)) {
//           return false;
//         }
//       }

//       if (statusFilter !== "all") {
//         return project.status === statusFilter;
//       }

//       return true;
//     })
//     .sort((a, b) => {
//       switch (sortFilter) {
//         case "newest":
//           return new Date(b.date).getTime() - new Date(a.date).getTime();
//         case "oldest":
//           return new Date(a.date).getTime() - new Date(b.date).getTime();
//         case "name":
//           return a.title.localeCompare(b.title);
//         default:
//           return 0;
//       }
//     });

//   useEffect(() => {
//     if (searchQuery.trim() && filteredAndSortedProjects.length === 0) {
//       toast({
//         title: "No results found",
//         description: `No projects match "${searchQuery}"`,
//       });
//     }
//   }, [searchQuery, filteredAndSortedProjects.length, toast]);

//   if (selectedProject) {
//     return (
//       <div className="max-w-[1400px] mx-auto bg-white">
//         <header className="w-full h-[78px] border-b border-gray-300 flex items-center justify-between px-8">
//           <Button 
//             variant="ghost" 
//             onClick={() => setSelectedProject(null)}
//             className="flex items-center gap-2"
//           >
//             <ChevronLeft className="h-5 w-5" />
//             <span>Back to Projects</span>
//           </Button>
//           <h1 className="font-semibold text-4xl text-black">External Agency</h1>
//         </header>
//         <main className="p-8 pt-16">
//           <ProjectDetail project={selectedProject} />
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-[1400px] mx-auto bg-white">
//       <header className="w-full h-[78px] border-b border-gray-300 flex items-center justify-center px-8">
//         <h1 className="font-semibold text-4xl text-black">External Agency</h1>
//       </header>

//       <main className="p-8 pt-16">
//         <div className="flex justify-between items-center w-full border border-gray-300 bg-[#F6FAFE] px-10 py-[35px] rounded-[10px] border-solid">
//           <h2 className="font-semibold text-4xl text-black">
//             External Agency
//           </h2>
//           <Button 
//             className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
//             onClick={() => setIsAddFormOpen(true)}
//           >
//             Add
//             <svg
//               width="23"
//               height="23"
//               viewBox="0 0 23 23"
//               fill="currentColor"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M11.1429 12.8571H6.85715C6.61429 12.8571 6.41086 12.7749 6.24686 12.6103C6.08286 12.4457 6.00057 12.2423 6 12C5.99943 11.7577 6.08172 11.5543 6.24686 11.3897C6.412 11.2251 6.61543 11.1429 6.85715 11.1429H11.1429V6.85715C11.1429 6.61429 11.2251 6.41086 11.3897 6.24686C11.5543 6.08286 11.7577 6.00057 12 6C12.2423 5.99943 12.446 6.08172 12.6111 6.24686C12.7763 6.412 12.8583 6.61543 12.8571 6.85715V11.1429H17.1429C17.3857 11.1429 17.5894 11.2251 17.754 11.3897C17.9186 11.5543 18.0006 11.7577 18 12C17.9994 12.2423 17.9171 12.446 17.7531 12.6111C17.5891 12.7763 17.3857 12.8583 17.1429 12.8571H12.8571V17.1429C12.8571 17.3857 12.7749 17.5894 12.6103 17.754C12.4457 17.9186 12.2423 18.0006 12 18C11.7577 17.9994 11.5543 17.9171 11.3897 17.7531C11.2251 17.5891 11.1429 17.3857 11.1429 17.1429V12.8571Z"
//                 fill="currentColor"
//               />
//             </svg>
//           </Button>
//         </div>

//         <div className="flex justify-between items-center w-full mt-6 mb-8">
//           <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
//           <div className="flex items-center gap-5">
//             <FilterDropdown 
//               type="status" 
//               onSelect={setStatusFilter} 
//               value={statusFilter}
//             />
//             <FilterDropdown 
//               type="filter" 
//               onSelect={setSortFilter} 
//               value={sortFilter}
//             />
//           </div>
//         </div>

//         <section className="grid gap-5">
//           {filteredAndSortedProjects.length > 0 ? (
//             filteredAndSortedProjects.map((project, index) => (
//               <ProjectCard
//                 key={project.id || index}
//                 id={project.id}
//                 title={project.title}
//                 status={project.status}
//                 date={project.date}
//                 description={project.one_line_description}
//                 documentCount={project.document_count}
//                 documents={project.documents}
//                 onClick={() => {
//                   projectsApi.getById(project.id)
//                     .then(response => {
//                       setSelectedProject(response.data);
//                     })
//                     .catch(error => {
//                       toast({
//                         title: "Error",
//                         description: "Failed to load project details",
//                         variant: "destructive",
//                       });
//                     });
//                 }}
//               />
//             ))
//           ) : (
//             searchQuery.trim() ? (
//               <div className="w-full p-10 text-center bg-white border border-gray-200 rounded-md">
//                 <p className="text-gray-500">No projects found matching "{searchQuery}"</p>
//                 <Button 
//                   variant="outline" 
//                   className="mt-4"
//                   onClick={() => {
//                     setSearchQuery("");
//                     setStatusFilter("all");
//                     setSortFilter("default");
//                   }}
//                 >
//                   Clear Filters
//                 </Button>
//               </div>
//             ) : (
//               <div className="w-full p-10 text-center bg-white border border-gray-200 rounded-md">
//                 <p className="text-gray-500">No projects available</p>
//               </div>
//             )
//           )}
//         </section>
//       </main>

//       <AddProjectForm 
//         open={isAddFormOpen}
//         onOpenChange={setIsAddFormOpen}
//         onSubmit={handleFormSubmit}
//       />
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";
import { FilterDropdown } from "./FilterDropdown";
import { ProjectCard } from "./ProjectCard";
import { AddProjectForm } from "./AddProjectForm";
import { ProjectDetail } from "./ProjectDetail";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "@/services/api";

interface Document {
  id: string;
  name: string;
  url?: string;
}

interface Project {
  id: string;
  title: string;
  status: "approved" | "pending" | "rejected";
  date: string;
  one_line_description: string;
  document_count: number;
  documents?: Document[];
}

export function ExternalAgency() {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("default");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectsApi.getAll(searchQuery, statusFilter, sortFilter);
      console.log("API Response:", response.data); // Debug log
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter, sortFilter]);

  const handleFormSubmit = async (values: any) => {
    try {
      const formattedValues = {
        title: values.projectName,
        one_line_description: values.oneLineDescription,
        description: values.description,
        program: values.program,
        start_date: values.startDate.toISOString().split('T')[0],
        deadline_date: values.deadlineDate.toISOString().split('T')[0],
        identification_no: values.identification_no,
        selected_contractor: values.selected_contractor,
        remarks: values.remarks || "",
        procurement_plan: values.procurement_plan
      };
      
      const response = await projectsApi.create(formattedValues);
      console.log("Project creation response:", response.data);

      if (!response.data.id) {
        throw new Error("Project creation failed - no project ID returned");
      }

      const projectId = response.data.id;
      
      if (!projectId) {
        throw new Error("Failed to get project ID from the response");
      }

      if (values.attachments && values.attachments.length > 0) {
        const files = values.attachments.map((attachment: any) => attachment.file);
        await projectsApi.uploadDocuments(projectId, files);
      }
      
      fetchProjects();
      
      setIsAddFormOpen(false);
      
      toast({
        title: "Project submitted",
        description: "Your project has been submitted and is pending approval."
      });
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please check server logs for details.",
        variant: "destructive",
      });
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredAndSortedProjects = projects
    .filter((project) => {
      if (searchQuery.trim()) {
        const searchStr = searchQuery.toLowerCase().trim();
        if (!project.title.toLowerCase().startsWith(searchStr)) {
          return false;
        }
      }

      if (statusFilter !== "all") {
        return project.status === statusFilter;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortFilter) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (searchQuery.trim() && filteredAndSortedProjects.length === 0) {
      toast({
        title: "No results found",
        description: `No projects match "${searchQuery}"`,
      });
    }
  }, [searchQuery, filteredAndSortedProjects.length, toast]);

  if (selectedProject) {
    return (
      <div className="max-w-[1400px] mx-auto bg-white">
        <header className="w-full h-[78px] border-b border-gray-300 flex items-center justify-between px-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Projects</span>
          </Button>
          <h1 className="font-semibold text-4xl text-black">External Agency</h1>
        </header>
        <main className="p-8 pt-16">
          <ProjectDetail project={selectedProject} />
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto bg-white">
      <header className="w-full h-[78px] border-b border-gray-300 flex items-center justify-center px-8">
        <h1 className="font-semibold text-4xl text-black">External Agency</h1>
      </header>

      <main className="p-8 pt-16">
        <div className="flex justify-between items-center w-full border border-gray-300 bg-[#F6FAFE] px-10 py-[35px] rounded-[10px] border-solid">
          <h2 className="font-semibold text-4xl text-black">
            External Agency
          </h2>
          <Button 
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
            onClick={() => setIsAddFormOpen(true)}
          >
            Add
            <svg
              width="23"
              height="23"
              viewBox="0 0 23 23"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.1429 12.8571H6.85715C6.61429 12.8571 6.41086 12.7749 6.24686 12.6103C6.08286 12.4457 6.00057 12.2423 6 12C5.99943 11.7577 6.08172 11.5543 6.24686 11.3897C6.412 11.2251 6.61543 11.1429 6.85715 11.1429H11.1429V6.85715C11.1429 6.61429 11.2251 6.41086 11.3897 6.24686C11.5543 6.08286 11.7577 6.00057 12 6C12.2423 5.99943 12.446 6.08172 12.6111 6.24686C12.7763 6.412 12.8583 6.61543 12.8571 6.85715V11.1429H17.1429C17.3857 11.1429 17.5894 11.2251 17.754 11.3897C17.9186 11.5543 18.0006 11.7577 18 12C17.9994 12.2423 17.9171 12.446 17.7531 12.6111C17.5891 12.7763 17.3857 12.8583 17.1429 12.8571H12.8571V17.1429C12.8571 17.3857 12.7749 17.5894 12.6103 17.754C12.4457 17.9186 12.2423 18.0006 12 18C11.7577 17.9994 11.5543 17.9171 11.3897 17.7531C11.2251 17.5891 11.1429 17.3857 11.1429 17.1429V12.8571Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </div>

        <div className="flex justify-between items-center w-full mt-6 mb-8">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          <div className="flex items-center gap-5">
            <FilterDropdown 
              type="status" 
              onSelect={setStatusFilter} 
              value={statusFilter}
            />
            <FilterDropdown 
              type="filter" 
              onSelect={setSortFilter} 
              value={sortFilter}
            />
          </div>
        </div>

        <section className="grid gap-5">
          {filteredAndSortedProjects.length > 0 ? (
            filteredAndSortedProjects.map((project, index) => (
              <ProjectCard
                key={project.id || index}
                id={project.id}
                title={project.title}
                status={project.status}
                date={project.date}
                description={project.one_line_description}
                documentCount={project.document_count}
                documents={project.documents}
                onClick={() => {
                  projectsApi.getById(project.id)
                    .then(response => {
                      setSelectedProject(response.data);
                    })
                    .catch(error => {
                      toast({
                        title: "Error",
                        description: "Failed to load project details",
                        variant: "destructive",
                      });
                    });
                }}
              />
            ))
          ) : (
            searchQuery.trim() ? (
              <div className="w-full p-10 text-center bg-white border border-gray-200 rounded-md">
                <p className="text-gray-500">No projects found matching "{searchQuery}"</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSortFilter("default");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="w-full p-10 text-center bg-white border border-gray-200 rounded-md">
                <p className="text-gray-500">No projects available</p>
              </div>
            )
          )}
        </section>
      </main>

      <AddProjectForm 
        open={isAddFormOpen}
        onOpenChange={setIsAddFormOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}