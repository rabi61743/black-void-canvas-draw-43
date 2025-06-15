
export interface DocumentVersion {
  id?: number;
  version: number;
  documentUrl?: string;
  changes: string;
  submittedBy: number;
  submittedAt: string;
}

export interface TaskAssignment {
  id: number;
  title: string;
  description: string;
  assignedTo: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  attachments: any[];
  notificationType: 'email' | 'sms' | 'both';
}

export interface Letter {
  id: number;
  referenceNumber: string;
  issueDate: string;
  content: string;
  attachments?: any[];
}

export interface SpecificationDocument {
  id: number;
  procurement_plan: string;
  title: string;
  description: string;
  version: number;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'submitted';
  submittedBy: string | number;
  submittedAt: string;
  lastModified: string;
  documentUrl: string;
  committeeId: number;
  comments: string[];
  versionHistory: DocumentVersion[];
  tasks?: TaskAssignment[];
  reviewTracking?: ReviewTracking[];
  committeeFormationLetter?: Letter;
}

export interface ReviewSession {
  id: number;
  specificationId: number;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  reviewers: Array<{
    id: number;
    name: string;
    employeeId: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    tasks: any[];
  }>;
  minutes: string;
  comments: string[];
  documents: any[];
  nextReviewDate?: string;
}

export type ReviewStatus = 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
export type NotificationType = 'email' | 'sms' | 'both';

export interface ReviewTracking {
  id: number;
  documentVersion: number;
  reviewDate: string;
  status: ReviewStatus;
  comments: string[];
  nextReviewDate: string;
  notifiedMembers: {
    memberId: number;
    notified: boolean;
    notificationMethod: NotificationType;
    acknowledgedAt?: string;
  }[];
}
