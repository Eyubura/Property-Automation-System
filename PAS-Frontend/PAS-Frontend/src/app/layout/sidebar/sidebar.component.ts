import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() open = true;
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  currentUser: any = null;
  logoError = false;
  visibleSections: any[] = [];
  private sub!: Subscription;

  navSections = [
  { title: 'Main',       items: [
    { label:'Dashboard',    icon:'pi pi-home',        route:'/dashboard',     roles:[] }
  ]},
  { title: 'Assets',     items: [
    { label:'Properties',   icon:'pi pi-building',    route:'/properties',    roles:[] },
    { label:'Inventory',    icon:'pi pi-box',          route:'/inventory',     roles:[] },
    { label:'Warehouses',   icon:'pi pi-warehouse',    route:'/warehouses',    roles:[] },
    { label:'Item Masters', icon:'pi pi-list',         route:'/items',         roles:[] },
  ]},
  { title: 'Operations', items: [
    { label:'Employees',    icon:'pi pi-users',        route:'/employees',     roles:[] },
    { label:'Inspections',  icon:'pi pi-search',       route:'/inspections',   roles:[] },
    { label:'Suppliers',    icon:'pi pi-truck',        route:'/suppliers',     roles:[] },
    { label:'Receiving',    icon:'pi pi-inbox',        route:'/receiving',     roles:[] },
    { label:'Transfers',    icon:'pi pi-arrows-h',     route:'/transfers',     roles:[] },
    { label:'Disposals',    icon:'pi pi-trash',        route:'/disposals',     roles:[] },
  ]},
  { title: 'Requests',   items: [
    { label:'Requisitions', icon:'pi pi-file',         route:'/requisitions',  roles:[] },
    { label:'Vouchers',     icon:'pi pi-file-export',  route:'/vouchers',      roles:[] },
  ]},
  { title: 'System',     items: [
    { label:'Notifications',icon:'pi pi-bell',         route:'/notifications', roles:[] },
    { label:'Change Password',icon:'pi pi-key',        route:'/change-password',roles:[] },
    { label:'Users',        icon:'pi pi-user-edit',    route:'/users',         roles:['Admin'] },
    { label:'Roles',        icon:'pi pi-shield',       route:'/roles',         roles:['Admin'] },
  ]}
];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.syncVisibleSections();
    this.sub = this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.syncVisibleSections();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  syncVisibleSections() {
    this.visibleSections = this.navSections.map(s => ({
      ...s,
      items: s.items.filter(i => !i.roles.length || i.roles.some(r => this.authService.hasRole(r)))
    })).filter(s => s.items.length > 0);
  }

  onImgError() { this.logoError = true; }
  nav(item: any) { if (this.mobileOpen) this.closeMobile.emit(); }
}