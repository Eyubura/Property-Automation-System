import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Property, CreatePropertyRequest, UpdatePropertyRequest } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Property>> {
    return this.http.get<ApiResponse<Property>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreatePropertyRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }

  update(id: string, request: UpdatePropertyRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}