export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  employeeCode: string;
  fullName: string;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
}

export interface UpdateEmployeeRequest {
  fullName: string;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}