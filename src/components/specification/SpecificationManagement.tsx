
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import SpecificationSubmission from "./SpecificationSubmission";
import ReviewScheduler from "./ReviewScheduler";
import CommitteeFormation from "./CommitteeFormation";
import ReviewTracker from "./ReviewTracker";
import TaskManager from "./TaskManager";
import type { SpecificationDocument, ReviewSession, ReviewTracking } from "@/types/specification";

const SpecificationManagement = () => {
  const { toast } = useToast();
  const [specification, setSpecification] = useState<SpecificationDocument | null>(null);
  const [review, setReview] = useState<ReviewSession | null>(null);
  const [activeTab, setActiveTab] = useState("submission");

  const handleSpecificationUpdate = (spec: SpecificationDocument) => {
    setSpecification(spec);
    setActiveTab("committee");
    toast({
      title: "Specification Updated",
      description: "Moving to committee formation.",
    });
  };

  const handleReviewUpdate = (reviewSession: ReviewSession) => {
    setReview(reviewSession);
    
    if (specification) {
      const newTracking: ReviewTracking = {
        id: Date.now(),
        documentVersion: specification.version,
        reviewDate: reviewSession.scheduledDate,
        status: "pending",
        comments: [],
        nextReviewDate: reviewSession.nextReviewDate || "",
        notifiedMembers: reviewSession.reviewers.map(reviewer => ({
          memberId: reviewer.id,
          notified: true,
          notificationMethod: 'both' as const,
        })),
      };

      const updatedSpec = {
        ...specification,
        reviewTracking: [...(specification.reviewTracking || []), newTracking],
      };
      setSpecification(updatedSpec);
    }

    setActiveTab("tracking");
    toast({
      title: "Review Scheduled",
      description: "Review has been scheduled and team notified.",
    });
  };

  const getTabStatus = (tab: string) => {
    switch (tab) {
      case "submission":
        return specification ? "completed" : "pending";
      case "committee":
        return specification?.committeeFormationLetter ? "completed" : specification ? "pending" : "disabled";
      case "review":
        return review ? "completed" : specification ? "pending" : "disabled";
      case "tracking":
        return review ? "active" : "disabled";
      case "tasks":
        return specification ? "active" : "disabled";
      default:
        return "disabled";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Specification Management</h1>
        <p className="text-gray-600 mt-2">
          Manage the complete specification lifecycle from submission to approval
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="submission" className="flex items-center gap-2">
            Submission
            <Badge variant={getTabStatus("submission") === "completed" ? "default" : "outline"} className="ml-1">
              {getTabStatus("submission") === "completed" ? "✓" : "1"}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="committee" 
            disabled={getTabStatus("committee") === "disabled"}
            className="flex items-center gap-2"
          >
            Committee
            <Badge variant={getTabStatus("committee") === "completed" ? "default" : "outline"} className="ml-1">
              {getTabStatus("committee") === "completed" ? "✓" : "2"}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="review" 
            disabled={getTabStatus("review") === "disabled"}
            className="flex items-center gap-2"
          >
            Review
            <Badge variant={getTabStatus("review") === "completed" ? "default" : "outline"} className="ml-1">
              {getTabStatus("review") === "completed" ? "✓" : "3"}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="tracking" 
            disabled={getTabStatus("tracking") === "disabled"}
            className="flex items-center gap-2"
          >
            Tracking
            <Badge variant={getTabStatus("tracking") === "active" ? "default" : "outline"} className="ml-1">
              4
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            disabled={getTabStatus("tasks") === "disabled"}
            className="flex items-center gap-2"
          >
            Tasks
            <Badge variant={getTabStatus("tasks") === "active" ? "default" : "outline"} className="ml-1">
              5
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submission" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Specification Document</CardTitle>
            </CardHeader>
            <CardContent>
              <SpecificationSubmission
                specification={specification}
                onSpecificationUpdate={handleSpecificationUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="committee" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Committee Formation</CardTitle>
            </CardHeader>
            <CardContent>
              <CommitteeFormation
                specification={specification}
                onSpecificationUpdate={setSpecification}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewScheduler
                specification={specification}
                review={review}
                onReviewUpdate={handleReviewUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewTracker
                specification={specification}
                review={review}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskManager
                specification={specification}
                onSpecificationUpdate={setSpecification}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpecificationManagement;
