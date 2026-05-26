import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="cp-wrap">
      <div class="cp-card">
        <div class="cp-head">
          <h1>Change Password</h1>
          <p>Update your account password</p>
        </div>
        <div class="err-state" *ngIf="error"><i class="pi pi-exclamation-circle"></i> {{ error }}</div>
        <div class="success-box" *ngIf="success"><i class="pi pi-check-circle"></i> {{ success }}</div>
        <form (ngSubmit)="change()" novalidate>
          <div class="form-group">
            <label>Current Password</label>
            <input [type]="showCurrent?'text':'password'" [(ngModel)]="form.currentPassword" name="cp" placeholder="Current password">
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input [type]="showNew?'text':'password'" [(ngModel)]="form.newPassword" name="np" placeholder="Min 8 chars, uppercase, number">
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input [type]="showConfirm?'text':'password'" [(ngModel)]="confirm" name="cnp" placeholder="Repeat new password">
          </div>
          <div class="cp-actions">
            <a routerLink="/dashboard" class="btn btn-outline"><i class="pi pi-arrow-left"></i> Back</a>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              <span *ngIf="loading"><i class="pi pi-spin pi-spinner"></i></span>
              {{ loading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .cp-wrap { min-height:80vh; display:flex; align-items:center; justify-content:center; }
    .cp-card { background:var(--surface); border-radius:var(--radius-xl); padding:2.5rem; width:100%; max-width:460px; box-shadow:var(--shadow-lg); border:1px solid var(--border); }
    .cp-head { margin-bottom:1.75rem; h1 { font-size:22px; font-weight:700; } p { font-size:13px; color:var(--text-secondary); margin-top:.25rem; } }
    .err-state { background:var(--danger-light); color:var(--danger); border-radius:var(--radius); padding:.75rem 1rem; font-size:13px; margin-bottom:1rem; display:flex; align-items:center; gap:.5rem; }
    .success-box { background:var(--success-light); color:var(--success); border-radius:var(--radius); padding:.75rem 1rem; font-size:13px; margin-bottom:1rem; display:flex; align-items:center; gap:.5rem; }
    .form-group { margin-bottom:1rem; label { display:block; font-size:13px; font-weight:500; color:var(--text-secondary); margin-bottom:.375rem; } input { width:100%; padding:.625rem .875rem; border:1.5px solid var(--border); border-radius:var(--radius); font-family:inherit; font-size:14px; outline:none; &:focus { border-color:var(--primary); } } }
    .cp-actions { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--border); }
  `]
})
export class ChangePasswordComponent {
  form = { currentPassword: '', newPassword: '' };
  confirm = '';
  loading = false; error = ''; success = '';
  showCurrent = false; showNew = false; showConfirm = false;

  constructor(private auth: AuthService) {}

  change() {
    if (!this.form.currentPassword || !this.form.newPassword) {
      this.error = 'Please fill all fields.'; return;
    }
    if (this.form.newPassword !== this.confirm) {
      this.error = 'New passwords do not match.'; return;
    }
    if (this.form.newPassword.length < 8) {
      this.error = 'Password must be at least 8 characters.'; return;
    }
    this.loading = true; this.error = ''; this.success = '';
    this.auth.changePassword(this.form).subscribe({
      next: res => {
        this.loading = false;
        if (res?.succeeded) { this.success = 'Password updated successfully!'; this.form = { currentPassword:'', newPassword:'' }; this.confirm = ''; }
        else this.error = res?.message || 'Failed to update password.';
      },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to update password.'; }
    });
  }
}