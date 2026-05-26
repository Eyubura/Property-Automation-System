import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fp-page">
      <div class="fp-card">
        <h2>Reset Password</h2>
        <p>Enter your email and we'll send a reset link.</p>
        <div class="success-box" *ngIf="sent"><i class="pi pi-check-circle"></i> Reset link sent! Check your email.</div>
        <div class="err-box" *ngIf="error"><i class="pi pi-exclamation-circle"></i> {{ error }}</div>
        <div class="form-group" *ngIf="!sent">
          <label>Email Address</label>
          <input type="email" [(ngModel)]="email" name="em" placeholder="your@email.com">
        </div>
        <button class="btn btn-primary" style="width:100%;margin-bottom:1rem" *ngIf="!sent" (click)="submit()" [disabled]="loading">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
        <a routerLink="/auth/login" class="back-lnk"><i class="pi pi-arrow-left"></i> Back to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .fp-page { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; padding:1rem; }
    .fp-card { background:var(--surface); border-radius:var(--radius-xl); padding:2.5rem; width:100%; max-width:400px; box-shadow:var(--shadow-xl); border:1px solid var(--border);
      h2 { font-size:22px; font-weight:700; margin-bottom:.5rem; } p { font-size:13px; color:var(--text-secondary); margin-bottom:1.5rem; } }
    .success-box { background:var(--success-light); color:var(--success); border-radius:var(--radius); padding:.75rem 1rem; font-size:13px; margin-bottom:1rem; display:flex; align-items:center; gap:.5rem; }
    .err-box { background:var(--danger-light); color:var(--danger); border-radius:var(--radius); padding:.75rem 1rem; font-size:13px; margin-bottom:1rem; display:flex; align-items:center; gap:.5rem; }
    .form-group { margin-bottom:1.25rem; label { display:block; font-size:13px; font-weight:500; color:var(--text-secondary); margin-bottom:.375rem; } input { width:100%; padding:.625rem .875rem; border:1.5px solid var(--border); border-radius:var(--radius); font-family:inherit; font-size:14px; outline:none; &:focus { border-color:var(--primary); } } }
    .back-lnk { display:inline-flex; align-items:center; gap:.5rem; font-size:13px; color:var(--primary); text-decoration:none; font-weight:500; &:hover { text-decoration:underline; } }
  `]
})
export class ForgotPasswordComponent {
  email = ''; loading = false; sent = false; error = '';
  constructor(private http: HttpClient) {}
  submit() {
    if (!this.email) { this.error = 'Enter your email.'; return; }
    this.loading = true; this.error = '';
    this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email: this.email }).subscribe({
      next: () => { this.loading = false; this.sent = true; },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed.'; }
    });
  }
}