import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login',           loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',     loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'employees',     loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent) },
      { path: 'properties',    loadComponent: () => import('./pages/properties/properties.component').then(m => m.PropertiesComponent) },
      { path: 'receiving',     loadComponent: () => import('./pages/receiving/receiving.component').then(m => m.ReceivingComponent) },
      { path: 'warehouses',    loadComponent: () => import('./pages/warehouses/warehouses.component').then(m => m.WarehousesComponent) },
      { path: 'transfers',     loadComponent: () => import('./pages/transfers/transfers.component').then(m => m.TransfersComponent) },
      { path: 'disposals',     loadComponent: () => import('./pages/disposals/disposals.component').then(m => m.DisposalsComponent) },
      { path: 'requisitions',  loadComponent: () => import('./pages/requisitions/requisitions.component').then(m => m.RequisitionsComponent) },
      { path: 'vouchers',      loadComponent: () => import('./pages/vouchers/vouchers.component').then(m => m.VouchersComponent) },
      { path: 'items',         loadComponent: () => import('./pages/items/items.component').then(m => m.ItemsComponent) },
      { path: 'inventory',     loadComponent: () => import('./pages/inventory/inventory.component').then(m => m.InventoryComponent) },
      { path: 'inspections',   loadComponent: () => import('./pages/inspections/inspections.component').then(m => m.InspectionsComponent) },
      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'suppliers',     loadComponent: () => import('./pages/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
      { path: 'change-password', loadComponent: () => import('./pages/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
      { path: 'users', loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent), canActivate: [roleGuard], data: { roles: ['Admin'] } },
      { path: 'roles', loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent), canActivate: [roleGuard], data: { roles: ['Admin'] } },
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];