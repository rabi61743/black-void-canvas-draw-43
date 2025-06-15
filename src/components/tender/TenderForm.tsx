import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTenderForm } from "@/hooks/useTenderForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tender, TenderComment } from "@/types/tender";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface TenderFormProps {
  onClose: () => void;
  onCreateTender?: (tender: Tender) => void;
  tenderId?: string;
}

const TenderForm = ({ onClose, onCreateTender, tenderId }: TenderFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [procurementPlans, setProcurementPlans] = useState<{ id: number; project_name: string }[]>([]);
  const [specifications, setSpecifications] = useState<{ id: number; title: string }[]>([]);
  const [selectedProcurementPlan, setSelectedProcurementPlan] = useState<string | null>(null);
  const [selectedSpecification, setSelectedSpecification] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);

  const {
    ifbNumber,
    title,
    description,
    publishDate,
    openingDate,
    bidValidity,
    status,
    approvalStatus,
    comments,
    documents,
    setIfbNumber,
    setTitle,
    setDescription,
    setPublishDate,
    setOpeningDate,
    setBidValidity,
    setStatus,
    setApprovalStatus,
    setComments,
    setDocuments,
    resetForm,
  } = useTenderForm(onClose, onCreateTender);

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
          throw new Error("Failed to fetch procurement plans");
        }
        const data = await response.json();
        console.log("Procurement Plans Data:", data);
        setProcurementPlans(data || []);
      } catch (error) {
        console.error("Error fetching procurement plans:", error);
        toast({ title: "Error", description: "Failed to load procurement plans", variant: "destructive" });
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
          throw new Error("Failed to fetch specifications");
        }
        const data = await response.json();
        console.log("Specifications Data:", data);
        setSpecifications(data?.specifications?.filter((spec: any) => spec.status === "approved") || []);
      } catch (error) {
        console.error("Error fetching specifications:", error);
        toast({ title: "Error", description: "Failed to load specifications", variant: "destructive" });
      }
    };

    fetchProcurementPlans();
    fetchSpecifications();
  }, [toast, navigate, token]);

  useEffect(() => {
    const fetchTender = async () => {
      if (!tenderId || !token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tender/tenders/${tenderId}/`, {
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
          throw new Error("Failed to fetch tender");
        }
        const { data } = await response.json();
        setIfbNumber(data.tender.ifbNumber);
        setTitle(data.tender.title);
        setDescription(data.tender.description);
        setPublishDate(data.tender.publishDate.split("T")[0]);
        setOpeningDate(data.tender.openingDate.split("T")[0]);
        setBidValidity(data.tender.bidValidity);
        setStatus(data.tender.status);
        setApprovalStatus(data.tender.approvalStatus);
        setComments(data.tender.comments || []);
        setDocuments(data.tender.documents || []);
        setSelectedProcurementPlan(data.tender.procurement_plan?.toString() || null);
        setSelectedSpecification(data.tender.specification?.toString() || null);
      } catch (error) {
        console.error("Error fetching tender:", error);
        toast({ title: "Error", description: "Failed to load tender data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTender();
  }, [tenderId, toast, setIfbNumber, setTitle, setDescription, setPublishDate, setOpeningDate, setBidValidity, setStatus, setApprovalStatus, setComments, setDocuments, navigate, token]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newCommentObj: TenderComment = {
      id: comments.length + 1,
      text: newComment,
      author: "Current User",
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newCommentObj]);
    setNewComment("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ifbNumber || !title || !description || !publishDate || !openingDate || !bidValidity || !selectedProcurementPlan || !selectedSpecification) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
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
      formData.append("ifbNumber", ifbNumber);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("publishDate", publishDate);
      formData.append("openingDate", openingDate);
      formData.append("bidValidity", bidValidity);
      formData.append("status", status);
      formData.append("approvalStatus", approvalStatus);
      formData.append("procurement_plan", selectedProcurementPlan);
      formData.append("specification", selectedSpecification);
      formData.append("comments", JSON.stringify(comments));
      selectedDocuments.forEach((file) => formData.append("documents", file));

      const endpoint = tenderId ? `${import.meta.env.VITE_API_BASE_URL}/tender/tenders/${tenderId}/` : `${import.meta.env.VITE_API_BASE_URL}/tender/tenders/`;
      const method = tenderId ? "PATCH" : "POST";

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
        throw new Error(errorData.message || "Failed to save tender");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: tenderId ? "Tender updated successfully" : "Tender created successfully",
      });

      if (onCreateTender) {
        onCreateTender(data.tender || data);
      }

      if (!tenderId) {
        resetForm();
      }

      onClose();
    } catch (error) {
      console.error("Error saving tender:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save tender", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full slide-in fade-in">
      <h2 className="text-xl font-bold mb-4">{tenderId ? "Edit Tender" : "Create Tender"}</h2>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IFB Number <span className="text-red-500">*</span></label>
          <Input value={ifbNumber} onChange={(e) => setIfbNumber(e.target.value)} placeholder="Enter IFB number" disabled={isLoading} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter tender title" disabled={isLoading} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter tender description" disabled={isLoading} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date <span className="text-red-500">*</span></label>
            <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} disabled={isLoading} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Date <span className="text-red-500">*</span></label>
            <Input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} disabled={isLoading} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bid Validity <span className="text-red-500">*</span></label>
            <Input value={bidValidity} onChange={(e) => setBidValidity(e.target.value)} placeholder="e.g., 90 days" disabled={isLoading} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
          <Select value={status} onValueChange={(value) => setStatus(value as Tender["status"])} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status <span className="text-red-500">*</span></label>
          <Select value={approvalStatus} onValueChange={(value) => setApprovalStatus(value as Tender["approvalStatus"])} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select approval status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Procurement Plan <span className="text-red-500">*</span></label>
          <select value={selectedProcurementPlan || ""} onChange={(e) => setSelectedProcurementPlan(e.target.value)} className="w-full p-2 border rounded" disabled={isLoading} required>
            <option value="">Select a procurement plan</option>
            {procurementPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.project_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specification <span className="text-red-500">*</span></label>
          <select value={selectedSpecification || ""} onChange={(e) => setSelectedSpecification(e.target.value)} className="w-full p-2 border rounded" disabled={isLoading} required>
            <option value="">Select a finalized specification</option>
            {specifications.map((spec) => (
              <option key={spec.id} value={spec.id}>{spec.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="border p-2 rounded">
                <p>{comment.text}</p>
                <p className="text-sm text-gray-500">By {comment.author} on {new Date(comment.createdAt).toLocaleString()}</p>
              </div>
            ))}
            <div className="flex space-x-2">
              <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment" disabled={isLoading} />
              <button type="button" onClick={handleAddComment} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={isLoading}>Add</button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
          <Input
            type="file"
            multiple
            onChange={(e) => setSelectedDocuments(e.target.files ? Array.from(e.target.files) : [])}
            disabled={isLoading}
          />
          {documents.length > 0 && (
            <ul className="mt-2">
              {documents.map((doc, index) => (
                <li key={index} className="text-blue-500">{doc.name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded" disabled={isLoading}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={isLoading}>
            {isLoading ? "Saving..." : tenderId ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TenderForm;