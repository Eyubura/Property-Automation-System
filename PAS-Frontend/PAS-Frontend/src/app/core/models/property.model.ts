export interface Property {
  id: string;
  propertyCode: string;
  name: string;
  description?: string;
  category: string;
  condition: string;
  location: string;
  assignedTo?: string;
  isActive: boolean;
  acquisitionDate: string;
  createdAt: string;
}

export interface CreatePropertyRequest {
  propertyCode: string;
  name: string;
  description?: string;
  category: string;
  condition: string;
  location: string;
}

export interface UpdatePropertyRequest {
  name: string;
  description?: string;
  category: string;
  condition: string;
  location: string;
  isActive: boolean;
}