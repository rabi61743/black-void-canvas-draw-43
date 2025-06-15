
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { Status } from './types';

interface ProjectHeaderProps {
  projectTitle: string;
  projectStatus: Status;
  onGoBack: () => void;
  onStatusChange: (newStatus: Status) => Promise<void>;
}

export function ProjectHeader({ 
  projectTitle, 
  projectStatus, 
  onGoBack, 
  onStatusChange 
}: ProjectHeaderProps) {
  return (
    <>
      <header className="w-full h-[78px] border-b border-gray-300 flex items-center px-8 justify-between">
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Projects</span>
        </Button>
        <h1 className="font-semibold text-4xl text-black">External Agency</h1>
      </header>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-semibold text-[#333333] mb-2">
            {projectTitle || "Project Name"}
          </h2>
          <p className="text-xl text-[#333333]">
            Discussion on {projectTitle || "Project Name"}
          </p>
        </div>
        <StatusDropdown 
          status={projectStatus} 
          onStatusChange={onStatusChange}
        />
      </div>
    </>
  );
}
