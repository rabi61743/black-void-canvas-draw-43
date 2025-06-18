import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Plus, Eye, Edit } from "lucide-react";
import type { ProcurementPlan, QuarterlyTarget } from "@/types/procurement-plan";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import ProcurementPlanForm from '@/components/procurement/ProcurementPlanForm';
import ProcurementPlanView from '@/components/procurement/ProcurementPlanView';

const ProcurementPlanPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProgress, setSelectedProgress] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProcurementPlan | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch procurement plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        let token = localStorage.getItem('access_token');
        if (!token) throw new Error("No access token found");

        console.log("Fetching plans from:", `${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`);
        let response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          token = await refreshToken();
          response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.log("Fetch plans error response:", errorText);
          throw new Error(`Failed to fetch procurement plans: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const normalizedData = Array.isArray(data)
          ? data.map((plan: ProcurementPlan) => ({
              ...plan,
              quarterly_targets: plan.quarterly_targets || [],
            }))
          : [];
        setPlans(normalizedData);
      } catch (error) {
        console.error('Error fetching procurement plans:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load procurement plans",
          variant: "destructive",
        });
      }
    };
    fetchPlans();
  }, [toast]);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token available');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refresh token: ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      toast({
        title: "Session Expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePlanStatus = (plan: ProcurementPlan) => {
    const targets = plan.quarterly_targets || [];
    const completedCount = targets.filter(t => t.status === 'Completed').length;
    const inProgressCount = targets.filter(t => t.status === 'In Progress').length;

    if (completedCount === targets.length) return 'Completed';
    if (inProgressCount > 0) return 'In Progress';
    return 'Planning Phase';
  };

  const calculateProgress = (plan: ProcurementPlan) => {
    const targets = plan.quarterly_targets || [];
    const completedCount = targets.filter(t => t.status === 'Completed').length;
    const progress = (completedCount / targets.length) * 100;

    if (targets.length === 0 || progress === 0) return 'Not Started';
    if (progress <= 25) return 'Early Stage';
    if (progress <= 75) return 'Mid Stage';
    if (progress < 100) return 'Final Stage';
    return 'Completed';
  };

  const isWithinDateRange = (date: string) => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const planDate = new Date(date);
    return planDate >= dateRange.from && planDate <= dateRange.to;
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.project_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || plan.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || calculatePlanStatus(plan) === selectedStatus;
    const matchesProgress = selectedProgress === 'all' || calculateProgress(plan) === selectedProgress;
    const matchesDateRange = isWithinDateRange(plan.created_at);

    return matchesSearch && matchesDepartment && matchesStatus && matchesProgress && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    console.log('Exporting to Excel...');
    // Implement export logic if needed
  };

  const getQuarterStatusDisplay = (target: { status: string; target_details: string }) => {
    const statusColors = {
      'Completed': 'text-green-600',
      'In Progress': 'text-blue-600',
      'Planned': 'text-gray-600',
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className={`text-xs font-medium ${statusColors[target.status as keyof typeof statusColors]}`}>
              {target.status}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{target.target_details}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleAddNewPlan = async (newPlan: Omit<ProcurementPlan, 'id'>) => {
    try {
      let token = localStorage.getItem('access_token');
      let response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlan),
      });

      if (response.status === 401) {
        token = await refreshToken();
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/plans/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPlan),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Create plan error response:", errorText);
        throw new Error(`Failed to create procurement plan: ${errorText}`);
      }

      const createdPlan = await response.json();
      createdPlan.quarterly_targets = createdPlan.quarterly_targets || [];
      setPlans(prev => [...prev, createdPlan]);
      toast({
        title: "Success",
        description: "New procurement plan has been added successfully.",
      });
    } catch (error) {
      console.error('Error creating procurement plan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create procurement plan",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleView = (plan: ProcurementPlan) => {
    setSelectedPlan(plan);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="dashboard-content">
      <Card className="p-6 shadow-lg">
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-0">Annual Procurement Plan - FY 2080/81</h1>
          </div>
          
          <div className="space-y-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Wireline">Wireline</SelectItem>
                  <SelectItem value="Wireless">Wireless</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning Phase">Planning Phase</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedProgress} onValueChange={setSelectedProgress}>
                <SelectTrigger>
                  <SelectValue placeholder="Progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Progress</SelectItem>
                  <SelectItem value="Not Started">Not Started (0%)</SelectItem>
                  <SelectItem value="Early Stage">Early Stage (1-25%)</SelectItem>
                  <SelectItem value="Mid Stage">Mid Stage (26-75%)</SelectItem>
                  <SelectItem value="Final Stage">Final Stage (76-99%)</SelectItem>
                  <SelectItem value="Completed">Completed (100%)</SelectItem>
                </SelectContent>
              </Select>

              <DateRangePicker 
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[120px]">Policy Number</TableHead>
                  <TableHead className="w-[120px]">Department</TableHead>
                  <TableHead className="w-[100px]">Dept. Index</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Project Description</TableHead>
                  <TableHead className="text-right">Estimated Cost</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="min-w-[100px]">Q1</TableHead>
                  <TableHead className="min-w-[100px]">Q2</TableHead>
                  <TableHead className="min-w-[100px]">Q3</TableHead>
                  <TableHead className="min-w-[100px]">Q4</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPlans.map((plan) => {
                  const deptIndex = plan.dept_index;
                  const policyNumber = plan.policy_number;
                  
                  return (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.id}</TableCell>
                      <TableCell>{policyNumber}</TableCell>
                      <TableCell>{plan.department}</TableCell>
                      <TableCell>{deptIndex}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {plan.project_name}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {plan.project_description}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(plan.estimated_cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(plan.budget)}
                      </TableCell>
                      {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                        <TableCell key={quarter} className="text-center">
                          {getQuarterStatusDisplay(
                            plan.quarterly_targets && Array.isArray(plan.quarterly_targets)
                              ? plan.quarterly_targets.find(t => t.quarter === quarter) || 
                                { status: 'Planned', target_details: 'No task planned' }
                              : { status: 'Planned', target_details: 'No task planned' }
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleView(plan)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleView(plan)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPlans.length)} of{' '}
                {filteredPlans.length} results
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3">
            <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Procurement Item
            </Button>
          </div>
        </div>
      </Card>
      <ProcurementPlanForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddNewPlan}
      />
      {selectedPlan && (
        <ProcurementPlanView
          open={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default ProcurementPlanPage;
