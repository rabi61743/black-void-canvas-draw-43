import FormContainer from "./form/FormContainer";
import FormHeader from "./form/FormHeader";
import FormActions from "./form/FormActions";
import BasicInfoFields from "./BasicInfoFields";
import CommitteeMembers from "./CommitteeMembers";
import FileUpload from "./FileUpload";
import { useCommitteeForm } from "@/hooks/useCommitteeForm";
import type { Committee } from "@/types/committee";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Import AuthContext
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";

interface CommitteeFormProps {
  onClose: () => void;
  onCreateCommittee?: (committee: Committee) => void;
  committeeId?: string;
}

const CommitteeForm = ({ onClose, onCreateCommittee, committeeId }: CommitteeFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token from AuthContext
  const [isLoading, setIsLoading] = useState(false);
  const [procurementPlans, setProcurementPlans] = useState<{ id: number; project_name: string }[]>([]);
  const [selectedProcurementPlan, setSelectedProcurementPlan] = useState<string | null>(null);
  const [committeeType, setCommitteeType] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [deadlineDays, setDeadlineDays] = useState<number>(30);

  const filteredProcurementPlans = procurementPlans.filter((plan) =>
    plan.project_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const {
    members,
    formDate,
    selectedFile,
    setMembers,
    setFormDate,
    setSelectedFile,
    name,
    purpose,
    handleAddMember,
    handleUpdateMember,
    setName,
    setPurpose,
    resetForm,
  } = useCommitteeForm(onClose, onCreateCommittee);

  const deadline = formDate ? addDays(new Date(formDate), deadlineDays) : null;

  useEffect(() => {
    if (!token) {
      console.log('No token found, skipping fetchProcurementPlans');
      return; // Prevent API call if no token exists
    }

    const fetchProcurementPlans = async () => {
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`;
        console.log('Fetching procurement plans from:', url);
        console.log('Token used in request:', token); // Debug log to inspect the token
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', response.status, errorText);
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate('/login');
            return;
          }
          throw new Error(`Failed to fetch procurement plans: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await response.text();
          console.error('Unexpected response format:', errorText);
          throw new Error('Response is not JSON');
        }

        const responseData = await response.json();
        console.log('Procurement plans response:', responseData);
        setProcurementPlans(responseData || []);
        console.log('Updated procurementPlans state:', responseData || []);
      } catch (error) {
        console.error("Error fetching procurement plans:", error);
        if (error instanceof Error && !error.message.includes("Please log in again")) {
          toast({
            title: "Error",
            description: "Failed to load procurement plans",
            variant: "destructive",
          });
        }
      }
    };
    fetchProcurementPlans();
  }, [toast, navigate, token]);

  useEffect(() => {
    if (!committeeId || !token) return;

    const fetchCommittee = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${committeeId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch committee');
        }

        const { data } = await response.json();

        setName(data.committee.name);
        setPurpose(data.committee.purpose);
        setCommitteeType(data.committee.committee_type);
        setSelectedProcurementPlan(data.committee.procurement_plan?.toString() || null);
        setFormDate(data.committee.formation_date || '');
        setDeadlineDays(30);
        setMembers(
          (data.committee.membersList || []).map((member: any) => ({
            id: member._id,
            employeeId: member.employeeId,
            name: member.name,
            email: member.email,
            department: member.department || '',
            phone: member.phone || '',
            role: member.role || 'member',
            tasks: member.tasks || [],
            designation: member.designation || '',
          }))
        );

        if (data.committee.formationLetterURL) {
          try {
            const fileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/download-formation-letter/${committeeId}/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (fileResponse.status === 401) {
              toast({
                title: "Session Expired",
                description: "Your session has expired. Please log in again.",
                variant: "destructive",
              });
              navigate('/login');
              return;
            }
            const blob = await fileResponse.blob();
            const file = new File([blob], data.committee.formationLetterURL.split('/').pop() || 'formation_letter.pdf', {
              type: blob.type,
              lastModified: new Date().getTime(),
            });
            setSelectedFile(file);
          } catch (error) {
            console.error('Error fetching file:', error);
            const mockFile = new File([], data.committee.formationLetterURL.split('/').pop() || 'formation_letter.pdf', {
              type: 'application/pdf',
            });
            setSelectedFile(mockFile);
          }
        }
      } catch (error) {
        console.error('Error fetching committee:', error);
        if (error instanceof Error && !error.message.includes("Please log in again")) {
          toast({
            title: "Error",
            description: "Failed to load committee data",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommittee();
  }, [committeeId, toast, setName, setPurpose, setFormDate, setMembers, setSelectedFile, navigate, token]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !purpose || !committeeType) {
      toast({
        title: "Validation Error",
        description: "Name, purpose, and committee type are required",
        variant: "destructive",
      });
      return;
    }

    if (members.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one member is required",
        variant: "destructive",
      });
      return;
    }

    const invalidMembers = members.filter(
      (m) => !m.employeeId || !m.name || !m.email
    );

    if (invalidMembers.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields (Employee ID, Name, Email) for all members",
        variant: "destructive",
      });
      return;
    }

    const employeeIds = members.map((m) => m.employeeId);
    const uniqueEmployeeIds = new Set(employeeIds);
    if (uniqueEmployeeIds.size !== employeeIds.length) {
      toast({
        title: "Validation Error",
        description: "Duplicate employee IDs are not allowed",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("purpose", purpose);
      formData.append("committee_type", committeeType);
      if (selectedProcurementPlan && selectedProcurementPlan !== "none") {
        formData.append("procurement_plan", selectedProcurementPlan);
      }
      if (formDate) formData.append("formation_date", formDate);
      if (deadline) formData.append("deadline", deadline.toISOString().split('T')[0]);
      formData.append("should_notify", "true");
      const membersData = members.map((m) => ({
        employeeId: m.employeeId,
        role: m.role || "member",
      }));
      formData.append("members", JSON.stringify(membersData));
      if (selectedFile) {
        formData.append("formation_letter", selectedFile);
      }

      const endpoint = committeeId
        ? `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/update/${committeeId}/`
        : `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/create/`;
      const method = committeeId ? "PATCH" : "POST";

      console.log("Submitting:", {
        name,
        purpose,
        committee_type: committeeType,
        procurement_plan: selectedProcurementPlan,
        formation_date: formDate,
        deadline,
        members: membersData,
        should_notify: true,
        hasFile: !!selectedFile,
      });

      const response = await fetch(endpoint, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save committee");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: committeeId ? "Committee updated successfully" : "Committee created successfully",
      });

      if (onCreateCommittee) {
        onCreateCommittee(data.committee || data);
      }

      if (!committeeId) {
        resetForm();
      }

      onClose();
    } catch (error) {
      console.error("Error saving committee:", error);
      if (error instanceof Error && !error.message.includes("Please log in again")) {
        toast({
          title: "Error",
          description: error.message || "Failed to save committee",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (index: number) => {
    try {
      if (committeeId && members[index]?.employeeId && token) {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/remove-member/${committeeId}/${members[index].employeeId}/`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate('/login');
            return;
          }
          throw new Error('Failed to remove member');
        }

        setMembers(members.filter((_, i) => i !== index));
        toast({
          title: "Member Removed",
          description: "Committee member has been removed successfully.",
        });
      } else {
        setMembers(members.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error('Error removing member:', error);
      if (error instanceof Error && !error.message.includes("Please log in again")) {
        toast({
          title: "Error",
          description: "Failed to remove committee member",
          variant: "destructive",
        });
      }
    }
  };

  const downloadFormationLetter = async () => {
    if (!committeeId) return;

    try {
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/download-formation-letter/${committeeId}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formation-letter-${committeeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      if (error instanceof Error && !error.message.includes("Please log in again")) {
        toast({
          title: "Error",
          description: "Failed to download formation letter",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="w-full slide-in fade-in">
      <FormHeader onClose={onClose} />

      <form onSubmit={handleFormSubmit} className="space-y-8 mt-6">
        <div className="space-y-6">
          <BasicInfoFields
            name={name}
            purpose={purpose}
            onNameChange={setName}
            onPurposeChange={setPurpose}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Committee Type <span className="text-red-500">*</span>
              </label>
              <Select value={committeeType} onValueChange={setCommitteeType} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select committee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specification">Specification</SelectItem>
                  <SelectItem value="evaluation">Evaluation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procurement Plan
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedProcurementPlan
                      ? procurementPlans.find((plan) => plan.id.toString() === selectedProcurementPlan)?.project_name || "Select procurement plan"
                      : "Select procurement plan"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search procurement plan..."
                      onValueChange={(value) => setSearchInput(typeof value === 'string' ? value : '')}
                    />
                    <CommandEmpty>No procurement plan found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setSelectedProcurementPlan(null);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProcurementPlan === null ? "opacity-100" : "opacity-0"
                          )}
                        />
                        None
                      </CommandItem>
                      {filteredProcurementPlans.map((plan) => (
                        <CommandItem
                          key={plan.id}
                          value={plan.project_name}
                          onSelect={() => {
                            setSelectedProcurementPlan(plan.id.toString());
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProcurementPlan === plan.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {plan.project_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formDate || ""}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isLoading}
                required
              />
            </div>
            <div className="mt-1">
              <label className="block text-sm font-medium text-gray-700">
                Days from Formation Date
              </label>
              <input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value) || 30)}
                className="w-full p-2 border rounded"
                min="1"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline (Auto-Calculated)
              </label>
              <input
                type="date"
                value={deadline ? deadline.toISOString().split('T')[0] : ""}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
          </div>

          <CommitteeMembers
            members={members}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onRemoveMember={handleRemoveMember}
            disabled={isLoading}
          />

          <FileUpload
            onFileChange={setSelectedFile}
            existingFile={committeeId && selectedFile ? {
              name: selectedFile.name,
              size: selectedFile.size,
              onDownload: downloadFormationLetter,
            } : undefined}
            disabled={isLoading}
          />
        </div>

        <FormActions
          onClose={onClose}
          isLoading={isLoading}
          isEditMode={!!committeeId}
        />
      </form>
    </div>
  );
};

export default CommitteeForm;



// // CommitteeForm.tsx
// import FormContainer from "./form/FormContainer";
// import FormHeader from "./form/FormHeader";
// import FormActions from "./form/FormActions";
// import BasicInfoFields from "./BasicInfoFields";
// import DateInputs from "./DateInputs";
// import CommitteeMembers from "./CommitteeMembers";
// import FileUpload from "./FileUpload";
// import { useCommitteeForm } from "@/hooks/useCommitteeForm";
// import type { Committee } from "@/types/committee";
// import { useEffect, useState } from "react";
// import { useToast } from "@/components/ui/use-toast";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
// import { Button } from "@/components/ui/button";
// import { Check, ChevronsUpDown } from "lucide-react";
// import { cn } from "@/lib/utils";

// interface CommitteeFormProps {
//   onClose: () => void;
//   onCreateCommittee?: (committee: Committee) => void;
//   committeeId?: string;
// }

// const CommitteeForm = ({ onClose, onCreateCommittee, committeeId }: CommitteeFormProps) => {
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);
//   const [procurementPlans, setProcurementPlans] = useState<{ id: number; project_name: string }[]>([]);
//   const [selectedProcurementPlan, setSelectedProcurementPlan] = useState<string | null>(null);
//   const [committeeType, setCommitteeType] = useState<string>("");
//   const [open, setOpen] = useState(false);
//   const [searchInput, setSearchInput] = useState("");
//   const filteredProcurementPlans = procurementPlans.filter((plan) =>
//     plan.project_name.toLowerCase().includes(searchInput.toLowerCase())
//   );

//   const {
//     members,
//     formDate,
//     specificationDate,
//     reviewDate,
//     selectedFile,
//     name,
//     purpose,
//     handleAddMember,
//     handleUpdateMember,
//     setMembers,
//     setFormDate,
//     setSpecificationDate,
//     setReviewDate,
//     setSelectedFile,
//     setName,
//     setPurpose,
//     resetForm,
//   } = useCommitteeForm(onClose, onCreateCommittee);

//   // Fetch procurement plans
//   useEffect(() => {
//     const fetchProcurementPlans = async () => {
//       try {
//         const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });
//         if (!response.ok) throw new Error("Failed to fetch procurement plans");
//         const responseData = await response.json();
//         setProcurementPlans(responseData || []);
//       } catch (error) {
//         console.error("Error fetching procurement plans:", error);
//         toast({
//           title: "Error",
//           description: "Failed to load procurement plans",
//           variant: "destructive",
//         });
//       }
//     };
//     fetchProcurementPlans();
//   }, [toast]);

//   // Fetch committee data when editing
//   useEffect(() => {
//     const fetchCommittee = async () => {
//       if (!committeeId) return;

//       try {
//         setIsLoading(true);
//         const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${committeeId}/`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });

//         if (!response.ok) throw new Error('Failed to fetch committee');

//         const { data } = await response.json();

//         setName(data.committee.name);
//         setPurpose(data.committee.purpose);
//         setCommitteeType(data.committee.committee_type);
//         setSelectedProcurementPlan(data.committee.procurement_plan?.toString() || null);
//         setFormDate(data.committee.formation_date || '');
//         setSpecificationDate(data.committee.specification_submission_date || '');
//         setReviewDate(data.committee.review_date || '');
//         setMembers(
//           (data.committee.membersList || []).map((member: any) => ({
//             id: member._id,
//             employeeId: member.employeeId,
//             name: member.name,
//             email: member.email,
//             department: member.department || '',
//             phone: member.phone || '',
//             role: member.role || 'member',
//             tasks: member.tasks || [],
//             designation: member.designation || '',
//           }))
//         );

//         if (data.committee.formationLetterURL) {
//           try {
//             const fileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/download-formation-letter/${committeeId}/`, {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem('token')}`,
//               },
//             });
//             const blob = await fileResponse.blob();
//             const file = new File([blob], data.committee.formationLetterURL.split('/').pop() || 'formation_letter.pdf', {
//               type: blob.type,
//               lastModified: new Date().getTime(),
//             });
//             setSelectedFile(file);
//           } catch (error) {
//             console.error('Error fetching file:', error);
//             const mockFile = new File([], data.committee.formationLetterURL.split('/').pop() || 'formation_letter.pdf', {
//               type: 'application/pdf',
//             });
//             setSelectedFile(mockFile);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching committee:', error);
//         toast({
//           title: "Error",
//           description: "Failed to load committee data",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCommittee();
//   }, [committeeId, toast, setName, setPurpose, setFormDate, setSpecificationDate, setReviewDate, setMembers, setSelectedFile]);

 
// const handleFormSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!name || !purpose || !committeeType) {
//     toast({
//       title: "Validation Error",
//       description: "Name, purpose, and committee type are required",
//       variant: "destructive",
//     });
//     return;
//   }

//   if (members.length === 0) {
//     toast({
//       title: "Validation Error",
//       description: "At least one member is required",
//       variant: "destructive",
//     });
//     return;
//   }

//   const invalidMembers = members.filter(
//     (m) => !m.employeeId || !m.name || !m.email
//   );

//   if (invalidMembers.length > 0) {
//     toast({
//       title: "Validation Error",
//       description: "Please complete all required fields (Employee ID, Name, Email) for all members",
//       variant: "destructive",
//     });
//     return;
//   }

//   const employeeIds = members.map((m) => m.employeeId);
//   const uniqueEmployeeIds = new Set(employeeIds);
//   if (uniqueEmployeeIds.size !== employeeIds.length) {
//     toast({
//       title: "Validation Error",
//       description: "Duplicate employee IDs are not allowed",
//       variant: "destructive",
//     });
//     return;
//   }

//   try {
//     setIsLoading(true);

//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("purpose", purpose);
//     formData.append("committee_type", committeeType);
//     if (selectedProcurementPlan && selectedProcurementPlan !== "none") {
//       formData.append("procurement_plan", selectedProcurementPlan);
//     }
//     if (formDate) formData.append("formation_date", formDate);
//     if (specificationDate) formData.append("specification_submission_date", specificationDate);
//     if (reviewDate) formData.append("review_date", reviewDate);
//     formData.append("should_notify", "true");
//     const membersData = members.map((m) => ({
//       employeeId: m.employeeId,
//       role: m.role || "member",
//     }));
//     formData.append("members", JSON.stringify(membersData));
//     if (selectedFile) {
//       formData.append("formation_letter", selectedFile);
//     }

//     const endpoint = committeeId
//       ? `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/update/${committeeId}/`
//       : "${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/create/";
//     const method = committeeId ? "PATCH" : "POST";

//     console.log("Submitting:", {
//       name,
//       purpose,
//       committee_type: committeeType,
//       procurement_plan: selectedProcurementPlan,
//       formation_date: formDate,
//       specification_submission_date: specificationDate,
//       review_date: reviewDate,
//       members: membersData,
//       should_notify: true,
//       hasFile: !!selectedFile,
//     });

//     const response = await fetch(endpoint, {
//       method,
//       body: formData,
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error("Error response:", errorData);
//       const errorMessage = errorData.message || errorData.error?.message || "Failed to save committee";
//       throw new Error(errorMessage);
//     }

//     const { data } = await response.json();

//     toast({
//       title: "Success",
//       description: committeeId ? "Committee updated successfully" : "Committee created successfully",
//     });

//     if (onCreateCommittee) {
//       onCreateCommittee(data.committee);
//     }

//     if (!committeeId) {
//       resetForm();
//     }

//     onClose();
//   } catch (error) {
//     console.error("Error saving committee:", error);
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to save committee",
//       variant: "destructive",
//     });
//   } finally {
//     setIsLoading(false);
//   }
// };

  

//   const handleRemoveMember = async (index: number) => {
//     try {
//       if (committeeId && members[index]?.employeeId) {
//         const response = await fetch(
//           `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/remove-member/${committeeId}/${members[index].employeeId}/`,
//           {
//             method: 'DELETE',
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${localStorage.getItem('token')}`,
//             },
//           }
//         );

//         if (!response.ok) throw new Error('Failed to remove member');

//         setMembers(members.filter((_, i) => i !== index));
//         toast({
//           title: "Member Removed",
//           description: "Committee member has been removed successfully.",
//         });
//       } else {
//         setMembers(members.filter((_, i) => i !== index));
//       }
//     } catch (error) {
//       console.error('Error removing member:', error);
//       toast({
//         title: "Error",
//         description: "Failed to remove committee member",
//         variant: "destructive",
//       });
//     }
//   };

//   const downloadFormationLetter = async () => {
//     if (!committeeId) return;

//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/download-formation-letter/${committeeId}/`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (!response.ok) throw new Error('Failed to download file');

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `formation-letter-${committeeId}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       a.remove();
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       toast({
//         title: "Error",
//         description: "Failed to download formation letter",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="w-full slide-in fade-in">
//       <FormHeader onClose={onClose} />

//       <form onSubmit={handleFormSubmit} className="space-y-8 mt-6">
//         <div className="space-y-6">
//           <BasicInfoFields
//             name={name}
//             purpose={purpose}
//             onNameChange={setName}
//             onPurposeChange={setPurpose}
//             disabled={isLoading}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Committee Type <span className="text-red-500">*</span>
//               </label>
//               <Select value={committeeType} onValueChange={setCommitteeType} disabled={isLoading}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select committee type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="specification">Specification</SelectItem>
//                   <SelectItem value="evaluation">Evaluation</SelectItem>
//                   <SelectItem value="other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Procurement Plan
//               </label>
//               <Popover open={open} onOpenChange={setOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     role="combobox"
//                     aria-expanded={open}
//                     className="w-full justify-between"
//                     disabled={isLoading}
//                   >
//                     {selectedProcurementPlan
//                       ? procurementPlans.find((plan) => plan.id.toString() === selectedProcurementPlan)?.project_name || "Select procurement plan"
//                       : "Select procurement plan"}
//                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-full p-0">
//                   <Command>
//                     <CommandInput
//                       placeholder="Search procurement plan..."
//                       onValueChange={(value) => setSearchInput(typeof value === 'string' ? value : '')}
//                     />
//                     <CommandEmpty>No procurement plan found.</CommandEmpty>
//                     <CommandGroup>
//                       <CommandItem
//                         value="none"
//                         onSelect={() => {
//                           setSelectedProcurementPlan(null);
//                           setOpen(false);
//                         }}
//                       >
//                         <Check
//                           className={cn(
//                             "mr-2 h-4 w-4",
//                             selectedProcurementPlan === null ? "opacity-100" : "opacity-0"
//                           )}
//                         />
//                         None
//                       </CommandItem>
//                       {filteredProcurementPlans.map((plan) => (
//                         <CommandItem
//                           key={plan.id}
//                           value={plan.project_name}
//                           onSelect={() => {
//                             setSelectedProcurementPlan(plan.id.toString());
//                             setOpen(false);
//                           }}
//                         >
//                           <Check
//                             className={cn(
//                               "mr-2 h-4 w-4",
//                               selectedProcurementPlan === plan.id.toString() ? "opacity-100" : "opacity-0"
//                             )}
//                           />
//                           {plan.project_name}
//                         </CommandItem>
//                       ))}
//                     </CommandGroup>
//                   </Command>
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>

//           <DateInputs
//             formDate={formDate}
//             specificationDate={specificationDate}
//             reviewDate={reviewDate}
//             onFormDateChange={setFormDate}
//             onSpecificationDateChange={setSpecificationDate}
//             onReviewDateChange={setReviewDate}
//             disabled={isLoading}
//           />

//           <CommitteeMembers
//             members={members}
//             onAddMember={handleAddMember}
//             onUpdateMember={handleUpdateMember}
//             onRemoveMember={handleRemoveMember}
//             disabled={isLoading}
//           />

//           <FileUpload
//             onFileChange={setSelectedFile}
//             existingFile={committeeId && selectedFile ? {
//               name: selectedFile.name,
//               size: selectedFile.size,
//               onDownload: downloadFormationLetter,
//             } : undefined}
//             disabled={isLoading}
//           />
//         </div>

//         <FormActions
//           onClose={onClose}
//           isLoading={isLoading}
//           isEditMode={!!committeeId}
//         />
//       </form>
//     </div>
//   );
// };

// export default CommitteeForm;

