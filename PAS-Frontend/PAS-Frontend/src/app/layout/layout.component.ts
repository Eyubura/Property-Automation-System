import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, SidebarComponent, TopbarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  mobileOpen  = false;
  currentUser: any = null;
  private sub!: Subscription;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    this.sub = this.auth.currentUser$.subscribe(u => { this.currentUser = u; });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  toggleMobile()  { this.mobileOpen  = !this.mobileOpen;  }
  closeMobile()   { this.mobileOpen  = false;              }
}