import type { Committee, CommitteeMember } from "@/types/committee";

export const mockCommittees: Committee[] = [
  {
    _id: "1",
    name: "Technical Evaluation Committee",
    purpose: "Evaluate technical specifications and proposals",
    committee_type: "evaluation",
    procurement_plan: 1,
    formation_date: "2024-01-15",
    specification_submission_date: "2024-02-01",
    review_date: "2024-02-15",
    schedule: "Weekly meetings every Tuesday",
    should_notify: true,
    formationLetterURL: "/documents/tec-formation-letter.pdf",
    createdBy: {
      _id: "1",
      name: "Admin User",
      email: "admin@ntc.net.np",
      role: "admin",
      employeeId: "EMP001"
    },
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    membersList: [
      {
        _id: "1",
        employeeId: "EMP001",
        name: "John Smith",
        role: "chairperson",
        email: "john.smith@ntc.net.np",
        department: "Technical",
        designation: "Senior Engineer"
      },
      {
        _id: "2",
        employeeId: "EMP002",
        name: "Sarah Johnson",
        role: "member",
        email: "sarah.j@ntc.net.np",
        department: "Procurement",
        designation: "Procurement Officer"
      },
      {
        _id: "3",
        employeeId: "EMP003",
        name: "Raj Sharma",
        role: "secretary",
        email: "raj.sharma@ntc.net.np",
        department: "Finance",
        designation: "Finance Manager"
      }
    ],
    approvalStatus: "approved"
  }
];

export const mockCommitteeMembers: CommitteeMember[] = [
  {
    employeeId: "TEC001",
    name: "John Doe",
    email: "john.doe@example.com",
    department: "Engineering",
    phone: "123-456-7890",
    role: "chairperson",
    designation: "Senior Engineer",
    tasks: ["Review specifications", "Approve designs"]
  },
  {
    employeeId: "TEC002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    department: "Procurement",
    phone: "987-654-3210",
    role: "member",
    designation: "Procurement Officer",
    tasks: ["Prepare tender documents", "Evaluate bids"]
  },
  {
    employeeId: "TEC003",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    department: "Legal",
    phone: "555-123-4567",
    role: "member",
    designation: "Legal Advisor",
    tasks: ["Ensure compliance", "Review contracts"]
  },
  {
    employeeId: "TEC004",
    name: "Bob Williams",
    email: "bob.williams@example.com",
    department: "Finance",
    phone: "111-222-3333",
    role: "member",
    designation: "Finance Manager",
    tasks: ["Manage budget", "Approve payments"]
  },
  {
    employeeId: "TEC005",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    department: "Technical",
    phone: "444-555-6666",
    role: "member",
    designation: "System Analyst",
    tasks: ["Analyze system requirements", "Design solutions"]
  }
];
