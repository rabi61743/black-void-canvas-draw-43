import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import SpecificationForm from "@/components/specification/SpecificationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SpecificationDocument } from "@/types/specification";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Specifications = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [specifications, setSpecifications] = useState<SpecificationDocument[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSpecificationId, setSelectedSpecificationId] = useState<string | undefined>(undefined);

  const fetchSpecifications = async () => {
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to view specifications.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

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
        const errorText = await response.text();
        console.error(`Error response from server: ${errorText}`);
        throw new Error(`Failed to fetch specifications: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setSpecifications(data.data?.specifications || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load specifications", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchSpecifications();
  }, [token, navigate]);

  const handleCreateOrUpdate = (specification: SpecificationDocument) => {
    setSpecifications((prev) =>
      selectedSpecificationId
        ? prev.map((s) => (s.id === specification.id ? specification : s))
        : [...prev, specification]
    );
    setIsFormOpen(false);
    setSelectedSpecificationId(undefined);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Specifications</h1>
        <Button onClick={() => setIsFormOpen(true)}>Create Specification</Button>
      </div>

      {isFormOpen && (
        <SpecificationForm
          onClose={() => setIsFormOpen(false)}
          onCreateSpecification={handleCreateOrUpdate}
          specificationId={selectedSpecificationId}
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {specifications.map((spec) => (
          <Card key={spec.id} onClick={() => { setSelectedSpecificationId(spec.id.toString()); setIsFormOpen(true); }}>
            <CardHeader>
              <CardTitle>{spec.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{spec.description}</p>
              <p>Status: {spec.status}</p>
              <p>Version: {spec.version}</p>
              <p>Submitted At: {new Date(spec.submittedAt).toLocaleString()}</p>
              {spec.documentUrl && (
                <a href={spec.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Document</a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Specifications;