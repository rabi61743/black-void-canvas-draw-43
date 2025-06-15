import { useState } from "react";
import type { SpecificationDocument } from "@/types/specification";

export const useSpecificationForm = (
  onClose: () => void,
  onCreateSpecification?: (specification: SpecificationDocument) => void
) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState<SpecificationDocument["status"]>("draft");
  const [documentUrl, setDocumentUrl] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVersion(1);
    setStatus("draft");
    setDocumentUrl("");
    setComments([]);
  };

  return {
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
  };
};