import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  email = '';
  password = '';
  loading = false;

  async onLogin() {
    if (!this.email || !this.password) {
      this.toastService.warning('Please fill in all fields');
      return;
    }

    this.loading = true;

    try {
      await this.authService.login(this.email, this.password);
      this.toastService.success('Welcome back!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Login failed');
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    this.loading = true;

    try {
      await this.authService.loginWithGoogle();
      this.toastService.success('Welcome back!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Google login failed');
      this.loading = false;
    }
  }
}