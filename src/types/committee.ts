
// types/committee.ts
export type CommitteeTaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type CommitteeApprovalStatus = 'draft' | 'pending' | 'pending_review' | 'approved' | 'rejected';
export type DocumentStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface CommitteeTask {
  id: number;
  title: string;
  description: string;
  assignedTo: number; // memberId
  dueDate: string;
  status: CommitteeTaskStatus;
  attachments?: File[];
  comments?: string[];
}

export interface CommitteeMember {
  id?: string;
  employeeId: string;
  name: string;
  email: string;
  department?: string;
  phone?: string;
  role?: 'member' | 'chairperson' | 'secretary';
  designation?: string;
  tasks?: string[];
}

export interface SpecificationReview {
  id: number;
  committeeId: number;
  scheduledDate: string;
  actualDate?: string;
  minutes?: string;
  status: DocumentStatus;
  reviewers: CommitteeMember[];
  documents: File[];
  comments: string[];
}

export interface Committee {
  _id: string;
  name: string;
  purpose: string;
  committee_type: string;
  procurement_plan?: number | null;
  formation_date?: string | null;
  specification_submission_date?: string | null;
  review_date?: string | null;
  schedule?: string | null;
  should_notify?: boolean;
  formationLetterURL?: string | null;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
  };
  createdAt?: string;
  updatedAt?: string;
  membersList?: Array<{
    _id: string;
    employeeId: string;
    name: string;
    role: string;
    email: string;
    department?: string;
    designation?: string;
  }>;
  approvalStatus?: string;
}

export interface ReviewHistory {
  id: number;
  reviewDate: string;
  reviewers: CommitteeMember[];
  status: DocumentStatus;
  minutes?: string;
  documents: File[];
  comments: string[];
  nextReviewDate?: string;
}
