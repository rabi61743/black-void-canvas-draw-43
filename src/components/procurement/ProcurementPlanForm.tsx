
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ProcurementPlan, QuarterlyTarget } from "@/types/procurement-plan";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProcurementPlanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (plan: Omit<ProcurementPlan, 'id'>) => void;
}

type FormQuarterlyTarget = {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  target_details: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  created_at: string;
};

const INITIAL_QUARTERLY_TARGETS: FormQuarterlyTarget[] = [
  { quarter: 'Q1', target_details: '', status: 'Planned', created_at: new Date().toISOString() },
  { quarter: 'Q2', target_details: '', status: 'Planned', created_at: new Date().toISOString() },
  { quarter: 'Q3', target_details: '', status: 'Planned', created_at: new Date().toISOString() },
  { quarter: 'Q4', target_details: '', status: 'Planned', created_at: new Date().toISOString() },
];

const ProcurementPlanForm: React.FC<ProcurementPlanFormProps> = ({ open, onClose, onSubmit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    policy_number: '',
    department: 'Wireline',
    dept_index: '',
    project_name: '',
    project_description: '',
    estimated_cost: 0,
    budget: 0,
    quarterly_targets: INITIAL_QUARTERLY_TARGETS
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('cost') || name.includes('budget') ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.policy_number || !formData.project_name || !formData.project_description || !formData.estimated_cost || !formData.budget) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const proposedBudgetPercentage = (formData.budget / formData.estimated_cost) * 100;

    const newPlan: Omit<ProcurementPlan, 'id'> = {
      policy_number: formData.policy_number,
      department: formData.department,
      dept_index: formData.policy_number.split('-').pop() || '',
      project_name: formData.project_name,
      project_description: formData.project_description,
      estimated_cost: formData.estimated_cost,
      budget: formData.budget,
      proposed_budget: formData.budget,
      proposed_budget_percentage: Math.round(proposedBudgetPercentage),
      title: formData.project_name,
      description: formData.project_description,
      estimated_value: formData.estimated_cost,
      procurement_method: {
        id: 1,
        method_name: 'Open Tender'
      },
      status: {
        id: 1,
        status_name: 'Planning'
      },
      category: 'Infrastructure',
      priority: {
        id: 1,
        priority_name: 'High'
      },
      timeline: {
        planning_start: new Date().toISOString(),
        planning_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tender_publication: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        submission_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        evaluation_period: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        contract_award: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      approvals: {
        technical_approval: false,
        financial_approval: false,
        management_approval: false,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user',
      quarterly_targets: formData.quarterly_targets.map(target => ({
        quarter: target.quarter,
        target_details: target.target_details,
        status: target.status,
        created_at: target.created_at
      })),
      committee: null
    };

    onSubmit(newPlan);
    onClose();
    setFormData({
      policy_number: '',
      department: 'Wireline',
      dept_index: '',
      project_name: '',
      project_description: '',
      estimated_cost: 0,
      budget: 0,
      quarterly_targets: INITIAL_QUARTERLY_TARGETS
    });
  };

  const handleQuarterlyTargetChange = (quarter: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      quarterly_targets: prev.quarterly_targets.map(target => 
        target.quarter === quarter ? { ...target, target_details: value } : target
      )
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full md:max-w-4xl lg:max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Procurement Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="policy_number">Policy Number*</Label>
                <Input
                  id="policy_number"
                  name="policy_number"
                  value={formData.policy_number}
                  onChange={handleChange}
                  placeholder="PP-2080-WL-N-01"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="project_name">Project Name*</Label>
                <Input
                  id="project_name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="department">Department*</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wireline">Wireline</SelectItem>
                    <SelectItem value="Wireless">Wireless</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="estimated_cost">Estimated Cost (NPR)*</Label>
                <Input
                  id="estimated_cost"
                  name="estimated_cost"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={handleChange}
                  min="0"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="budget">Proposed Budget (NPR)*</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="project_description">Project Description*</Label>
                <Textarea
                  id="project_description"
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  required
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Label className="text-lg font-semibold">Quarterly Targets</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {formData.quarterly_targets.map((target) => (
                <div key={target.quarter} className="space-y-2">
                  <Label htmlFor={`target_${target.quarter}`}>{target.quarter} Target Details</Label>
                  <Input
                    id={`target_${target.quarter}`}
                    value={target.target_details}
                    onChange={(e) => handleQuarterlyTargetChange(target.quarter, e.target.value)}
                    placeholder={`Enter ${target.quarter} target details`}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProcurementPlanForm;
