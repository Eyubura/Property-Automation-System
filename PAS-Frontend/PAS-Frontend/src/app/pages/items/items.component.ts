import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = true; error = ''; search = '';
  showModal = false; submitting = false; modalError = '';
  form: any = { sku: '', itemName: '', unitOfMeasure: '', categoryName: '', minimumStockLevel: 0, reorderLevel: 0, description: '', requiresInspection: false };

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.http.get<any>(`${environment.apiUrl}/itemmasters`).subscribe({
      next: res => {
        this.loading = false;
        this.items = res?.data?.items ?? res?.data ?? [];
        this.filter();
      },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to load items.'; }
    });
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? [...this.items] : this.items.filter(i =>
      `${i.itemName} ${i.sku} ${i.categoryName}`.toLowerCase().includes(q)
    );
  }

  open() {
    this.form = { sku:'', itemName:'', unitOfMeasure:'', categoryName:'', minimumStockLevel:0, reorderLevel:0, description:'', requiresInspection:false };
    this.modalError = ''; this.showModal = true;
  }

  save() {
    if (!this.form.itemName?.trim()) { this.modalError = 'Item name is required.'; return; }
    this.submitting = true; this.modalError = '';
    this.http.post<any>(`${environment.apiUrl}/itemmasters`, this.form).subscribe({
      next: res => {
        this.submitting = false;
        if (res?.succeeded !== false) { this.showModal = false; this.load(); }
        else this.modalError = res?.message || 'Failed to save.';
      },
      error: err => { this.submitting = false; this.modalError = err?.userMessage || 'Failed to save item.'; }
    });
  }

  delete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    this.http.delete<any>(`${environment.apiUrl}/itemmasters/${id}`).subscribe({
      next: () => this.load(),
      error: err => this.error = err?.userMessage || 'Failed to delete.'
    });
  }
}