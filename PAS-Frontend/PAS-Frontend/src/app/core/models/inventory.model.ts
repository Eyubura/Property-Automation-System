export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantity: number;
  minimumQuantity: number;
  location: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateInventoryRequest {
  itemCode: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantity: number;
  minimumQuantity: number;
  location: string;
}

export interface UpdateInventoryRequest {
  name: string;
  description?: string;
  category: string;
  unit: string;
  minimumQuantity: number;
  location: string;
  isActive: boolean;
}