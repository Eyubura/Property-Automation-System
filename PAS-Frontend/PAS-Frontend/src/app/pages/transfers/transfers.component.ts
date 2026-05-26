import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = true; error = ''; search = '';

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.http.get<any>(`${environment.apiUrl}/transferrecords`).subscribe({
      next: res => {
        this.loading = false;
        this.items = res?.data?.items ?? res?.data ?? [];
        this.filter();
      },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to load transfers.'; }
    });
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? [...this.items] : this.items.filter(i =>
      `${i.itemName} ${i.fromLocation} ${i.toLocation} ${i.status}`.toLowerCase().includes(q)
    );
  }

  statusClass(s: string) {
    const m: any = { Completed: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger', InProgress: 'badge-info' };
    return m[s] || 'badge-neutral';
  }
}