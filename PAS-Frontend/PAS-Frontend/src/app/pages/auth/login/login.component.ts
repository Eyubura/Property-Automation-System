import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username = ''; password = ''; rememberMe = false;
  loading = false; error = ''; showPass = false;
  year = new Date().getFullYear();

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {}

  login() {
    if (!this.username.trim() || !this.password) {
      this.error = 'Please enter your username and password.'; return;
    }
    this.loading = true; this.error = '';
    this.auth.login({ username: this.username.trim(), password: this.password, rememberMe: this.rememberMe })
      .subscribe({
        next: res => {
          this.loading = false;
          if (res?.succeeded) this.router.navigate(['/dashboard'], { replaceUrl: true });
          else this.error = res?.message || 'Login failed. Check your credentials.';
        },
        error: err => { this.loading = false; this.error = err?.userMessage || 'Login failed.'; }
      });
  }
}