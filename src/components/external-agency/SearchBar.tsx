
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBar({ onSearch, initialValue = "" }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(initialValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  // Clear button functionality
  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };

  return (
    <div className="flex items-center w-[735px] border bg-white px-[30px] py-2 rounded-[5px] border-solid border-[#6E7E92] max-md:w-full max-sm:w-full">
      <div className="flex items-center gap-2 w-full">
        <Search className="h-5 w-5 text-[#9CA3AF]" />
        <Input
          type="text"
          placeholder="Search projects by initial letters..."
          value={searchValue}
          onChange={handleSearchChange}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#9CA3AF]"
        />
        {searchValue && (
          <button 
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
