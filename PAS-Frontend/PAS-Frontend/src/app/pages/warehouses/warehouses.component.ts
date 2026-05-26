import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MockService } from '../../core/services/mock.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  showModal = false;
  submitting = false;
  form: any = { warehouseName: '', locationCode: '', description: '', capacity: 0 };
  private mock = new MockService();

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    if (environment.useMockData) {
      setTimeout(() => { this.loading = false; this.items = this.mock.warehouses; this.applyFilter(); }, 300);
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/warehouses`).subscribe({
      next: res => { this.loading = false; this.items = res.data ?? []; this.applyFilter(); },
      error: err => { this.loading = false; this.error = err.userMessage || 'Failed to load.'; }
    });
  }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = this.items.filter(i =>
      i.warehouseName?.toLowerCase().includes(q) ||
      i.locationCode?.toLowerCase().includes(q)
    );
  }

  save() {
    this.submitting = true;
    if (environment.useMockData) {
      setTimeout(() => {
        this.mock.warehouses.push({ ...this.form, id: Date.now().toString() });
        this.submitting = false; this.showModal = false; this.load();
      }, 300);
      return;
    }

    this.http.post<any>(`${environment.apiUrl}/warehouses`, this.form).subscribe({
      next: () => { this.submitting = false; this.showModal = false; this.load(); },
      error: err => { this.submitting = false; this.error = err.userMessage || 'Failed.'; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this warehouse?')) return;
    if (environment.useMockData) {
      this.mock.warehouses = this.mock.warehouses.filter(w => w.id !== id);
      this.load();
      return;
    }

    this.http.delete(`${environment.apiUrl}/warehouses/${id}`).subscribe({ next: () => this.load() });
  }
}