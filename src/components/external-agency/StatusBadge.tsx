
import { cn } from "@/lib/utils";

type Status = "approved" | "pending" | "rejected";

interface StatusBadgeProps {
  status: Status;
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

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div className="relative w-20 h-[30px]">
      <div className={cn(
        "absolute w-20 h-[30px] border rounded-[23px] border-solid flex items-center justify-center",
        statusStyles[status]
      )}>
        <span className="text-xs">{statusLabels[status]}</span>
      </div>
    </div>
  );
}
