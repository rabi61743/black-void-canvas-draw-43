import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSpecificationForm } from "@/hooks/useSpecificationForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SpecificationDocument } from "@/types/specification";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SpecificationFormProps {
  onClose: () => void;
  onCreateSpecification?: (specification: SpecificationDocument) => void;
  specificationId?: string;
}

const SpecificationForm = ({ onClose, onCreateSpecification, specificationId }: SpecificationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [procurementPlans, setProcurementPlans] = useState<{ id: number; project_name: string }[]>([]);
  const [committees, setCommittees] = useState<{ id: number; name: string }[]>([]);
  const [specifications, setSpecifications] = useState<{ id: number; title: string }[]>([]); // Added state for specifications
  const [selectedProcurementPlan, setSelectedProcurementPlan] = useState<string | null>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const {
    title,
    description,
    version,
    status,
    documentUrl,
    comments,
    setTitle,
    setDescription,
    setVersion,
    setStatus,
    setDocumentUrl,
    setComments,
    resetForm,
  } = useSpecificationForm(onClose, onCreateSpecification);

  // Fetch procurement plans, committees, and specifications
  useEffect(() => {
    if (!token) {
      console.log("No token found, skipping fetch requests");
      return;
    }

    const fetchProcurementPlans = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          throw new Error(`Failed to fetch procurement plans: ${response.status}`);
        }
        const responseData = await response.json();
        console.log("Procurement Plans Raw Data:", responseData);
        setProcurementPlans(responseData || []);
      } catch (error) {
        console.error("Error fetching procurement plans:", error);
        toast({ title: "Error", description: "Failed to load procurement plans", variant: "destructive" });
      }
    };

    const fetchCommittees = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/all/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          throw new Error(`Failed to fetch committees: ${response.status}`);
        }
        const responseData = await response.json();
        console.log("Committees Raw Data:", responseData);
        setCommittees(responseData.data?.committees || []);
      } catch (error) {
        console.error("Error fetching committees:", error);
        toast({ title: "Error", description: "Failed to load committees", variant: "destructive" });
      }
    };

    const fetchSpecifications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/specification/specifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          throw new Error(`Failed to fetch specifications: ${response.status}`);
        }
        const responseData = await response.json();
        console.log("Specifications Raw Data:", responseData); // Debug log
        setSpecifications(responseData.data?.specifications || []);
      } catch (error) {
        console.error("Error fetching specifications:", error);
        toast({ title: "Error", description: "Failed to load specifications", variant: "destructive" });
      }
    };

    fetchProcurementPlans();
    fetchCommittees();
    fetchSpecifications();
  }, [toast, navigate, token]);

  // Fetch specification data if editing
  useEffect(() => {
    const fetchSpecification = async () => {
      if (!specificationId || !token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/specification/specifications/${specificationId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch specification");
        }
        const { data } = await response.json();
        setTitle(data.specification.title);
        setDescription(data.specification.description);
        setVersion(data.specification.version);
        setStatus(data.specification.status);
        setDocumentUrl(data.specification.documentUrl);
        setComments(data.specification.comments || []);
        setSelectedProcurementPlan(data.specification.procurement_plan?.toString() || null);
        setSelectedCommittee(data.specification.committeeId?.toString() || null);
      } catch (error) {
        console.error("Error fetching specification:", error);
        toast({ title: "Error", description: "Failed to load specification data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpecification();
  }, [specificationId, toast, setTitle, setDescription, setVersion, setStatus, setDocumentUrl, setComments, navigate, token]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !selectedProcurementPlan || !selectedCommittee) {
      toast({ title: "Validation Error", description: "Title, description, procurement plan, and committee are required", variant: "destructive" });
      return;
    }

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No authentication token found. Please log in.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("version", version.toString());
      formData.append("status", status);
      formData.append("procurement_plan", parseInt(selectedProcurementPlan).toString());
      formData.append("committee", parseInt(selectedCommittee).toString());
      comments.forEach((comment, index) => {
        formData.append(`comments[${index}]`, comment);
      });
      if (documentFile) {
        formData.append("document", documentFile);
      } else if (documentUrl) {
        formData.append("documentUrl", documentUrl);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const endpoint = specificationId
        ? `${import.meta.env.VITE_API_BASE_URL}/specification/specifications/${specificationId}/`
        : `${import.meta.env.VITE_API_BASE_URL}/specification/specifications/`;
      const method = specificationId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        const errorData = await response.json();
        console.log("Error Response from Backend:", errorData);
        throw new Error(errorData.message || "Failed to save specification");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: specificationId ? "Specification updated successfully" : "Specification created successfully",
      });

      if (onCreateSpecification) {
        onCreateSpecification(data.specification || data);
      }

      if (!specificationId) {
        resetForm();
      }

      onClose();
    } catch (error) {
      console.error("Error saving specification:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save specification", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full slide-in fade-in">
      <h2 className="text-xl font-bold mb-4">{specificationId ? "Edit Specification" : "Create Specification"}</h2>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter specification title" disabled={isLoading} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter specification description"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
          <Input type="number" value={version} onChange={(e) => setVersion(Number(e.target.value))} disabled={isLoading} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
          <Select value={status} onValueChange={(value) => setStatus(value as SpecificationDocument["status"])} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="revision_required">Revision Required</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Plan <span className="text-red-500">*</span></label>
          <select value={selectedProcurementPlan || ""} onChange={(e) => setSelectedProcurementPlan(e.target.value)} className="w-full p-2 border rounded" disabled={isLoading} required>
            <option value="">Select a procurement plan</option>
            {Array.isArray(procurementPlans) && procurementPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.project_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Committee <span className="text-red-500">*</span></label>
          <select value={selectedCommittee || ""} onChange={(e) => setSelectedCommittee(e.target.value)} className="w-full p-2 border rounded" disabled={isLoading} required>
            <option value="">Select a committee</option>
            {Array.isArray(committees) && committees.map((committee: any) => (
              <option key={committee._id} value={committee._id}>{committee.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
          <Input type="file" onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)} disabled={isLoading} />
          {documentUrl && !documentFile && <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Current Document</a>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <Textarea
            value={comments.join("\n")}
            onChange={(e) => setComments(e.target.value.split("\n").filter((c) => c.trim()))}
            placeholder="Enter comments (one per line)"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded" disabled={isLoading}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={isLoading}>
            {isLoading ? "Saving..." : specificationId ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpecificationForm;