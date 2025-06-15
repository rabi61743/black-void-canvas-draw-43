import type { Tender } from "@/types/tender";

export const mockTenders: Tender[] = [
  {
    id: 1,
    procurement_plan: 1, // Add required field
    specification: 1, // Add required field
    ifbNumber: "IFB-2024-001",
    title: "Network Infrastructure Upgrade",
    description: "Procurement of network equipment including routers, switches, and security appliances for the main office.",
    publishDate: "2024-01-15",
    openingDate: "2024-02-15",
    bidValidity: "90 days",
    status: "published",
    approvalStatus: "approved",
    comments: [
      {
        id: 1,
        text: "Technical specifications reviewed and approved",
        author: "John Smith",
        createdAt: "2024-01-10T10:30:00Z",
        timestamp: "2024-01-10T10:30:00Z"
      },
      {
        id: 2,
        text: "Budget allocation confirmed",
        author: "Sarah Johnson",
        createdAt: "2024-01-12T14:20:00Z",
        timestamp: "2024-01-12T14:20:00Z"
      }
    ],
    documents: []
  },
  {
    id: 2,
    procurement_plan: 2, // Add required field
    specification: 2, // Add required field
    ifbNumber: "IFB-2024-002",
    title: "Office Furniture Procurement",
    description: "Supply and installation of office furniture for the new branch office including desks, chairs, and storage units.",
    publishDate: "2024-01-20",
    openingDate: "2024-02-20",
    bidValidity: "60 days",
    status: "draft",
    approvalStatus: "pending",
    comments: [
      {
        id: 3,
        text: "Initial draft prepared, awaiting review",
        author: "Mike Wilson",
        createdAt: "2024-01-18T09:15:00Z",
        timestamp: "2024-01-18T09:15:00Z"
      }
    ],
    documents: []
  }
];
