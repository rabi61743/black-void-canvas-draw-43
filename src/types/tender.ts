
export type TenderStatus = "draft" | "published" | "closed";

export type TenderApprovalStatus = "pending" | "approved" | "rejected";

export interface TenderComment {
  id: number;
  text: string;
  author: string;
  createdAt: string;
  timestamp: string;
}

export interface Tender {
  id: number;
  procurement_plan: number;
  specification: number;
  ifbNumber: string;
  title: string;
  description: string;
  publishDate: string;
  openingDate: string;
  bidValidity: string;
  status: TenderStatus;
  approvalStatus: TenderApprovalStatus;
  comments: TenderComment[];
  documents: File[];
}
