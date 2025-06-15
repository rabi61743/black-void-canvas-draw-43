
export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface CommentType {
  id: string;
  author: string;
  date: string;
  content: string;
  role: string;
  attachments?: Document[];
}

export type Status = "pending" | "approved" | "rejected" | "in_review";

export interface ProjectData {
  id: string;
  title: string;
  status: Status;
  one_line_description: string;
  document_count: number;
  date: string;
  description: string;
  program: string;
  start_date_formatted: string;
  identification_no: string;
  deadline_date_formatted: string;
  selected_contractor: string;
  remarks: string;
  created_by_email: string;
  created_by_role: string;
  procurement_plan?: any;
}
