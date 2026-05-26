import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  error = '';
  greeting = '';
  today = new Date();
  firstName = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const u = this.auth.getCurrentUser();
    this.firstName = u?.fullName?.split(' ')?.[0] ?? 'User';
    this.load();
  }

  load() {
    this.loading = true; this.error = '';
    this.http.get<any>(`${environment.apiUrl}/dashboard/statistics`).subscribe({
      next: res => { this.loading = false; if (res?.succeeded) this.stats = res.data; else this.error = res?.message || 'Failed.'; },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to load dashboard.'; }
    });
  }
}