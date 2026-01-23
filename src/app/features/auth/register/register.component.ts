import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  email = '';
  password = '';
  confirmPassword = '';
  loading = false;

  async onRegister() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.toastService.warning('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      this.toastService.warning('Password must be at least 6 characters');
      return;
    }

    this.loading = true;

    try {
      await this.authService.register(this.email, this.password);
      this.toastService.success('Account created successfully!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Registration failed');
      this.loading = false;
    }
  }

  async onGoogleRegister() {
    this.loading = true;

    try {
      await this.authService.loginWithGoogle();
      this.toastService.success('Account created successfully!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Google registration failed');
      this.loading = false;
    }
  }
}