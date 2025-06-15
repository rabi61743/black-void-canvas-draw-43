export interface ProcurementMethod {
  id: number;
  method_name: string;
}

export interface Priority {
  id: number;
  priority_name: string;
}

export interface ProcurementStatus {
  id: number;
  status_name: string;
}

export interface ProcurementPlan {
  id: number;
  title: string;
  description: string;
  proposed_budget: number; // Add missing field
  estimated_value: number;
  procurement_method: ProcurementMethod;
  status: ProcurementStatus;
  category: string;
  priority: Priority;
  timeline: {
    planning_start: string;
    planning_end: string;
    tender_publication: string;
    submission_deadline: string;
    evaluation_period: string;
    contract_award: string;
  };
  approvals: {
    technical_approval: boolean;
    financial_approval: boolean;
    management_approval: boolean;
  };
  committee_id?: number;
  tender_id?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Approval {
  id: number;
  plan_id: number;
  approver_id: number;
  approval_date: string;
  status: string;
  comments: string;
}
