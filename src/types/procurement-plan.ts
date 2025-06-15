// types/procurement-plan.ts
export interface QuarterlyTarget {
  id?: number;
  procurement_plan_id?: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  target_details: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  created_at: string;
}

export interface Committee {
  _id: number;
  name: string;
  committee_type: 'specification' | 'evaluation' | 'other';
  formation_date: string | null;
  created_at: string;
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
  created_at: string;
  quarterly_targets: QuarterlyTarget[];
  committee: Committee | null;
}


// export interface QuarterlyTarget {
//   id?: number;
//   procurement_plan_id?: number;
//   quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
//   target_details: string;
//   status: 'Planned' | 'In Progress' | 'Completed';
//   created_at: string;
// }

// export interface ProcurementPlan {
//   id: number;
//   policy_number: string;
//   department: string;
//   dept_index: string;
//   project_name: string;
//   project_description: string;
//   estimated_cost: number;
//   budget: number;
//   proposed_budget_percentage: number;
//   created_at: string;
//   quarterly_targets: QuarterlyTarget[];
//   committee?: number | null;
// }

