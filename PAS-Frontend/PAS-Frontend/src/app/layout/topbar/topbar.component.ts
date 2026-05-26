import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobile  = new EventEmitter<void>();

  currentUser: any = null;
  showMenu = false;
  private sub!: Subscription;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    this.sub = this.auth.currentUser$.subscribe(u => { this.currentUser = u; });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  logout() { this.showMenu = false; this.auth.logout(); }
}