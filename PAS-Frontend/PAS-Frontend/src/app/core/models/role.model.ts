export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  description?: string;
  permissions: string[];
}