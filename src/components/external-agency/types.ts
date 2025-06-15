
export interface Document {
  id: string;
  name: string;
  url?: string;
  uploaded_at: string;
}

export interface ProjectData {
  id?: string;
  title: string;
  description: string;
  status: "approved" | "pending" | "rejected";
  comments?: CommentType[];
  documents?: Document[];
}

export interface CommentType {
  id: string;
  author: string;
  date: string;
  content: string;
  role?: string;
  attachments?: Document[];
}

export type Status = "approved" | "pending" | "rejected";
