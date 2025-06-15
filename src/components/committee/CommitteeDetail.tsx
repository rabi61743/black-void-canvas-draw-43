// CommitteeDetail.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, ArrowLeft, Users, FileText, FileCheck, MessageSquare, ChevronRight, User, Mail, Briefcase, File, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Committee } from "@/types/committee";
import { Skeleton } from "@/components/ui/skeleton";

const CommitteeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Committee not found"
              : "Failed to fetch committee"
          );
        }

        const data = await response.json();
        if (!data.data?.committee) {
          throw new Error("Invalid committee data");
        }
        setCommittee({
          ...data.data.committee,
          membersList: Array.isArray(data.data.committee.membersList) ? data.data.committee.membersList : [],
          approvalStatus: data.data.committee.approvalStatus || 'active',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to fetch committee',
          variant: "destructive",
        });
        navigate("/committee");
      } finally {
        setLoading(false);
      }
    };

    fetchCommittee();
  }, [id, navigate, toast]);

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    active: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, 'PP');
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card className="p-6 space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Separator />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (error || !committee) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-red-500">{error || "Committee not found"}</p>
        <Button onClick={() => navigate("/committee")} className="mt-4">
          Back to Committees
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/committee")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Committees
        </Button>
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2">
            Home
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{committee.name || "Unnamed Committee"}</h1>
            <p className="text-gray-600 mt-2">{committee.purpose || "No purpose provided"}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusColors[committee.approvalStatus || 'default']}>
              {committee.approvalStatus?.toUpperCase() || 'ACTIVE'}
            </Badge>
            <p className="text-sm text-gray-500">
              Created by: {committee.createdBy?.name || "Unknown"}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Formation Date</p>
                  <p className="font-medium">
                    {formatDate(committee.formation_date)}
                  </p>
                </div>
              </div>

              {committee.specification_submission_date && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Spec Submission</p>
                    <p className="font-medium">
                      {formatDate(committee.specification_submission_date)}
                    </p>
                  </div>
                </div>
              )}

              {committee.review_date && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Review Date</p>
                    <p className="font-medium">
                      {formatDate(committee.review_date)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Committee Type</p>
                  <p className="font-medium capitalize">
                    {committee.committee_type || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Procurement Plan</p>
                  <p className="font-medium">
                    {committee.procurement_plan ? `Plan ID: ${committee.procurement_plan}` : "None"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Committee Members</h2>
                <Badge variant="outline" className="ml-auto">
                  {(Array.isArray(committee.membersList) ? committee.membersList.length : 0)} members
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Array.isArray(committee.membersList) && committee.membersList.length > 0) ? (
                  committee.membersList.map((member, index) => (
                    <Card key={`${member.employeeId}-${index}`} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-full">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{member.name || "Unknown"}</h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {member.role || 'Member'}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{member.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="h-4 w-4" />
                              <span>{member.department || "Unknown"}</span>
                            </div>
                            {member.designation && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ChevronRight className="h-4 w-4" />
                                <span>{member.designation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No members</p>
                )}
              </div>
            </div>

            <Separator />

            {committee.formationLetterURL && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <File className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold">Formation Letter</h2>
                </div>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Formation Letter</p>
                        <p className="text-sm text-gray-500">Download to view</p>
                      </div>
                    </div>
                    <a
                      href={`/api/committee/committees/download-formation-letter/${id}/`}
                      download
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      Download
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommitteeDetail;


// import { useParams, useNavigate, Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Calendar, ArrowLeft, Users, FileText, FileCheck, MessageSquare, ChevronRight, User, Mail, Briefcase, File, Package } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { format } from "date-fns";
// import { useEffect, useState } from "react";
// import { Committee } from "@/types/committee";
// import { Skeleton } from "@/components/ui/skeleton";

// const CommitteeDetail = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [committee, setCommittee] = useState<Committee | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCommittee = async () => {
//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${id}/`,
//           {
//             headers: {
//               "Authorization": `Bearer ${localStorage.getItem("token")}`
//             }
//           }
//         );

//         if (!response.ok) {
//           throw new Error(
//             response.status === 404 
//               ? "Committee not found" 
//               : "Failed to fetch committee"
//           );
//         }

//         const data = await response.json();
//         if (!data.data?.committee) {
//           throw new Error("Invalid committee data");
//         }
//         setCommittee({
//           ...data.data.committee,
//           membersList: Array.isArray(data.data.committee.membersList) ? data.data.committee.membersList : [],
//           approvalStatus: data.data.committee.approvalStatus || 'active'
//         });
//       } catch (err) {
//         setError(err.message);
//         toast({
//           title: "Error",
//           description: err.message,
//           variant: "destructive",
//         });
//         navigate("/committee");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCommittee();
//   }, [id, navigate, toast]);

//   const statusColors = {
//     draft: "bg-gray-100 text-gray-800",
//     pending: "bg-yellow-100 text-yellow-800",
//     approved: "bg-green-100 text-green-800",
//     rejected: "bg-red-100 text-red-800",
//     active: "bg-blue-100 text-blue-800",
//     default: "bg-gray-100 text-gray-800"
//   };

//   const formatDate = (dateString: string | null | undefined) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "N/A";
//       return format(date, 'PP');
//     } catch {
//       return "N/A";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-6 space-y-6">
//         <div className="flex items-center gap-2">
//           <Skeleton className="h-10 w-24" />
//           <Skeleton className="h-10 w-24" />
//         </div>
//         <Card className="p-6 space-y-6">
//           <Skeleton className="h-8 w-1/2" />
//           <Skeleton className="h-4 w-3/4" />
//           <Separator />
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="space-y-4">
//               <Skeleton className="h-6 w-1/3" />
//               <Skeleton className="h-20 w-full" />
//             </div>
//           ))}
//         </Card>
//       </div>
//     );
//   }

//   if (error || !committee) {
//     return (
//       <div className="container mx-auto px-4 py-6 text-center">
//         <p className="text-red-500">{error || "Committee not found"}</p>
//         <Button onClick={() => navigate("/committee")} className="mt-4">
//           Back to Committees
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="flex items-center gap-2 mb-6">
//         <Button 
//           variant="outline" 
//           onClick={() => navigate("/committee")}
//           className="flex items-center gap-2"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back to Committees
//         </Button>
//         <Link to="/">
//           <Button variant="ghost" className="flex items-center gap-2">
//             Home
//           </Button>
//         </Link>
//       </div>

//       <div className="space-y-6">
//         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
//           <div>
//             <h1 className="text-2xl font-bold">{committee.name || "Unnamed Committee"}</h1>
//             <p className="text-gray-600 mt-2">{committee.purpose || "No purpose provided"}</p>
//           </div>
//           <div className="flex flex-col items-end gap-2">
//             <Badge className={statusColors[committee.approvalStatus || 'default']}>
//               {committee.approvalStatus?.toUpperCase() || 'ACTIVE'}
//             </Badge>
//             <p className="text-sm text-gray-500">
//               Created by: {committee.createdBy?.name || "Unknown"}
//             </p>
//           </div>
//         </div>

//         <Card className="p-6">
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <Calendar className="h-5 w-5 text-blue-600" />
//                 <div>
//                   <p className="text-sm text-gray-500">Formation Date</p>
//                   <p className="font-medium">
//                     {formatDate(committee.formation_date)}
//                   </p>
//                 </div>
//               </div>

//               {committee.specification_submission_date && (
//                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                   <FileCheck className="h-5 w-5 text-green-600" />
//                   <div>
//                     <p className="text-sm text-gray-500">Spec Submission</p>
//                     <p className="font-medium">
//                       {formatDate(committee.specification_submission_date)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {committee.review_date && (
//                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                   <MessageSquare className="h-5 w-5 text-purple-600" />
//                   <div>
//                     <p className="text-sm text-gray-500">Review Date</p>
//                     <p className="font-medium">
//                       {formatDate(committee.review_date)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <Package className="h-5 w-5 text-indigo-600" />
//                 <div>
//                   <p className="text-sm text-gray-500">Committee Type</p>
//                   <p className="font-medium capitalize">
//                     {committee.committee_type || "N/A"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <Package className="h-5 w-5 text-teal-600" />
//                 <div>
//                   <p className="text-sm text-gray-500">Procurement Plan</p>
//                   <p className="font-medium">
//                     {committee.procurement_plan ? `Plan ID: ${committee.procurement_plan}` : "None"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <Separator />

//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <Users className="h-5 w-5 text-gray-600" />
//                 <h2 className="text-lg font-semibold">Committee Members</h2>
//                 <Badge variant="outline" className="ml-auto">
//                   {(Array.isArray(committee.membersList) ? committee.membersList.length : 0)} members
//                 </Badge>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {(Array.isArray(committee.membersList) && committee.membersList.length > 0) ? (
//                   committee.membersList.map((member, index) => (
//                     <Card key={`${member.employeeId}-${index}`} className="p-4">
//                       <div className="flex items-start gap-4">
//                         <div className="bg-gray-100 p-3 rounded-full">
//                           <User className="h-5 w-5 text-gray-600" />
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="font-medium">{member.name || "Unknown"}</h3>
//                           <p className="text-sm text-gray-600 capitalize">
//                             {member.role || 'Member'}
//                           </p>
//                           <div className="mt-2 space-y-1">
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <Mail className="h-4 w-4" />
//                               <span>{member.email || "N/A"}</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                               <Briefcase className="h-4 w-4" />
//                               <span>{member.department || "Unknown"}</span>
//                             </div>
//                             {member.designation && (
//                               <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <ChevronRight className="h-4 w-4" />
//                                 <span>{member.designation}</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </Card>
//                   ))
//                 ) : (
//                   <p className="text-sm text-gray-500">No members</p>
//                 )}
//               </div>
//             </div>

//             <Separator />

//             {committee.formationLetterURL && (
//               <div>
//                 <div className="flex items-center gap-2 mb-4">
//                   <File className="h-5 w-5 text-gray-600" />
//                   <h2 className="text-lg font-semibold">Formation Letter</h2>
//                 </div>
//                 <Card className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <FileText className="h-5 w-5 text-blue-600" />
//                       <div>
//                         <p className="font-medium">Formation Letter</p>
//                         <p className="text-sm text-gray-500">Download to view</p>
//                       </div>
//                     </div>
//                     <a
//                       href={committee.formationLetterURL}
//                       download
//                       className="text-blue-600 hover:underline flex items-center gap-2"
//                     >
//                       Download
//                       <ChevronRight className="h-4 w-4" />
//                     </a>
//                   </div>
//                 </Card>
//               </div>
//             )}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CommitteeDetail;

// /////// #### START OF CODE

// // import { useParams, useNavigate, Link } from "react-router-dom";
// // import { Button } from "@/components/ui/button";
// // import { Card } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import { Calendar, ArrowLeft, Users, FileText, FileCheck, MessageSquare, ChevronRight, User, Mail, Briefcase, File } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { format } from "date-fns";
// // import { useEffect, useState } from "react";
// // import { Committee } from "@/types/committee";
// // import { Skeleton } from "@/components/ui/skeleton";

// // const CommitteeDetail = () => {
// //   const { id } = useParams<{ id: string }>();
// //   const navigate = useNavigate();
// //   const { toast } = useToast();
// //   const [committee, setCommittee] = useState<Committee | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     const fetchCommittee = async () => {
// //       try {
// //         const response = await fetch(
// //           `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${id}/`,
// //           {
// //             headers: {
// //               "Authorization": `Bearer ${localStorage.getItem("token")}`
// //             }
// //           }
// //         );

// //         if (!response.ok) {
// //           throw new Error(
// //             response.status === 404 
// //               ? "Committee not found" 
// //               : "Failed to fetch committee"
// //           );
// //         }

// //         const data = await response.json();
// //         if (!data.data?.committee) {
// //           throw new Error("Invalid committee data");
// //         }
// //         console.log("Fetched committee:", JSON.stringify(data.data.committee, null, 2));
// //         setCommittee({
// //           ...data.data.committee,
// //           membersList: Array.isArray(data.data.committee.membersList) ? data.data.committee.membersList : [],
// //           approvalStatus: data.data.committee.approvalStatus || 'active'
// //         });
// //       } catch (err) {
// //         setError(err.message);
// //         toast({
// //           title: "Error",
// //           description: err.message,
// //           variant: "destructive",
// //         });
// //         navigate("/committee");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchCommittee();
// //   }, [id, navigate, toast]);

// //   const statusColors = {
// //     draft: "bg-gray-100 text-gray-800",
// //     pending: "bg-yellow-100 text-yellow-800",
// //     approved: "bg-green-100 text-green-800",
// //     rejected: "bg-red-100 text-red-800",
// //     active: "bg-blue-100 text-blue-800",
// //     default: "bg-gray-100 text-gray-800"
// //   };

// //   const formatDate = (dateString: string | null | undefined) => {
// //     if (!dateString) return "N/A";
// //     try {
// //       const date = new Date(dateString);
// //       if (isNaN(date.getTime())) return "N/A";
// //       return format(date, 'PP');
// //     } catch {
// //       return "N/A";
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="container mx-auto px-4 py-6 space-y-6">
// //         <div className="flex items-center gap-2">
// //           <Skeleton className="h-10 w-24" />
// //           <Skeleton className="h-10 w-24" />
// //         </div>
// //         <Card className="p-6 space-y-6">
// //           <Skeleton className="h-8 w-1/2" />
// //           <Skeleton className="h-4 w-3/4" />
// //           <Separator />
// //           {[...Array(3)].map((_, i) => (
// //             <div key={i} className="space-y-4">
// //               <Skeleton className="h-6 w-1/3" />
// //               <Skeleton className="h-20 w-full" />
// //             </div>
// //           ))}
// //         </Card>
// //       </div>
// //     );
// //   }

// //   if (error || !committee) {
// //     return (
// //       <div className="container mx-auto px-4 py-6 text-center">
// //         <p className="text-red-500">{error || "Committee not found"}</p>
// //         <Button onClick={() => navigate("/committee")} className="mt-4">
// //           Back to Committees
// //         </Button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="container mx-auto px-4 py-6">
// //       <div className="flex items-center gap-2 mb-6">
// //         <Button 
// //           variant="outline" 
// //           onClick={() => navigate("/committee")}
// //           className="flex items-center gap-2"
// //         >
// //           <ArrowLeft className="h-4 w-4" />
// //           Back to Committees
// //         </Button>
// //         <Link to="/">
// //           <Button variant="ghost" className="flex items-center gap-2">
// //             Home
// //           </Button>
// //         </Link>
// //       </div>

// //       <div className="space-y-6">
// //         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
// //           <div>
// //             <h1 className="text-2xl font-bold">{committee.name || "Unnamed Committee"}</h1>
// //             <p className="text-gray-600 mt-2">{committee.purpose || "No purpose provided"}</p>
// //           </div>
// //           <div className="flex flex-col items-end gap-2">
// //             <Badge className={statusColors[committee.approvalStatus || 'default']}>
// //               {committee.approvalStatus?.toUpperCase() || 'ACTIVE'}
// //             </Badge>
// //             <p className="text-sm text-gray-500">
// //               Created by: {committee.createdBy?.name || "Unknown"}
// //             </p>
// //           </div>
// //         </div>

// //         <Card className="p-6">
// //           <div className="space-y-6">
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// //                 <Calendar className="h-5 w-5 text-blue-600" />
// //                 <div>
// //                   <p className="text-sm text-gray-500">Formation Date</p>
// //                   <p className="font-medium">
// //                     {formatDate(committee.formation_date)}
// //                   </p>
// //                 </div>
// //               </div>

// //               {committee.specification_submission_date && (
// //                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// //                   <FileCheck className="h-5 w-5 text-green-600" />
// //                   <div>
// //                     <p className="text-sm text-gray-500">Spec Submission</p>
// //                     <p className="font-medium">
// //                       {formatDate(committee.specification_submission_date)}
// //                     </p>
// //                   </div>
// //                 </div>
// //               )}

// //               {committee.review_date && (
// //                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// //                   <MessageSquare className="h-5 w-5 text-purple-600" />
// //                   <div>
// //                     <p className="text-sm text-gray-500">Review Date</p>
// //                     <p className="font-medium">
// //                       {formatDate(committee.review_date)}
// //                     </p>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>

// //             <Separator />

// //             <div>
// //               <div className="flex items-center gap-2 mb-4">
// //                 <Users className="h-5 w-5 text-gray-600" />
// //                 <h2 className="text-lg font-semibold">Committee Members</h2>
// //                 <Badge variant="outline" className="ml-auto">
// //                   {(Array.isArray(committee.membersList) ? committee.membersList.length : 0)} members
// //                 </Badge>
// //               </div>
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 {(Array.isArray(committee.membersList) && committee.membersList.length > 0) ? (
// //                   committee.membersList.map((member, index) => (
// //                     <Card key={`${member.employeeId}-${index}`} className="p-4">
// //                       <div className="flex items-start gap-4">
// //                         <div className="bg-gray-100 p-3 rounded-full">
// //                           <User className="h-5 w-5 text-gray-600" />
// //                         </div>
// //                         <div className="flex-1">
// //                           <h3 className="font-medium">{member.name || "Unknown"}</h3>
// //                           <p className="text-sm text-gray-600 capitalize">
// //                             {member.role || 'Member'}
// //                           </p>
// //                           <div className="mt-2 space-y-1">
// //                             <div className="flex items-center gap-2 text-sm text-gray-600">
// //                               <Mail className="h-4 w-4" />
// //                               <span>{member.email || "N/A"}</span>
// //                             </div>
// //                             <div className="flex items-center gap-2 text-sm text-gray-600">
// //                               <Briefcase className="h-4 w-4" />
// //                               <span>{member.department || "Unknown"}</span>
// //                             </div>
// //                             {member.designation && (
// //                               <div className="flex items-center gap-2 text-sm text-gray-600">
// //                                 <ChevronRight className="h-4 w-4" />
// //                                 <span>{member.designation}</span>
// //                               </div>
// //                             )}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </Card>
// //                   ))
// //                 ) : (
// //                   <p className="text-sm text-gray-500">No members</p>
// //                 )}
// //               </div>
// //             </div>

// //             <Separator />

// //             {committee.formationLetterURL && (
// //               <div>
// //                 <div className="flex items-center gap-2 mb-4">
// //                   <File className="h-5 w-5 text-gray-600" />
// //                   <h2 className="text-lg font-semibold">Formation Letter</h2>
// //                 </div>
// //                 <Card className="p-4">
// //                   <div className="flex items-center justify-between">
// //                     <div className="flex items-center gap-3">
// //                       <FileText className="h-5 w-5 text-blue-600" />
// //                       <div>
// //                         <p className="font-medium">Formation Letter</p>
// //                         <p className="text-sm text-gray-500">Download to view</p>
// //                       </div>
// //                     </div>
// //                     <a
// //                       href={committee.formationLetterURL}
// //                       download
// //                       className="text-blue-600 hover:underline flex items-center gap-2"
// //                     >
// //                       Download
// //                       <ChevronRight className="h-4 w-4" />
// //                     </a>
// //                   </div>
// //                 </Card>
// //               </div>
// //             )}
// //           </div>
// //         </Card>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CommitteeDetail;

// //////###### END OF CODE

// // import { useParams, useNavigate, Link } from "react-router-dom";
// // import { Button } from "@/components/ui/button";
// // import { Card } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import { Calendar, ArrowLeft, Users, FileText, Clock, Home, FileCheck, MessageSquare, ChevronRight, User, Mail, Briefcase, File } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { format } from "date-fns";
// // import { useEffect, useState } from "react";
// // import { Committee } from "@/types/committee";
// // import { Skeleton } from "@/components/ui/skeleton";

// // const CommitteeDetail = () => {
// //   const { id } = useParams<{ id: string }>();
// //   const navigate = useNavigate();
// //   const { toast } = useToast();
// //   const [committee, setCommittee] = useState<Committee | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     const fetchCommittee = async () => {
// //       try {
// //         const response = await fetch(
// //           `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${id}`, // Fixed to remove extra trailing slash
// //           {
// //             headers: {
// //               "Authorization": `Bearer ${localStorage.getItem("token")}`
// //             }
// //           }
// //         );

// //         if (!response.ok) {
// //           throw new Error(
// //             response.status === 404 
// //               ? "Committee not found" 
// //               : "Failed to fetch committee"
// //           );
// //         }

// //         const data = await response.json();
// //         if (!data.data?.committee) {
// //           throw new Error("Invalid committee data");
// //         }
// //         console.log("Fetched committee:", JSON.stringify(data.data.committee, null, 2));
// //         setCommittee({
// //           ...data.data.committee,
// //           members: Array.isArray(data.data.committee.members) ? data.data.committee.members : [],
// //           approvalStatus: data.data.committee.approvalStatus || 'active' // Fallback for approvalStatus
// //         });
// //       } catch (err) {
// //         setError(err.message);
// //         toast({
// //           title: "Error",
// //           description: err.message,
// //           variant: "destructive",
// //         });
// //         navigate("/committees");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchCommittee();
// //   }, [id, navigate, toast]);

// //   const statusColors = {
// //     draft: "bg-gray-100 text-gray-800",
// //     pending: "bg-yellow-100 text-yellow-800",
// //     approved: "bg-green-100 text-green-800",
// //     rejected: "bg-red-100 text-red-800",
// //     active: "bg-blue-100 text-blue-800", // Added active status
// //     default: "bg-gray-100 text-gray-800"
// //   };

// //   const formatDate = (dateString: string | null | undefined) => {
// //     if (!dateString) return "N/A";
// //     try {
// //       const date = new Date(dateString);
// //       if (isNaN(date.getTime())) return "N/A";
// //       return format(date, 'PP');
// //     } catch {
// //       return "N/A";
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="container mx-auto px-4 py-6 space-y-6">
// //         <div className="flex items-center gap-2">
// //           <Skeleton className="h-10 w-24" />
// //           <Skeleton className="h-10 w-24" />
// //         </div>
// //         <Card className="p-6 space-y-6">
// //           <Skeleton className="h-8 w-1/2" />
// //           <Skeleton className="h-4 w-3/4" />
// //           <Separator />
// //           {[...Array(3)].map((_, i) => (
// //             <div key={i} className="space-y-4">
// //               <Skeleton className="h-6 w-1/3" />
// //               <Skeleton className="h-20 w-full" />
// //             </div>
// //           ))}
// //         </Card>
// //       </div>
// //     );
// //   }

// //   if (error || !committee) {
// //     return (
// //       <div className="container mx-auto px-4 py-6 text-center">
// //         <p className="text-red-500">{error || "Committee not found"}</p>
// //         <Button onClick={() => navigate("/committees")} className="mt-4">
// //           Back to Committees
// //         </Button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="container mx-auto px-4 py-6">
// //       <div className="flex items-center gap-2 mb-6">
// //         <Button 
// //           variant="outline" 
// //           onClick={() => navigate("/committees")}
// //           className="flex items-center gap-2"
// //         >
// //           <ArrowLeft className="h-4 w-4" />
// //           Back to Committees
// //         </Button>
// //         <Link to="/">
// //           <Button variant="ghost" className="flex items-center gap-2">
// //             <Home className="h-4 w-4" />
// //             Home
// //           </Button>
// //         </Link>
// //       </div>

// //       <div className="space-y-6">
// //         {/* Header Section */}
// //         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
// //           <div>
// //             <h1 className="text-2xl font-bold">{committee.name || "Unnamed Committee"}</h1>
// //             <p className="text-gray-600 mt-2">{committee.purpose || "No purpose provided"}</p>
// //           </div>
// //           <div className="flex flex-col items-end gap-2">
// //             <Badge className={statusColors[committee.approvalStatus || 'default']}>
// //               {committee.approvalStatus?.toUpperCase() || 'ACTIVE'}
// //             </Badge>
// //             <p className="text-sm text-gray-500">
// //               Created by: {committee.createdBy?.name || "Unknown"}
// //             </p>
// //           </div>
// //         </div>

// //         <Card className="p-6">
// //           <div className="space-y-6">
// //             {/* Key Dates Section */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// //                 <Calendar className="h-5 w-5 text-blue-600" />
// //                 <div>
// //                   <p className="text-sm text-gray-500">Formation Date</p>
// //                   <p className="font-medium">
// //                     {formatDate(committee.formationDate)}
// //                   </p>
// //                 </div>
// //               </div>

// //               {committee.specificationSubmissionDate && (
// //                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// //                   <FileCheck className="h-5 w-5 text-green-600" />
// //                   <div>
// //                     <p className="text-sm text-gray-500">Spec Submission</p>
// //                     <p className="font-medium">
// //                       {formatDate(committee.specificationSubmissionDate)}
// //                     </p>
// //                   </div>
// //                 </div>
// //               )}

// //               {committee.reviewDate && (
// //                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// //                   <MessageSquare className="h-5 w-5 text-purple-600" />
// //                   <div>
// //                     <p className="text-sm text-gray-500">Review Date</p>
// //                     <p className="font-medium">
// //                       {formatDate(committee.reviewDate)}
// //                     </p>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>

// //             <Separator />
// //                          {/* Committee Members */}
// //              <div>
// //                <div className="flex items-center gap-2 mb-4">
// //                  <Users className="h-5 w-5 text-gray-600" />
// //                  <h2 className="text-lg font-semibold">Committee Members</h2>
// //                  <Badge variant="outline" className="ml-auto">
// //                    {(Array.isArray(committee.members) ? committee.members.length : 0)} members
// //                  </Badge>
// //                </div>
// //                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                  {(Array.isArray(committee.members) && committee.members.length > 0) ? (
// //                    committee.members.map((member, index) => (
// //                      <Card key={`${member.employeeId}-${index}`} className="p-4">
// //                        <div className="flex items-start gap-4">
// //                          <div className="bg-gray-100 p-3 rounded-full">
// //                            <User className="h-5 w-5 text-gray-600" />
// //                          </div>
// //                          <div className="flex-1">
// //                            <h3 className="font-medium">{member.name || "Unknown"}</h3>
// //                            <p className="text-sm text-gray-600 capitalize">
// //                              {member.role || 'Member'}
// //                            </p>
// //                            <div className="mt-2 space-y-1">
// //                              <div className="flex items-center gap-2 text-sm text-gray-600">
// //                                <Mail className="h-4 w-4" />
// //                                <span>{member.email || "N/A"}</span>
// //                              </div>
// //                              <div className="flex items-center gap-2 text-sm text-gray-600">
// //                                <Briefcase className="h-4 w-4" />
// //                                <span>{member.department || "Unknown"}</span>
// //                              </div>
// //                              {member.designation && (
// //                                <div className="flex items-center gap-2 text-sm text-gray-600">
// //                                  <ChevronRight className="h-4 w-4" />
// //                                  <span>{member.designation}</span>
// //                                </div>
// //                              )}
// //                            </div>
// //                          </div>
// //                        </div>
// //                      </Card>
// //                    ))
// //                  ) : (
// //                    <p className="text-sm text-gray-500">No members</p>
// //                  )}
// //                </div>
// //              </div>            


// //             <Separator />

// //             {/* Formation Letter Download */}
// //             {committee.formationLetter && (
// //               <div>
// //                 <div className="flex items-center gap-2 mb-4">
// //                   <File className="h-5 w-5 text-gray-600" />
// //                   <h2 className="text-lg font-semibold">Formation Letter</h2>
// //                 </div>
// //                 <Card className="p-4">
// //                   <div className="flex items-center justify-between">
// //                     <div className="flex items-center gap-3">
// //                       <FileText className="h-5 w-5 text-blue-600" />
// //                       <div>
// //                         <p className="font-medium">Formation Letter</p>
// //                         <p className="text-sm text-gray-500">Download to view</p>
// //                       </div>
// //                     </div>
// //                     <a
// //                       href={`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${committee._id || committee.id}/download/`}
// //                       download
// //                       className="text-blue-600 hover:underline flex items-center gap-2"
// //                     >
// //                       Download
// //                       <ChevronRight className="h-4 w-4" />
// //                     </a>
// //                   </div>
// //                 </Card>
// //               </div>
// //             )}
// //           </div>
// //         </Card>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CommitteeDetail;




// // // import { useParams, useNavigate, Link } from "react-router-dom";
// // // import { Button } from "@/components/ui/button";
// // // import { Card } from "@/components/ui/card";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Separator } from "@/components/ui/separator";
// // // import { 
// // //   Calendar, 
// // //   ArrowLeft, 
// // //   Users, 
// // //   FileText, 
// // //   Clock, 
// // //   Home,
// // //   FileCheck,
// // //   MessageSquare,
// // //   AlertCircle,
// // //   ChevronRight,
// // //   User,
// // //   Mail,
// // //   Briefcase,
// // //   File
// // // } from "lucide-react";
// // // import { useToast } from "@/hooks/use-toast";
// // // import { format } from "date-fns";
// // // import { useEffect, useState } from "react";
// // // import { Committee } from "@/types/committee";
// // // import { Skeleton } from "@/components/ui/skeleton";

// // // const CommitteeDetail = () => {
// // //   const { id } = useParams<{ id: string }>();
// // //   const navigate = useNavigate();
// // //   const { toast } = useToast();
// // //   const [committee, setCommittee] = useState<Committee | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);

// // //   useEffect(() => {
// // //     const fetchCommittee = async () => {
// // //       try {
// // //         const response = await fetch(

// // //           `${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${id}/`,
          
// // //           {
// // //             headers: {
// // //               "Authorization": `Bearer ${localStorage.getItem("token")}`
// // //             }
// // //           }
// // //         );

// // //         if (!response.ok) {
// // //           throw new Error(
// // //             response.status === 404 
// // //               ? "Committee not found" 
// // //               : "Failed to fetch committee"
// // //           );
// // //         }

// // //         const data = await response.json();
// // //         if (!data.data?.committee) {
// // //           throw new Error("Invalid committee data");
// // //         }
// // //         console.log("Fetched committee:", JSON.stringify(data.data.committee, null, 2));
// // //         setCommittee({
// // //           ...data.data.committee,
// // //           members: Array.isArray(data.data.committee.members) ? data.data.committee.members : [],
// // //           approvalStatus: data.data.committee.approvalStatus || 'active' // Fallback for approvalStatus
// // //         });
// // //       } catch (err) {
// // //         setError(err.message);
// // //         toast({
// // //           title: "Error",
// // //           description: err.message,
// // //           variant: "destructive",
// // //         });
// // //         navigate("/committees");
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchCommittee();
// // //   }, [id, navigate, toast]);

// // //   const statusColors = {
// // //     draft: "bg-gray-100 text-gray-800",
// // //     pending: "bg-yellow-100 text-yellow-800",
// // //     approved: "bg-green-100 text-green-800",
// // //     rejected: "bg-red-100 text-red-800",
// // //     active: "bg-blue-100 text-blue-800", // Added active status
// // //     default: "bg-gray-100 text-gray-800"
// // //   };

// // //   const formatDate = (dateString: string | null | undefined) => {
// // //     if (!dateString) return "N/A";
// // //     try {
// // //       const date = new Date(dateString);
// // //       if (isNaN(date.getTime())) return "N/A";
// // //       return format(date, 'PP');
// // //     } catch {
// // //       return "N/A";
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="container mx-auto px-4 py-6 space-y-6">
// // //         <div className="flex items-center gap-2">
// // //           <Skeleton className="h-10 w-24" />
// // //           <Skeleton className="h-10 w-24" />
// // //         </div>
// // //         <Card className="p-6 space-y-6">
// // //           <Skeleton className="h-8 w-1/2" />
// // //           <Skeleton className="h-4 w-3/4" />
// // //           <Separator />
// // //           {[...Array(3)].map((_, i) => (
// // //             <div key={i} className="space-y-4">
// // //               <Skeleton className="h-6 w-1/3" />
// // //               <Skeleton className="h-20 w-full" />
// // //             </div>
// // //           ))}
// // //         </Card>
// // //       </div>
// // //     );
// // //   }

// // //   if (error || !committee) {
// // //     return (
// // //       <div className="container mx-auto px-4 py-6 text-center">
// // //         <p className="text-red-500">{error || "Committee not found"}</p>
// // //         <Button onClick={() => navigate("/committee")} className="mt-4">
// // //           Back to Committees
// // //         </Button>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="container mx-auto px-4 py-6">
// // //       <div className="flex items-center gap-2 mb-6">
// // //         <Button 
// // //           variant="outline" 
// // //           onClick={() => navigate("/committee")}
// // //           className="flex items-center gap-2"
// // //         >
// // //           <ArrowLeft className="h-4 w-4" />
// // //           Back to Committees
// // //         </Button>
// // //         <Link to="/">
// // //           <Button variant="ghost" className="flex items-center gap-2">
// // //             <Home className="h-4 w-4" />
// // //             Home
// // //           </Button>
// // //         </Link>
// // //       </div>

// // //       <div className="space-y-6">
// // //         {/* Header Section */}
// // //         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
// // //           <div>
// // //             <h1 className="text-2xl font-bold">{committee.name || "Unnamed Committee"}</h1>
// // //             <p className="text-gray-600 mt-2">{committee.purpose || "No purpose provided"}</p>
// // //           </div>
// // //           <div className="flex flex-col items-end gap-2">
// // //             <Badge className={statusColors[committee.approvalStatus || 'default']}>
// // //               {committee.approvalStatus?.toUpperCase() || 'ACTIVE'}
// // //             </Badge>
// // //             <p className="text-sm text-gray-500">
// // //               Created by: {committee.createdBy?.name || "Unknown"}
// // //             </p>
// // //           </div>
// // //         </div>

// // //         <Card className="p-6">
// // //           <div className="space-y-6">
// // //             {/* Key Dates Section */}
// // //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // //               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// // //                 <Calendar className="h-5 w-5 text-blue-600" />
// // //                 <div>
// // //                   <p className="text-sm text-gray-500">Formation Date</p>
// // //                   <p className="font-medium">
// // //                     {formatDate(committee.formationDate)}
// // //                   </p>
// // //                 </div>
// // //               </div>

// // //               {committee.specificationSubmissionDate && (
// // //                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// // //                   <FileCheck className="h-5 w-5 text-green-600" />
// // //                   <div>
// // //                     <p className="text-sm text-gray-500">Spec Submission</p>
// // //                     <p className="font-medium">
// // //                       {formatDate(committee.specificationSubmissionDate)}
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {committee.reviewDate && (
// // //                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
// // //                   <MessageSquare className="h-5 w-5 text-purple-600" />
// // //                   <div>
// // //                     <p className="text-sm text-gray-500">Review Date</p>
// // //                     <p className="font-medium">
// // //                       {formatDate(committee.reviewDate)}
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>

// // //             <Separator />

// // //             {/* Committee Members */}
// // //             <div>
// // //               <div className="flex items-center gap-2 mb-4">
// // //                 <Users className="h-5 w-5 text-gray-600" />
// // //                 <h2 className="text-lg font-semibold">Committee Members</h2>
// // //                 <Badge variant="outline" className="ml-auto">
// // //                   {(Array.isArray(committee.members) ? committee.members.length : 0)} members
// // //                 </Badge>
// // //               </div>
// // //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //                 {(Array.isArray(committee.members) && committee.members.length > 0) ? (
// // //                   committee.members.map((member, index) => (
// // //                     <Card key={`${member.employeeId}-${index}`} className="p-4">
// // //                       <div className="flex items-start gap-4">
// // //                         <div className="bg-gray-100 p-3 rounded-full">
// // //                           <User className="h-5 w-5 text-gray-600" />
// // //                         </div>
// // //                         <div className="flex-1">
// // //                           <h3 className="font-medium">{member.name || "Unknown"}</h3>
// // //                           <p className="text-sm text-gray-600 capitalize">
// // //                             {member.role || 'Member'}
// // //                           </p>
// // //                           <div className="mt-2 space-y-1">
// // //                             <div className="flex items-center gap-2 text-sm text-gray-600">
// // //                               <Mail className="h-4 w-4" />
// // //                               <span>{member.email || "N/A"}</span>
// // //                             </div>
// // //                             <div className="flex items-center gap-2 text-sm text-gray-600">
// // //                               <Briefcase className="h-4 w-4" />
// // //                               <span>{member.department || "Unknown"}</span>
// // //                             </div>
// // //                             {member.designation && (
// // //                               <div className="flex items-center gap-2 text-sm text-gray-600">
// // //                                 <ChevronRight className="h-4 w-4" />
// // //                                 <span>{member.designation}</span>
// // //                               </div>
// // //                             )}
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                     </Card>
// // //                   ))
// // //                 ) : (
// // //                   <p className="text-sm text-gray-500">No members</p>
// // //                 )}
// // //               </div>
// // //             </div>

// // //             <Separator />

// // //             {/* Formation Letter */}
// // //             {committee.formationLetter && (
// // //               <div>
// // //                 <div className="flex items-center gap-2 mb-4">
// // //                   <File className="h-5 w-5 text-gray-600" />
// // //                   <h2 className="text-lg font-semibold">Formation Letter</h2>
// // //                 </div>
// // //                 <Card className="p-4">
// // //                   <div className="flex items-center justify-between">
// // //                     <div className="flex items-center gap-3">
// // //                       <FileText className="h-5 w-5 text-blue-600" />
// // //                       <div>
// // //                         <p className="font-medium">Formation Letter</p>
// // //                         <p className="text-sm text-gray-500">Download to view</p>
// // //                       </div>
// // //                     </div>
// // //                     <a 
// // //                       href={`${import.meta.env.VITE_API_BASE_URL}/api/committee/committees/${committee._id}/download/`}
// // //                       download
// // //                       className="text-blue-600 hover:underline flex items-center gap-2"
// // //                     >
// // //                       Download
// // //                       <ChevronRight className="h-4 w-4" />
// // //                     </a>
// // //                   </div>
// // //                 </Card>
// // //               </div>
// // //             )}

// // //             {/* Schedule */}
// // //             {committee.schedule && (
// // //               <>
// // //                 <Separator />
// // //                 <div>
// // //                   <div className="flex items-center gap-2 mb-4">
// // //                     <Clock className="h-5 w-5 text-gray-600" />
// // //                     <h2 className="text-lg font-semibold">Meeting Schedule</h2>
// // //                   </div>
// // //                   <Card className="p-4 bg-gray-50">
// // //                     <p className="whitespace-pre-line">{committee.schedule}</p>
// // //                   </Card>
// // //                 </div>
// // //               </>
// // //             )}
// // //           </div>
// // //         </Card>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default CommitteeDetail;