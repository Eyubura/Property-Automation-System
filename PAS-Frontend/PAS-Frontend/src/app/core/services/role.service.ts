import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateRoleRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }

  update(id: string, request: UpdateRoleRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}