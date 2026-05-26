import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-receiving',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receiving.component.html',
  styleUrl: './receiving.component.scss'
})
export class ReceivingComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = true; error = ''; search = '';

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.http.get<any>(`${environment.apiUrl}/receivingnotes`).subscribe({
      next: res => {
        this.loading = false;
        this.items = res?.data?.items ?? res?.data ?? [];
        this.filter();
      },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to load receiving notes.'; }
    });
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? [...this.items] : this.items.filter(i =>
      `${i.grnNumber} ${i.status} ${i.supplierName}`.toLowerCase().includes(q)
    );
  }

  statusClass(s: string) {
    const m: any = { Approved: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger', Draft: 'badge-neutral' };
    return m[s] || 'badge-neutral';
  }
}