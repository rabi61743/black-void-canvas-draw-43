import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import TenderForm from "@/components/tender/TenderForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tender } from "@/types/tender";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const TendersPage = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string | undefined>(undefined);

  const fetchTenders = async () => {
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to view tenders.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tender/tenders/`, {
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
        throw new Error(`Failed to fetch tenders: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setTenders(data.data?.tenders || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load tenders", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [token, navigate]);

  const handleCreateOrUpdate = (tender: Tender) => {
    setTenders((prev) =>
      selectedTenderId
        ? prev.map((t) => (t.id === tender.id ? tender : t))
        : [...prev, tender]
    );
    setIsFormOpen(false);
    setSelectedTenderId(undefined);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tenders</h1>
        <Button onClick={() => setIsFormOpen(true)}>Create Tender</Button>
      </div>

      {isFormOpen && (
        <TenderForm
          onClose={() => setIsFormOpen(false)}
          onCreateTender={handleCreateOrUpdate}
          tenderId={selectedTenderId}
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {tenders.map((tender) => (
          <Card key={tender.id} onClick={() => { setSelectedTenderId(tender.id.toString()); setIsFormOpen(true); }}>
            <CardHeader>
              <CardTitle>{tender.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>IFB Number: {tender.ifbNumber}</p>
              <p>{tender.description}</p>
              <p>Status: {tender.status}</p>
              <p>Approval Status: {tender.approvalStatus}</p>
              <p>Publish Date: {new Date(tender.publishDate).toLocaleDateString()}</p>
              <p>Opening Date: {new Date(tender.openingDate).toLocaleDateString()}</p>
              <p>Bid Validity: {tender.bidValidity}</p>
              {tender.comments.length > 0 && (
                <div>
                  <p>Comments:</p>
                  <ul className="list-disc pl-4">
                    {tender.comments.map((comment) => (
                      <li key={comment.id}>{comment.text} (By {comment.author} on {new Date(comment.createdAt).toLocaleString()})</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TendersPage;