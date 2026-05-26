import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { InventoryItem, CreateInventoryRequest, UpdateInventoryRequest } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = `${environment.apiUrl}/inventorystock`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<InventoryItem[]>> {
    return this.http.get<ApiResponse<InventoryItem[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<InventoryItem>> {
    return this.http.get<ApiResponse<InventoryItem>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateInventoryRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }

  update(id: string, request: UpdateInventoryRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}