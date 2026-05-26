import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notification, MarkReadRequest } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(this.apiUrl);
  }

  getUnread(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/unread`);
  }

  markAsRead(request: MarkReadRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/mark-read`, request);
  }

  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/mark-all-read`, {});
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}