import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Inspection, CreateInspectionRequest, UpdateInspectionRequest } from '../models/inspection.model';

@Injectable({ providedIn: 'root' })
export class InspectionService {
  private readonly apiUrl = `${environment.apiUrl}/inspections`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Inspection[]>> {
    return this.http.get<ApiResponse<Inspection[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Inspection>> {
    return this.http.get<ApiResponse<Inspection>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateInspectionRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }

  update(id: string, request: UpdateInspectionRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}