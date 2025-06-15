
import type { SpecificationDocument, ReviewSession, DocumentVersion } from "@/types/specification";

const mockMembers = [
  {
    id: 1,
    name: "John Smith",
    employeeId: "EMP001",
    role: "chairperson",
    department: "Engineering",
    email: "john.smith@example.com",
    phone: "+1-555-0101",
    tasks: [],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    employeeId: "EMP002",
    role: "member",
    department: "Quality Assurance",
    email: "sarah.j@example.com",
    phone: "+1-555-0102",
    tasks: [],
  },
];

const mockVersionHistory: DocumentVersion[] = [
  {
    id: 1,
    version: 1,
    documentUrl: "/docs/network-spec-v1.pdf",
    changes: "Initial specification document",
    submittedBy: 1,
    submittedAt: "2024-03-15T10:00:00Z",
  },
  {
    id: 2,
    version: 2,
    documentUrl: "/docs/network-spec-v2.pdf",
    changes: "Updated bandwidth requirements",
    submittedBy: 2,
    submittedAt: "2024-03-16T14:30:00Z",
  },
];

export const mockSpecifications: SpecificationDocument[] = [
  {
    id: 1,
    procurement_plan: "1",
    title: "Network Infrastructure Upgrade",
    description: "Specification for upgrading the core network infrastructure including routers, switches, and security appliances.",
    version: 1,
    status: "draft",
    submittedBy: "1",
    submittedAt: "2024-01-15T10:30:00Z",
    lastModified: "2024-01-15T10:30:00Z",
    documentUrl: "/documents/network-infrastructure-spec-v1.pdf",
    committeeId: 1,
    comments: [
      "Initial draft completed",
      "Pending technical review"
    ],
    versionHistory: [
      {
        version: 1,
        changes: "Initial version created",
        submittedBy: 1,
        submittedAt: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 2,
    procurement_plan: "1",
    title: "Server Hardware Specification",
    description: "Detailed specifications for new server hardware procurement including performance requirements and compatibility standards.",
    version: 2,
    status: "under_review",
    submittedBy: "1",
    submittedAt: "2024-01-10T14:20:00Z",
    lastModified: "2024-01-12T09:15:00Z",
    documentUrl: "/documents/server-hardware-spec-v2.pdf",
    committeeId: 1,
    comments: [
      "Version 1 feedback incorporated",
      "Under committee review",
      "Technical requirements validated"
    ],
    versionHistory: [
      {
        version: 1,
        changes: "Initial specification created",
        submittedBy: 2,
        submittedAt: "2024-01-10T14:20:00Z"
      },
      {
        version: 2,
        changes: "Updated based on technical review feedback",
        submittedBy: 3,
        submittedAt: "2024-01-12T09:15:00Z"
      }
    ]
  }
];

export const mockReviews: ReviewSession[] = [
  {
    id: 1,
    specificationId: 1,
    scheduledDate: "2024-03-20T14:00:00Z",
    status: "scheduled",
    reviewers: mockMembers,
    minutes: "",
    comments: [],
    documents: [],
  },
];

export const getSpecificationById = (id: number): SpecificationDocument | undefined => {
  return mockSpecifications.find((spec) => spec.id === id);
};

export const getVersionHistory = (specId: number): DocumentVersion[] | undefined => {
  const spec = getSpecificationById(specId);
  return spec?.versionHistory;
};

export const getReviewBySpecificationId = (specId: number): ReviewSession | undefined => {
  return mockReviews.find((review) => review.specificationId === specId);
};
