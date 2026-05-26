import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = `${environment.apiUrl}/auth`;
  private sub = new BehaviorSubject<any>(null);
  currentUser$ = this.sub.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) {
    const u = this.storage.getUser();
    if (u) this.sub.next(u);
  }

  login(body: any): Observable<any> {
    return this.http.post<any>(`${this.url}/login`, body).pipe(
      tap(r => {
        if (r?.succeeded && r?.data) {
          this.storage.setToken(r.data.token);
          this.storage.setRefreshToken(r.data.refreshToken);
          this.storage.setUser(r.data.user);
          this.sub.next(r.data.user);
        }
      })
    );
  }

  logout(): void {
    this.http.post(`${this.url}/logout`, {}).subscribe({ error: () => {} });
    this.storage.clear();
    this.sub.next(null);
    this.router.navigate(['/auth/login']);
  }

  changePassword(body: any): Observable<any> {
    return this.http.post<any>(`${this.url}/change-password`, body);
  }

  getCurrentUser(): any { return this.sub.value; }
  isLoggedIn(): boolean { return this.storage.isLoggedIn(); }
  hasRole(r: string): boolean { return this.sub.value?.roles?.includes(r) ?? false; }
  clearSession(): void { this.storage.clear(); this.sub.next(null); this.router.navigate(['/auth/login']); }
}