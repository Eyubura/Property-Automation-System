export interface Inspection {
  id: string;
  inspectionCode: string;
  propertyId: string;
  propertyName: string;
  inspectorId: string;
  inspectorName: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
  findings?: string;
  recommendation?: string;
  createdAt: string;
}

export interface CreateInspectionRequest {
  propertyId: string;
  inspectorId: string;
  scheduledDate: string;
  notes?: string;
}

export interface UpdateInspectionRequest {
  status: string;
  findings?: string;
  recommendation?: string;
  completedDate?: string;
}