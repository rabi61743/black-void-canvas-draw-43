import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterDropdownProps {
  type: "status" | "filter";
  onSelect: (value: string) => void;
  value: string;
}

export function FilterDropdown({ type, onSelect, value }: FilterDropdownProps) {
  const icon =
    type === "status" ? (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.875 7.85217L9.25 4.92609L10.3 3.75565L11.875 5.5113L15.025 2L16.075 3.17043L11.875 7.85217ZM7.75 4.50807H1V6.18012H7.75V4.50807ZM15.25 9.85863L14.2 8.6882L12.25 10.8619L10.3 8.6882L9.25 9.85863L11.2 12.0323L9.25 14.206L10.3 15.3764L12.25 13.2027L14.2 15.3764L15.25 14.206L13.3 12.0323L15.25 9.85863ZM7.75 11.1963H1V12.8683H7.75V11.1963Z"
          fill="#111827"
        />
      </svg>
    ) : (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 15L6.75 15.75V9.375L3.39 5.679C3.13909 5.40294 3.00004 5.0433 3 4.67025V3H15V4.629C14.9999 5.02679 14.8418 5.40826 14.5605 5.6895L11.25 9V11.25M14.25 12V16.5M14.25 16.5L16.5 14.25M14.25 16.5L12 14.25"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className="flex items-center gap-2.5 border bg-white p-2.5 rounded-[5px] border-solid border-[#6E7E92]">
        {icon}
        <SelectValue placeholder={type === "status" ? "Status" : "Filters"} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {type === "status" ? (
          <>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </>
        ) : (
          <>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
