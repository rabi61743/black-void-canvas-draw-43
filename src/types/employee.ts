
export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  dateJoined: string;
  isActive: boolean;
  // Add alias for backward compatibility
  employeeId?: string;
}

// User interface for auth system
export interface User {
  _id: string;
  employee_id: string;
  employeeId: string; // alias for compatibility
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  designation: string;
  role: { id: number; role_name: string } | null;
  isActive: boolean;
  otpEnabled: boolean;
  permissions: any[];
}
