import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private T  = 'pas_token';
  private RT = 'pas_refresh';
  private U  = 'pas_user';

  setToken(v: string)         { localStorage.setItem(this.T,  v); }
  getToken(): string | null   { return localStorage.getItem(this.T); }
  setRefreshToken(v: string)  { localStorage.setItem(this.RT, v); }
  getRefreshToken(): string | null { return localStorage.getItem(this.RT); }
  setUser(u: any)             { localStorage.setItem(this.U,  JSON.stringify(u)); }
  getUser(): any              { const v = localStorage.getItem(this.U); return v ? JSON.parse(v) : null; }
  clear()                     { [this.T, this.RT, this.U].forEach(k => localStorage.removeItem(k)); }
  isLoggedIn(): boolean       { return !!this.getToken(); }
}