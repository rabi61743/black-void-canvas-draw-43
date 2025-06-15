
import { useState } from "react";
import { Check, ChevronDown, Loader } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Status } from "./types";

interface StatusDropdownProps {
  status: Status;
  onStatusChange: (status: Status) => Promise<void>;
  disabled?: boolean;
}

const statusStyles = {
  approved: "bg-[#DAFBE1] border-[#1A7F37] text-black",
  pending: "bg-[#FAFBDA] border-[#F7FF00] text-black",
  rejected: "bg-[#CD9284] border-[#E45735] text-black",
};

const statusLabels = {
  approved: "Approve",
  pending: "Pending",
  rejected: "Rejected",
};

export function StatusDropdown({ status, onStatusChange, disabled = false }: StatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status>(status);

  const handleValueChange = async (newStatus: Status) => {
    if (newStatus === currentStatus || disabled) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
      setCurrentStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative min-w-[120px]">
      <Select 
        value={currentStatus} 
        onValueChange={(value) => handleValueChange(value as Status)}
        disabled={isUpdating || disabled}
      >
        <SelectTrigger 
          className={cn(
            "border rounded-full py-1 px-6 w-full",
            statusStyles[currentStatus],
            "focus:ring-0 focus:ring-offset-0",
            "hover:bg-opacity-90"
          )}
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              {isUpdating ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : null}
              <span>{statusLabels[currentStatus]}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem 
            value="approved" 
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#1A7F37]" />
            <span>Approve</span>
          </SelectItem>
          <SelectItem 
            value="pending"
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#F7FF00]" />
            <span>Pending</span>
          </SelectItem>
          <SelectItem 
            value="rejected"
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#E45735]" />
            <span>Rejected</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
