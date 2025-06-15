
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

export interface QuarterlyTarget {
  id?: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  target_details: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  created_at: string;
}

export interface Committee {
  _id: string;
  name: string;
  committee_type: string;
}

export interface ProcurementPlan {
  id: number;
  policy_number: string;
  department: string;
  dept_index: string;
  project_name: string;
  project_description: string;
  estimated_cost: number;
  budget: number;
  proposed_budget_percentage: number;
  title: string;
  description: string;
  proposed_budget: number;
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
  committee?: Committee | null;
  tender_id?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  quarterly_targets: QuarterlyTarget[];
}

export interface Approval {
  id: number;
  plan_id: number;
  approver_id: number;
  approval_date: string;
  status: string;
  comments: string;
}
