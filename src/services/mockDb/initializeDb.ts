
import type { Employee } from '@/types/employee';
import { MockDatabase } from './MockDatabase';
import { mockEmployees } from '@/mock/employeeData';

export const initializeDb = (): MockDatabase => {
  const db = new MockDatabase();
  
  // Initialize with mock data
  mockEmployees.forEach(employee => {
    db.create<Employee>('employees', employee);
  });
  
  return db;
};
