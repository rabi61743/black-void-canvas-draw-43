
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from "./StatusBadge";
import { DocumentList } from "./DocumentList";

interface ProjectCardProps {
  id: string;
  title: string;
  status: "approved" | "pending" | "rejected";
  date: string;
  description: string;
  documentCount: number;
  documents?: any[]; // Add documents as optional prop
  isNew?: boolean;
  onClick?: () => void;
}

export function ProjectCard({
  id,
  title,
  status,
  date,
  description,
  documentCount,
  documents = [], // Default to empty array
  isNew = false,
  onClick,
}: ProjectCardProps) {
  const navigate = useNavigate();

  const handleDiscussionClick = () => {
    console.log("Navigating to project discussion with ID:", id, "and status:", status);
    navigate(`/project/${id}`, { 
      state: { 
        project: {
          id: id,
          title,
          status,
          description,
          comments: [] // Initialize with empty comments
        }
      } 
    });
  };

  const handleProjectClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/project-details');
    }
  };

  return (
    <div className="flex flex-col gap-5 border bg-white px-10 py-5 rounded-[10px] border-solid border-[#6E7E92]">
      <div className="flex items-center justify-between gap-[9px] max-md:flex-col max-md:items-start max-sm:flex-col max-sm:items-start">
        <div 
          className="font-normal text-3xl text-gray-900 cursor-pointer hover:underline"
          onClick={handleProjectClick}
        >
          {title}
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="font-normal text-[15px] text-[#606975]">Date: {date}</div>
      <div className="font-normal text-xl text-[#606975]">{description}</div>
      <DocumentList count={documentCount} documents={documents} />
      <div className="flex justify-end">
        <button 
          className="w-[180px] h-10 bg-slate-900 rounded-[27.5px] flex items-center justify-center gap-2 max-sm:w-[150px] max-sm:h-[35px]"
          onClick={handleDiscussionClick}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.45833 0.833344H11.875C12.68 0.833344 13.3333 1.48668 13.3333 2.29168V10.2083C13.3333 10.5951 13.1797 10.9661 12.9062 11.2395C12.6327 11.513 12.2618 11.6667 11.875 11.6667H6.7175L4.5725 13.8108C4.40254 13.9802 4.18627 14.0954 3.95093 14.142C3.7156 14.1885 3.47174 14.1644 3.25009 14.0726C3.02845 13.9808 2.83894 13.8255 2.70546 13.6261C2.57197 13.4268 2.50048 13.1924 2.5 12.9525V11.6667H1.45833C1.07156 11.6667 0.700626 11.513 0.427136 11.2395C0.153645 10.9661 0 10.5951 0 10.2083L0 2.29168C0 1.48668 0.653333 0.833344 1.45833 0.833344Z"
              fill="white"
            />
          </svg>
          <span className="font-normal text-lg text-white">Discussion</span>
        </button>
      </div>
    </div>
  );
}
