import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-disposals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disposals.component.html',
  styleUrl: './disposals.component.scss'
})
export class DisposalsComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = true; error = ''; search = '';

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.http.get<any>(`${environment.apiUrl}/disposalrecords`).subscribe({
      next: res => {
        this.loading = false;
        this.items = res?.data?.items ?? res?.data ?? [];
        this.filter();
      },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to load disposals.'; }
    });
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? [...this.items] : this.items.filter(i =>
      `${i.itemName} ${i.disposalMethod} ${i.status}`.toLowerCase().includes(q)
    );
  }

  statusClass(s: string) {
    const m: any = { Approved: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger' };
    return m[s] || 'badge-neutral';
  }
}