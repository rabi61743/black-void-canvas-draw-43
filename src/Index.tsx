import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: number;
  title: string;
  status: string;
  one_line_description: string;
  document_count: number;
  date: string;
}

function Complaints() {
  const { isAuthenticated, user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log("Complaints: Not authenticated");
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        console.log("Fetching complaints for user:", user?.employee_id);
        const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/agency_app/discussions/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
        setLoading(false);
        console.log("Complaints fetched:", data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load complaints");
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, user, token]);

  if (loading) return <div className="container mx-auto p-4">Loading complaints...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Complaints Dashboard</h1>
      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p>{project.one_line_description}</p>
            <p>Status: {project.status}</p>
            <p>Comments: {project.document_count}</p>
            <Link to={`/project/${project.id}`} className="text-blue-500 hover:underline">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Complaints;