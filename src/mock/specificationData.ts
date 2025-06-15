
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

export const mockSpecifications: SpecificationDocument[] = [];

export const mockReviews: ReviewSession[] = [];

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
