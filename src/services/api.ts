// api.ts
import axios from "axios";

// Base API URL - use VITE_API_BASE_URL from environment variables with proper fallback
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
interface Document {
  id: string;
  name: string;
  url?: string;
}

interface Project {
  id: string;
  title: string;
  status: "approved" | "pending" | "rejected";
  date: string;
  one_line_description: string;
  document_count: number;
  documents?: Document[];
}

interface ProjectDetail extends Omit<Project, "one_line_description" | "document_count"> {
  description: string;
  program: string;
  start_date: string;
  start_date_formatted: string;
  deadline_date: string;
  deadline_date_formatted: string;
  identification_no: string;
  selected_contractor: string;
  remarks: string;
  documents: Document[];
  comments: {
    id: string;
    content: string;
    author: string;
    role: string;
    date: string;
    created_at: string;
    attachments?: Document[];
    user_email?: string;
    user_role?: string;
  }[];
  created_by_email?: string;
  created_by_role?: string;
  procurement_plan?: {
    id: number;
    policy_number: string;
    project_name?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  author: string;
  role: string;
  date: string;
  created_at: string;
  attachments?: Document[];
  user_email?: string;
  user_role?: string;
}

// Authentication API
export const authApi = {
  register: (userData: any) => api.post("/auth/register/", userData),
  login: (employee_id: string, password: string) =>
    api.post("/token/", { employee_id, password }),
  logout: () => api.post("/auth/logout/"),
  getCurrentUser: () => api.get("/users/me/"),
  requestPasswordReset: (email: string) => api.post("/auth/reset-password/", { email }),
  confirmPasswordReset: (token: string, uid: string, new_password: string, confirm_password: string) =>
    api.post("/auth/reset-password-confirm/", { token, uid, new_password, confirm_password }),
};

// Projects API
export const projectsApi = {
  getAll: (search = "", status = "all", sort = "default") => {
    const params: { [key: string]: string } = {};
    if (search) params.search = search;
    if (status && status !== "all") params.status = status;
    if (sort && sort !== "default") params.sort = sort;
    return api.get<Project[]>("/agency_app/discussions/", { params });
  },
  
  getById: (id: string) => api.get<ProjectDetail>(`/agency_app/discussions/${id}/`),
  
  create: (projectData: any) => api.post<ProjectDetail>("/agency_app/discussions/", projectData),
  
  update: (id: string, projectData: any) => api.put(`/agency_app/discussions/${id}/`, projectData),
  
  updateStatus: (id: string, status: string) =>
    api.post<{ status: string }>(`/agency_app/discussions/${id}/update-status/`, { status }),
  
  uploadDocuments: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    console.log(`Uploading to: /agency_app/discussions/${id}/upload-documents/`);
    return api.post<Document[]>(`/agency_app/discussions/${id}/upload-documents/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Comments API
export const commentsApi = {
  getByProject: (projectId: string) => api.get<Comment[]>(`/agency_app/discussions/${projectId}/comments/`),
  
  create: (projectId: string, commentData: any) =>
    api.post<Comment>(`/agency_app/discussions/${projectId}/comments/`, commentData),
  
  createWithAttachments: (projectId: string, commentData: any, files: File[]) => {
    const formData = new FormData();
    Object.entries(commentData).forEach(([key, value]) => formData.append(key, String(value)));
    files.forEach((file) => formData.append("files", file));
    return api.post<Comment>(`/agency_app/discussions/${projectId}/comments/with-attachments/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  
  update: (commentId: string, content: string) =>
    api.put(`/agency_app/comments/${commentId}/`, { content }),
  
  delete: (commentId: string) => api.delete(`/agency_app/comments/${commentId}/`),
};

// Documents API
export const documentsApi = {
  delete: (documentId: string) => api.delete(`/agency_app/documents/${documentId}/`),
};

// Users API
export const usersApi = {
  getAll: () => api.get("/users/"),
  getById: (id: string) => api.get(`/users/${id}/`),
  create: (userData: any) => api.post("/users/", userData),
  update: (id: string, userData: any) => api.put(`/users/${id}/`, userData),
  delete: (id: string) => api.delete(`/users/${id}/`),
};
