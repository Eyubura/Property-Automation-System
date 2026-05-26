export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  position?: string;
  roles: string[];
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  department: string;
  employeeCode: string;
  phoneNumber?: string;
  roleName: string;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  position?: string;
  isActive: boolean;
}