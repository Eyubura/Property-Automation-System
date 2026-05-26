import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vouchers.component.html',
  styleUrl: './vouchers.component.scss'
})
export class VouchersComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = true; error = ''; search = '';

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.http.get<any>(`${environment.apiUrl}/storeissuevouchers`).subscribe({
      next: res => {
        this.loading = false;
        this.items = res?.data?.items ?? res?.data ?? [];
        this.filter();
      },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to load vouchers.'; }
    });
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? [...this.items] : this.items.filter(i =>
      `${i.sivNumber} ${i.issuedToName} ${i.status}`.toLowerCase().includes(q)
    );
  }

  statusClass(s: string) {
    const m: any = { Issued: 'badge-success', Pending: 'badge-warning', Cancelled: 'badge-danger' };
    return m[s] || 'badge-neutral';
  }
}