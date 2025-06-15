import { ProcurementPlan } from "@/types/procurement-plan";

export const mockProcurementPlans: ProcurementPlan[] = [
  {
    id: 1,
    policy_number: "PP-2080-WL-N-01",
    department: "Wireline",
    dept_index: "01",
    project_name: "LTE Upgrade",
    project_description: "Network infrastructure upgrade for LTE services in central region",
    title: "LTE Upgrade",
    description: "Network infrastructure upgrade for LTE services in central region",
    estimated_cost: 543280000,
    estimated_value: 543280000,
    budget: 217312000,
    proposed_budget: 217312000,
    proposed_budget_percentage: 40,
    procurement_method: {
      id: 1,
      method_name: "Open Tender"
    },
    status: {
      id: 1,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 1,
      priority_name: "High"
    },
    timeline: {
      planning_start: "2024-03-15T10:00:00Z",
      planning_end: "2024-04-15T10:00:00Z",
      tender_publication: "2024-05-01T10:00:00Z",
      submission_deadline: "2024-05-30T10:00:00Z",
      evaluation_period: "2024-06-15T10:00:00Z",
      contract_award: "2024-07-01T10:00:00Z",
    },
    approvals: {
      technical_approval: true,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z",
    created_by: "admin",
    committee_id: 1,
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Initial planning and vendor selection",
        status: "Completed",
        created_at: "2024-03-15T10:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Equipment procurement and delivery",
        status: "In Progress",
        created_at: "2024-03-15T10:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Installation and testing",
        status: "Planned",
        created_at: "2024-03-15T10:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Network optimization and project closure",
        status: "Planned",
        created_at: "2024-03-15T10:00:00Z"
      }
    ]
  },
  {
    id: 2,
    policy_number: "PP-2080-WL-O-01",
    department: "Wireless",
    dept_index: "01",
    project_name: "2G Expansion",
    project_description: "2G network expansion in rural areas of western region",
    title: "2G Expansion",
    description: "2G network expansion in rural areas of western region",
    estimated_cost: 107900000,
    estimated_value: 107900000,
    budget: 102505000,
    proposed_budget: 102505000,
    proposed_budget_percentage: 95,
    procurement_method: {
      id: 2,
      method_name: "Direct Procurement"
    },
    status: {
      id: 2,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 2,
      priority_name: "Medium"
    },
    timeline: {
      planning_start: "2024-03-16T09:00:00Z",
      planning_end: "2024-04-16T09:00:00Z",
      tender_publication: "2024-05-02T09:00:00Z",
      submission_deadline: "2024-05-31T09:00:00Z",
      evaluation_period: "2024-06-16T09:00:00Z",
      contract_award: "2024-07-02T09:00:00Z",
    },
    approvals: {
      technical_approval: true,
      financial_approval: true,
      management_approval: false,
    },
    created_at: "2024-03-16T09:00:00Z",
    updated_at: "2024-03-16T09:00:00Z",
    created_by: "admin",
    committee_id: 2,
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Site survey and planning",
        status: "Completed",
        created_at: "2024-03-16T09:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Equipment procurement",
        status: "Completed",
        created_at: "2024-03-16T09:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Installation phase",
        status: "In Progress",
        created_at: "2024-03-16T09:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Testing and optimization",
        status: "Planned",
        created_at: "2024-03-16T09:00:00Z"
      }
    ]
  },
  {
    id: 3,
    policy_number: "PP-2080-WL-N-02",
    department: "Wireline",
    dept_index: "02",
    project_name: "Fiber Network Expansion",
    project_description: "Expanding fiber network coverage in metropolitan areas",
    title: "Fiber Network Expansion",
    description: "Expanding fiber network coverage in metropolitan areas",
    estimated_cost: 892500000,
    estimated_value: 892500000,
    budget: 850000000,
    proposed_budget: 850000000,
    proposed_budget_percentage: 95,
    procurement_method: {
      id: 1,
      method_name: "Open Tender"
    },
    status: {
      id: 1,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 1,
      priority_name: "High"
    },
    timeline: {
      planning_start: "2024-03-17T10:00:00Z",
      planning_end: "2024-04-17T10:00:00Z",
      tender_publication: "2024-05-03T10:00:00Z",
      submission_deadline: "2024-05-31T10:00:00Z",
      evaluation_period: "2024-06-17T10:00:00Z",
      contract_award: "2024-07-03T10:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-17T10:00:00Z",
    updated_at: "2024-03-17T10:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Planning and design phase",
        status: "Completed",
        created_at: "2024-03-17T10:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Infrastructure setup",
        status: "In Progress",
        created_at: "2024-03-17T10:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Network deployment",
        status: "Planned",
        created_at: "2024-03-17T10:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Testing and optimization",
        status: "Planned",
        created_at: "2024-03-17T10:00:00Z"
      }
    ]
  },
  {
    id: 4,
    policy_number: "PP-2080-WL-O-02",
    department: "Wireless",
    dept_index: "02",
    project_name: "5G Network Implementation",
    project_description: "Implementation of 5G network in key urban areas",
    title: "5G Network Implementation",
    description: "Implementation of 5G network in key urban areas",
    estimated_cost: 1250000000,
    estimated_value: 1250000000,
    budget: 1200000000,
    proposed_budget: 1200000000,
    proposed_budget_percentage: 96,
    procurement_method: {
      id: 1,
      method_name: "Open Tender"
    },
    status: {
      id: 1,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 1,
      priority_name: "High"
    },
    timeline: {
      planning_start: "2024-03-18T09:00:00Z",
      planning_end: "2024-04-18T09:00:00Z",
      tender_publication: "2024-05-04T09:00:00Z",
      submission_deadline: "2024-05-31T09:00:00Z",
      evaluation_period: "2024-06-18T09:00:00Z",
      contract_award: "2024-07-04T09:00:00Z",
    },
    approvals: {
      technical_approval: true,
      financial_approval: true,
      management_approval: true,
    },
    created_at: "2024-03-18T09:00:00Z",
    updated_at: "2024-03-18T09:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "5G implementation phase 1",
        status: "Completed",
        created_at: "2024-03-18T09:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "5G implementation phase 2",
        status: "Completed",
        created_at: "2024-03-18T09:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "5G implementation phase 3",
        status: "Planned",
        created_at: "2024-03-18T09:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "5G implementation phase 4",
        status: "Planned",
        created_at: "2024-03-18T09:00:00Z"
      }
    ]
  },
  {
    id: 5,
    policy_number: "PP-2080-WL-N-03",
    department: "Wireline",
    dept_index: "03",
    project_name: "Data Center Upgrade",
    project_description: "Upgrading existing data center infrastructure",
    title: "Data Center Upgrade",
    description: "Upgrading existing data center infrastructure",
    estimated_cost: 750000000,
    estimated_value: 750000000,
    budget: 700000000,
    proposed_budget: 700000000,
    proposed_budget_percentage: 93,
    procurement_method: {
      id: 2,
      method_name: "Direct Procurement"
    },
    status: {
      id: 2,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 2,
      priority_name: "Medium"
    },
    timeline: {
      planning_start: "2024-03-19T11:00:00Z",
      planning_end: "2024-04-19T11:00:00Z",
      tender_publication: "2024-05-05T11:00:00Z",
      submission_deadline: "2024-05-31T11:00:00Z",
      evaluation_period: "2024-06-19T11:00:00Z",
      contract_award: "2024-07-05T11:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-19T11:00:00Z",
    updated_at: "2024-03-19T11:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Data center upgrade phase 1",
        status: "Completed",
        created_at: "2024-03-19T11:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Data center upgrade phase 2",
        status: "Planned",
        created_at: "2024-03-19T11:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Data center upgrade phase 3",
        status: "Planned",
        created_at: "2024-03-19T11:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Data center upgrade phase 4",
        status: "Planned",
        created_at: "2024-03-19T11:00:00Z"
      }
    ]
  },
  {
    id: 6,
    policy_number: "PP-2080-WL-O-03",
    department: "Wireless",
    dept_index: "03",
    project_name: "Rural Connectivity",
    project_description: "Expanding wireless coverage in rural areas",
    title: "Rural Connectivity",
    description: "Expanding wireless coverage in rural areas",
    estimated_cost: 450000000,
    estimated_value: 450000000,
    budget: 425000000,
    proposed_budget: 425000000,
    proposed_budget_percentage: 94,
    procurement_method: {
      id: 2,
      method_name: "Direct Procurement"
    },
    status: {
      id: 2,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 2,
      priority_name: "Medium"
    },
    timeline: {
      planning_start: "2024-03-20T10:00:00Z",
      planning_end: "2024-04-20T10:00:00Z",
      tender_publication: "2024-05-06T10:00:00Z",
      submission_deadline: "2024-05-31T10:00:00Z",
      evaluation_period: "2024-06-20T10:00:00Z",
      contract_award: "2024-07-06T10:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Rural connectivity phase 1",
        status: "Planned",
        created_at: "2024-03-20T10:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Rural connectivity phase 2",
        status: "Planned",
        created_at: "2024-03-20T10:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Rural connectivity phase 3",
        status: "Planned",
        created_at: "2024-03-20T10:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Rural connectivity phase 4",
        status: "Planned",
        created_at: "2024-03-20T10:00:00Z"
      }
    ]
  },
  {
    id: 7,
    policy_number: "PP-2080-WL-N-04",
    department: "Wireline",
    dept_index: "04",
    project_name: "Network Security Enhancement",
    project_description: "Implementing advanced security measures",
    title: "Network Security Enhancement",
    description: "Implementing advanced security measures",
    estimated_cost: 350000000,
    estimated_value: 350000000,
    budget: 340000000,
    proposed_budget: 340000000,
    proposed_budget_percentage: 97,
    procurement_method: {
      id: 1,
      method_name: "Open Tender"
    },
    status: {
      id: 1,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 1,
      priority_name: "High"
    },
    timeline: {
      planning_start: "2024-03-21T09:00:00Z",
      planning_end: "2024-04-21T09:00:00Z",
      tender_publication: "2024-05-07T09:00:00Z",
      submission_deadline: "2024-05-31T09:00:00Z",
      evaluation_period: "2024-06-21T09:00:00Z",
      contract_award: "2024-07-07T09:00:00Z",
    },
    approvals: {
      technical_approval: true,
      financial_approval: true,
      management_approval: false,
    },
    created_at: "2024-03-21T09:00:00Z",
    updated_at: "2024-03-21T09:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Security implementation phase 1",
        status: "Completed",
        created_at: "2024-03-21T09:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Security implementation phase 2",
        status: "Completed",
        created_at: "2024-03-21T09:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Security implementation phase 3",
        status: "Completed",
        created_at: "2024-03-21T09:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Security implementation phase 4",
        status: "In Progress",
        created_at: "2024-03-21T09:00:00Z"
      }
    ]
  },
  {
    id: 8,
    policy_number: "PP-2080-WL-O-04",
    department: "Wireless",
    dept_index: "04",
    project_name: "IoT Infrastructure",
    project_description: "Setting up IoT network infrastructure",
    title: "IoT Infrastructure",
    description: "Setting up IoT network infrastructure",
    estimated_cost: 280000000,
    estimated_value: 280000000,
    budget: 260000000,
    proposed_budget: 260000000,
    proposed_budget_percentage: 93,
    procurement_method: {
      id: 2,
      method_name: "Direct Procurement"
    },
    status: {
      id: 2,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 2,
      priority_name: "Medium"
    },
    timeline: {
      planning_start: "2024-03-22T10:00:00Z",
      planning_end: "2024-04-22T10:00:00Z",
      tender_publication: "2024-05-08T10:00:00Z",
      submission_deadline: "2024-05-31T10:00:00Z",
      evaluation_period: "2024-06-22T10:00:00Z",
      contract_award: "2024-07-08T10:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-22T10:00:00Z",
    updated_at: "2024-03-22T10:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "IoT infrastructure phase 1",
        status: "Completed",
        created_at: "2024-03-22T10:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "IoT infrastructure phase 2",
        status: "Completed",
        created_at: "2024-03-22T10:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "IoT infrastructure phase 3",
        status: "In Progress",
        created_at: "2024-03-22T10:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "IoT infrastructure phase 4",
        status: "In Progress",
        created_at: "2024-03-22T10:00:00Z"
      }
    ]
  },
  {
    id: 9,
    policy_number: "PP-2080-WL-N-05",
    department: "Wireline",
    dept_index: "05",
    project_name: "Cloud Migration",
    project_description: "Migrating services to cloud infrastructure",
    title: "Cloud Migration",
    description: "Migrating services to cloud infrastructure",
    estimated_cost: 420000000,
    estimated_value: 420000000,
    budget: 400000000,
    proposed_budget: 400000000,
    proposed_budget_percentage: 95,
    procurement_method: {
      id: 1,
      method_name: "Open Tender"
    },
    status: {
      id: 1,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 1,
      priority_name: "High"
    },
    timeline: {
      planning_start: "2024-03-23T11:00:00Z",
      planning_end: "2024-04-23T11:00:00Z",
      tender_publication: "2024-05-09T11:00:00Z",
      submission_deadline: "2024-05-31T11:00:00Z",
      evaluation_period: "2024-06-23T11:00:00Z",
      contract_award: "2024-07-09T11:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-23T11:00:00Z",
    updated_at: "2024-03-23T11:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Cloud migration phase 1",
        status: "In Progress",
        created_at: "2024-03-23T11:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Cloud migration phase 2",
        status: "In Progress",
        created_at: "2024-03-23T11:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Cloud migration phase 3",
        status: "In Progress",
        created_at: "2024-03-23T11:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Cloud migration phase 4",
        status: "In Progress",
        created_at: "2024-03-23T11:00:00Z"
      }
    ]
  },
  {
    id: 10,
    policy_number: "PP-2080-WL-O-05",
    department: "Wireless",
    dept_index: "05",
    project_name: "Network Optimization",
    project_description: "Optimizing wireless network performance",
    title: "Network Optimization",
    description: "Optimizing wireless network performance",
    estimated_cost: 180000000,
    estimated_value: 180000000,
    budget: 170000000,
    proposed_budget: 170000000,
    proposed_budget_percentage: 94,
    procurement_method: {
      id: 2,
      method_name: "Direct Procurement"
    },
    status: {
      id: 2,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 2,
      priority_name: "Medium"
    },
    timeline: {
      planning_start: "2024-03-24T10:00:00Z",
      planning_end: "2024-04-24T10:00:00Z",
      tender_publication: "2024-05-10T10:00:00Z",
      submission_deadline: "2024-05-31T10:00:00Z",
      evaluation_period: "2024-06-24T10:00:00Z",
      contract_award: "2024-07-10T10:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-24T10:00:00Z",
    updated_at: "2024-03-24T10:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Network optimization phase 1",
        status: "Completed",
        created_at: "2024-03-24T10:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Network optimization phase 2",
        status: "Planned",
        created_at: "2024-03-24T10:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Network optimization phase 3",
        status: "Planned",
        created_at: "2024-03-24T10:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Network optimization phase 4",
        status: "Planned",
        created_at: "2024-03-24T10:00:00Z"
      }
    ]
  },
  {
    id: 11,
    policy_number: "PP-2080-WL-N-06",
    department: "Wireline",
    dept_index: "06",
    project_name: "Legacy System Upgrade",
    project_description: "Upgrading legacy network systems",
    title: "Legacy System Upgrade",
    description: "Upgrading legacy network systems",
    estimated_cost: 320000000,
    estimated_value: 320000000,
    budget: 300000000,
    proposed_budget: 300000000,
    proposed_budget_percentage: 94,
    procurement_method: {
      id: 1,
      method_name: "Open Tender"
    },
    status: {
      id: 1,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 1,
      priority_name: "High"
    },
    timeline: {
      planning_start: "2024-03-25T09:00:00Z",
      planning_end: "2024-04-25T09:00:00Z",
      tender_publication: "2024-05-11T09:00:00Z",
      submission_deadline: "2024-05-31T09:00:00Z",
      evaluation_period: "2024-06-25T09:00:00Z",
      contract_award: "2024-07-11T09:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-25T09:00:00Z",
    updated_at: "2024-03-25T09:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "System upgrade phase 1",
        status: "Planned",
        created_at: "2024-03-25T09:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "System upgrade phase 2",
        status: "Planned",
        created_at: "2024-03-25T09:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "System upgrade phase 3",
        status: "Planned",
        created_at: "2024-03-25T09:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "System upgrade phase 4",
        status: "Planned",
        created_at: "2024-03-25T09:00:00Z"
      }
    ]
  },
  {
    id: 12,
    policy_number: "PP-2080-WL-O-06",
    department: "Wireless",
    dept_index: "06",
    project_name: "Smart City Infrastructure",
    project_description: "Implementing smart city network solutions",
    title: "Smart City Infrastructure",
    description: "Implementing smart city network solutions",
    estimated_cost: 550000000,
    estimated_value: 550000000,
    budget: 520000000,
    proposed_budget: 520000000,
    proposed_budget_percentage: 95,
    procurement_method: {
      id: 1,
      method_name: "Open Tender"
    },
    status: {
      id: 1,
      status_name: "Planning"
    },
    category: "Infrastructure",
    priority: {
      id: 1,
      priority_name: "High"
    },
    timeline: {
      planning_start: "2024-03-26T10:00:00Z",
      planning_end: "2024-04-26T10:00:00Z",
      tender_publication: "2024-05-12T10:00:00Z",
      submission_deadline: "2024-05-31T10:00:00Z",
      evaluation_period: "2024-06-26T10:00:00Z",
      contract_award: "2024-07-12T10:00:00Z",
    },
    approvals: {
      technical_approval: false,
      financial_approval: false,
      management_approval: false,
    },
    created_at: "2024-03-26T10:00:00Z",
    updated_at: "2024-03-26T10:00:00Z",
    created_by: "admin",
    quarterly_targets: [
      {
        quarter: "Q1",
        target_details: "Smart city implementation phase 1",
        status: "In Progress",
        created_at: "2024-03-26T10:00:00Z"
      },
      {
        quarter: "Q2",
        target_details: "Smart city implementation phase 2",
        status: "Planned",
        created_at: "2024-03-26T10:00:00Z"
      },
      {
        quarter: "Q3",
        target_details: "Smart city implementation phase 3",
        status: "Planned",
        created_at: "2024-03-26T10:00:00Z"
      },
      {
        quarter: "Q4",
        target_details: "Smart city implementation phase 4",
        status: "Planned",
        created_at: "2024-03-26T10:00:00Z"
      }
    ]
  }
];
