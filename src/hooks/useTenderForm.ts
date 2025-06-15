import { useState } from "react";
import type { Tender, TenderComment } from "@/types/tender";

export const useTenderForm = (onClose: () => void, onCreateTender?: (tender: Tender) => void) => {
  const [ifbNumber, setIfbNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [bidValidity, setBidValidity] = useState("");
  const [status, setStatus] = useState<Tender["status"]>("draft");
  const [approvalStatus, setApprovalStatus] = useState<Tender["approvalStatus"]>("pending");
  const [comments, setComments] = useState<TenderComment[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const resetForm = () => {
    setIfbNumber("");
    setTitle("");
    setDescription("");
    setPublishDate("");
    setOpeningDate("");
    setBidValidity("");
    setStatus("draft");
    setApprovalStatus("pending");
    setComments([]);
    setDocuments([]);
  };

  return {
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
  };
};