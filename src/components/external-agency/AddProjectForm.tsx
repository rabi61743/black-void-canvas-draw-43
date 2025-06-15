// // frontend/src/components/AddProjectForm.tsx
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// export interface ProcurementPlan {
//   id: number;
//   project_name: string;
//   policy_number: string;
//   project_description: string;
// }
// import { Input } from "@/components/ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { CalendarIcon, FileText, X } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { format } from "date-fns";
// import * as z from "zod";
// import { useToast } from "@/hooks/use-toast";
// import { useEffect, useState } from "react";
// import { useAuth } from "@/contexts/AuthContext";

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// const ACCEPTED_FILE_TYPES = [
//   "application/pdf",
//   "image/jpeg",
//   "image/png",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// ];

// const formSchema = z.object({
//   projectName: z.string().min(1, "Project name is required").max(100),
//   oneLineDescription: z.string().min(1, "Description is required").max(200),
//   program: z.string().min(1, "Program is required"),
//   startDate: z.date({
//     required_error: "Start date is required",
//   }),
//   deadlineDate: z.date({
//     required_error: "Deadline date is required",
//   }),
//   identification_no: z.string().min(1, "Identification number is required"),
//   selected_contractor: z.string().min(1, "Contractor is required"),
//   description: z.string().min(1, "Description is required").max(500),
//   remarks: z.string().max(400, "Remarks cannot exceed 400 characters"),
//   attachments: z
//     .array(
//       z.object({
//         file: z
//           .instanceof(File)
//           .refine((file) => file.size <= MAX_FILE_SIZE, "File size should be less than 5MB")
//           .refine(
//             (file) => ACCEPTED_FILE_TYPES.includes(file.type),
//             "Only PDF, JPEG, PNG, and DOC files are accepted"
//           ),
//         name: z.string(),
//       })
//     )
//     .optional()
//     .default([]),
//   procurement_plan: z.number({ required_error: "Procurement plan is required" }),
// });

// interface AddProjectFormProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
// }

// export function AddProjectForm({ open, onOpenChange, onSubmit }: AddProjectFormProps) {
//   const { toast } = useToast();
//   const { token } = useAuth();
//   const [procurementPlans, setProcurementPlans] = useState<ProcurementPlan[]>([]);
//   const [isLoadingPlans, setIsLoadingPlans] = useState(false);
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       projectName: "",
//       oneLineDescription: "",
//       program: "",
//       identification_no: "",
//       selected_contractor: "",
//       description: "",
//       remarks: "",
//       attachments: [],
//       procurement_plan: undefined,
//     },
//   });

//   useEffect(() => {
//     if (open && token) {
//       setIsLoadingPlans(true);
//       fetch("${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       })
//         .then((response) => {
//           if (!response.ok) throw new Error("Failed to fetch procurement plans");
//           return response.json();
//         })
//         .then((data) => {
//           const plans = Array.isArray(data) ? data : [];
//           setProcurementPlans(plans);
//           console.log("Fetched procurement plans:", plans);
//         })
//         .catch((error) => {
//           setProcurementPlans([]);
//           toast({
//             title: "Error",
//             description: "Failed to load procurement plans.",
//             variant: "destructive",
//           });
//           console.error("Error fetching procurement plans:", error);
//         })
//         .finally(() => {
//           setIsLoadingPlans(false);
//         });
//     }
//   }, [open, token, toast]);

//   const handleProcurementPlanChange = (planId: number | null) => {
//     const plan = procurementPlans.find((p) => p.id === planId) || null;
//     if (plan) {
//       form.setValue("projectName", plan.project_name);
//       form.setValue("description", plan.project_description || "");
//     } else {
//       form.setValue("projectName", "");
//       form.setValue("description", "");
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     const currentAttachments = form.getValues("attachments") || [];

//     try {
//       const newAttachments = files.map((file) => ({
//         file,
//         name: file.name,
//       }));

//       form.setValue("attachments", [...currentAttachments, ...newAttachments]);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add file. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const removeFile = (index: number) => {
//     const currentAttachments = form.getValues("attachments") || [];
//     const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
//     form.setValue("attachments", updatedAttachments);
//   };

//   async function handleSubmit(values: z.infer<typeof formSchema>) {
//     console.log("Form submission values:", values);
//     try {
//       await onSubmit(values);
//       form.reset();
//       onOpenChange(false);
//       toast({
//         title: "Success",
//         description: "Project created successfully.",
//       });
//     } catch (error) {
//       if (error instanceof Response && error.status === 400) {
//         const errorData = await error.json();
//         toast({
//           title: "Error",
//           description: errorData.error || "Failed to create project. A project already exists for this procurement plan.",
//           variant: "destructive",
//         });
//       } else {
//         toast({
//           title: "Error",
//           description: "Failed to create project. Please check server logs for details.",
//           variant: "destructive",
//         });
//       }
//       console.error("Error submitting form:", error);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl">ExternalAgency</DialogTitle>
//           <DialogDescription>ExternalAgency</DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
//             <div className="space-y-6">
//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Project description</h2>
//                 <FormField
//                   control={form.control}
//                   name="procurement_plan"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Procurement Plan</FormLabel>
//                       <FormControl>
//                         <select
//                           {...field}
//                           onChange={(e) => {
//                             const planId = e.target.value ? parseInt(e.target.value) : null;
//                             field.onChange(planId);
//                             handleProcurementPlanChange(planId);
//                           }}
//                           value={field.value ?? ""}
//                           className="w-full p-2 border rounded"
//                           disabled={isLoadingPlans}
//                         >
//                           <option value="" disabled>Select a Procurement Plan</option>
//                           {isLoadingPlans ? (
//                             <option value="">Loading...</option>
//                           ) : Array.isArray(procurementPlans) && procurementPlans.length > 0 ? (
//                             procurementPlans.map((plan) => (
//                               <option key={plan.id} value={plan.id}>
//                                 {plan.project_name} ({plan.policy_number})
//                               </option>
//                             ))
//                           ) : (
//                             <option value="" disabled>No Procurement Plans Available</option>
//                           )}
//                         </select>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="projectName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Project Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Type here" {...field} disabled={form.watch("procurement_plan") !== null} />
//                       </FormControl>
//                       <FormMessage />
//                       <p className="text-xs text-gray-500">Text Limit 100 characters only</p>
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="oneLineDescription"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>One line description about Project</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Type here" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                       <p className="text-xs text-gray-500">Text Limit 200 character only</p>
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Important Information</h2>
//                 <FormField
//                   control={form.control}
//                   name="program"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Program</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Type here" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <div className="grid grid-cols-2 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="startDate"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-col">
//                         <FormLabel>Started Date</FormLabel>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <FormControl>
//                               <Button
//                                 variant={"outline"}
//                                 className={cn(
//                                   "pl-3 text-left font-normal",
//                                   !field.value && "text-muted-foreground"
//                                 )}
//                               >
//                                 {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                                 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                               </Button>
//                             </FormControl>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={field.value}
//                               onSelect={field.onChange}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="deadlineDate"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-col">
//                         <FormLabel>Deadline Date</FormLabel>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <FormControl>
//                               <Button
//                                 variant={"outline"}
//                                 className={cn(
//                                   "pl-3 text-left font-normal",
//                                   !field.value && "text-muted-foreground"
//                                 )}
//                               >
//                                 {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                                 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                               </Button>
//                             </FormControl>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={field.value}
//                               onSelect={field.onChange}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="identification_no"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Identification No</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Type here" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="selected_contractor"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Selected Contractor</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Type here" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Description</h2>
//                 <FormField
//                   control={form.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea placeholder="Type here" className="min-h-[150px]" {...field} disabled={form.watch("procurement_plan") !== null} />
//                       </FormControl>
//                       <FormMessage />
//                       <p className="text-xs text-gray-500">Word Limit 500 character</p>
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div>
//                 <h2 className="text-xl font-semibold mb-4">Upload Required Document</h2>
//                 <div className="space-y-4">
//                   <input
//                     type="file"
//                     id="file-upload"
//                     className="hidden"
//                     multiple
//                     onChange={handleFileChange}
//                     accept={ACCEPTED_FILE_TYPES.join(",")}
//                   />
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="gap-2"
//                     onClick={() => document.getElementById("file-upload")?.click()}
//                   >
//                     <FileText className="h-4 w-4" />
//                     Attach files
//                   </Button>

//                   <div className="space-y-2">
//                     {form.watch("attachments")?.map((file, index) => (
//                       <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
//                         <div className="flex items-center gap-2">
//                           <FileText className="h-4 w-4 text-gray-500" />
//                           <span className="text-sm text-gray-700">{file.name}</span>
//                         </div>
//                         <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
//                           <X className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Remarks</h2>
//                 <FormField
//                   control={form.control}
//                   name="remarks"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Remarks</FormLabel>
//                       <FormControl>
//                         <Textarea placeholder="Type here" className="min-h-[150px]" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                       <p className="text-xs text-gray-500">Word Limit 400 character</p>
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   form.reset();
//                   onOpenChange(false);
//                 }}
//               >
//                 Reset
//               </Button>
//               <Button type="submit">Submit</Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, FileText, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ProcurementPlan {
  id: number;
  project_name: string;
  policy_number: string;
  project_description: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const formSchema = z.object({
  projectName: z.string().min(1, "Project name is required").max(100),
  oneLineDescription: z.string().min(1, "Description is required").max(200),
  program: z.string().min(1, "Program is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  deadlineDate: z.date({
    required_error: "Deadline date is required",
  }),
  identification_no: z.string().min(1, "Identification number is required"),
  selected_contractor: z.string().min(1, "Contractor is required"),
  description: z.string().min(1, "Description is required").max(500),
  remarks: z.string().max(400, "Remarks cannot exceed 400 characters"),
  attachments: z
    .array(
      z.object({
        file: z
          .instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE, "File size should be less than 5MB")
          .refine(
            (file) => ACCEPTED_FILE_TYPES.includes(file.type),
            "Only PDF, JPEG, PNG, and DOC files are accepted"
          ),
        name: z.string(),
      })
    )
    .optional()
    .default([]),
  procurement_plan: z.number({ required_error: "Procurement plan is required" }),
});

interface AddProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}

export function AddProjectForm({ open, onOpenChange, onSubmit }: AddProjectFormProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [procurementPlans, setProcurementPlans] = useState<ProcurementPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      oneLineDescription: "",
      program: "",
      identification_no: "",
      selected_contractor: "",
      description: "",
      remarks: "",
      attachments: [],
      procurement_plan: undefined,
    },
  });

  useEffect(() => {
    if (open && token) {
      setIsLoadingPlans(true);
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(`Failed to fetch procurement plans: ${response.status} - ${text}`);
            });
          }
          return response.json();
        })
        .then((data) => {
          const plans = Array.isArray(data) ? data : [];
          setProcurementPlans(plans);
          console.log("Fetched procurement plans:", plans);
        })
        .catch((error) => {
          setProcurementPlans([]);
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to load procurement plans.",
            variant: "destructive",
          });
          console.error("Error fetching procurement plans:", error);
        })
        .finally(() => {
          setIsLoadingPlans(false);
        });
    }
  }, [open, token, toast]);

  const handleProcurementPlanChange = (planId: number | null) => {
    const plan = procurementPlans.find((p) => p.id === planId) || null;
    if (plan) {
      form.setValue("projectName", plan.project_name);
      form.setValue("description", plan.project_description || "");
    } else {
      form.setValue("projectName", "");
      form.setValue("description", "");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentAttachments = form.getValues("attachments") || [];

    try {
      const newAttachments = files.map((file) => ({
        file,
        name: file.name,
      }));

      form.setValue("attachments", [...currentAttachments, ...newAttachments]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    const currentAttachments = form.getValues("attachments") || [];
    const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
    form.setValue("attachments", updatedAttachments);
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submission values:", values);
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Project created successfully.",
      });
    } catch (error) {
      if (error instanceof Response && error.status === 400) {
        const errorData = await error.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create project. A project already exists for this procurement plan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create project. Please check server logs for details.",
          variant: "destructive",
        });
      }
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">ExternalAgency</DialogTitle>
          <DialogDescription>ExternalAgency</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Project description</h2>
                <FormField
                  control={form.control}
                  name="procurement_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procurement Plan</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          onChange={(e) => {
                            const planId = e.target.value ? parseInt(e.target.value) : null;
                            field.onChange(planId);
                            handleProcurementPlanChange(planId);
                          }}
                          value={field.value ?? ""}
                          className="w-full p-2 border rounded"
                          disabled={isLoadingPlans}
                        >
                          <option value="" disabled>Select a Procurement Plan</option>
                          {isLoadingPlans ? (
                            <option value="">Loading...</option>
                          ) : Array.isArray(procurementPlans) && procurementPlans.length > 0 ? (
                            procurementPlans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.project_name} ({plan.policy_number})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No Procurement Plans Available</option>
                          )}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Type here" {...field} disabled={form.watch("procurement_plan") !== null} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Text Limit 100 characters only</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oneLineDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One line description about Project</FormLabel>
                      <FormControl>
                        <Input placeholder="Type here" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Text Limit 200 character only</p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Important Information</h2>
                <FormField
                  control={form.control}
                  name="program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program</FormLabel>
                      <FormControl>
                        <Input placeholder="Type here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Started Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadlineDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Deadline Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="identification_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identification No</FormLabel>
                      <FormControl>
                        <Input placeholder="Type here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selected_contractor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selected Contractor</FormLabel>
                      <FormControl>
                        <Input placeholder="Type here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Description</h2>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type here" className="min-h-[150px]" {...field} disabled={form.watch("procurement_plan") !== null} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Word Limit 500 character</p>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Required Document</h2>
                <div className="space-y-4">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept={ACCEPTED_FILE_TYPES.join(",")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <FileText className="h-4 w-4" />
                    Attach files
                  </Button>

                  <div className="space-y-2">
                    {form.watch("attachments")?.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Remarks</h2>
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type here" className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Word Limit 400 character</p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Reset
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}