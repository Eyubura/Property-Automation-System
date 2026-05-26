export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}