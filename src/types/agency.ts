// frontend/src/types.ts
export interface Document {
  id: string;
  name: string;
  url: string;
  uploaded_at: string;
}

export interface CommentType {
  id: string;
  author: string;
  content: string;
  role: string;
  created_at: string;
  attachments: Document[];
  user_email: string;
  user_role: string;
}

export interface ProjectData {
  id: string;
  title: string;
  one_line_description: string;
  description: string;
  program: string;
  start_date: string;
  deadline_date: string;
  identification_no: string;
  selected_contractor: string;
  remarks: string;
  status: "approved" | "pending" | "rejected";
  created_at: string;
  documents: Document[];
  comments: CommentType[];
  created_by_email: string;
  created_by_role: string;
}