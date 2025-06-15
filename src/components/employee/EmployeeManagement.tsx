
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog } from "@/components/ui/dialog";
import type { Employee } from "@/types/employee";
import { useMockDb } from "@/hooks/useMockDb";
import SearchBar from "./SearchBar";
import EmployeeList from "./EmployeeList";
import EmployeeForm from "./EmployeeForm";
import EmployeeHeader from "./EmployeeHeader";
import { mockEmployees } from "@/mock/employeeData";

const EmployeeManagement = () => {
  const { toast } = useToast();
  const { data: employees, create: createEmployee } = useMockDb<Employee>('employees');
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    employee_id: "",
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    dateJoined: "",
    isActive: true
  });

  const filteredEmployees = employees.length ? employees : mockEmployees;
  const displayedEmployees = filteredEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.employeeId || emp.employee_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setNewEmployee({
      employee_id: "",
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      dateJoined: "",
      isActive: true
    });
  };

  const handleInputChange = (name: keyof Omit<Employee, 'id'>, value: string) => {
    setNewEmployee(prev => ({
      ...prev,
      [name]: value,
      // Sync employeeId and employee_id
      ...(name === 'employeeId' && { employee_id: value }),
      ...(name === 'employee_id' && { employeeId: value })
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmployee.employee_id || !newEmployee.name || !newEmployee.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createEmployee(newEmployee);
    
    toast({
      title: "Success",
      description: "Employee added successfully"
    });
    
    handleCloseModal();
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    resetForm();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      <EmployeeHeader 
        onAddClick={handleAddClick}
        onImport={createEmployee}
      />

      <div className="flex items-center gap-4 mb-6">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <EmployeeList />
      </div>

      {showAddForm && (
        <Dialog open={showAddForm} onOpenChange={handleOpenChange}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <EmployeeForm
              employee={newEmployee}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeManagement;
