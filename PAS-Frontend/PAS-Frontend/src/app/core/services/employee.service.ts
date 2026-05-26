import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateEmployeeRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }

  update(id: string, request: UpdateEmployeeRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}