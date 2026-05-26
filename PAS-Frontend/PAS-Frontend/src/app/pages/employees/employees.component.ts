import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = true; error = ''; search = '';
  showModal = false; submitting = false; modalError = '';
  form = { employeeCode:'', fullName:'', department:'', position:'', email:'', phone:'' };

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.http.get<any>(`${environment.apiUrl}/employees`).subscribe({
      next: res => { this.loading = false; this.items = res?.data ?? []; this.filter(); },
      error: err => { this.loading = false; this.error = err?.userMessage || 'Failed to load employees.'; }
    });
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? [...this.items] : this.items.filter(e =>
      `${e.fullName} ${e.employeeCode} ${e.department}`.toLowerCase().includes(q)
    );
  }

  open() {
    this.form = { employeeCode:'', fullName:'', department:'', position:'', email:'', phone:'' };
    this.modalError = ''; this.showModal = true;
  }

  save() {
    if (!this.form.fullName?.trim() || !this.form.department?.trim()) {
      this.modalError = 'Full name and department are required.'; return;
    }
    this.submitting = true; this.modalError = '';
    this.http.post<any>(`${environment.apiUrl}/employees`, this.form).subscribe({
      next: res => {
        this.submitting = false;
        if (res?.succeeded !== false) { this.showModal = false; this.load(); }
        else this.modalError = res?.message || 'Failed to save.';
      },
      error: err => { this.submitting = false; this.modalError = err?.userMessage || 'Failed to save employee.'; }
    });
  }

  delete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    this.http.delete<any>(`${environment.apiUrl}/employees/${id}`).subscribe({
      next: () => this.load(),
      error: err => this.error = err?.userMessage || 'Failed to delete.'
    });
  }
}