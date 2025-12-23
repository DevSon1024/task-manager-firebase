import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;

  async onRegister() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.email, this.password);
    } catch (error: any) {
      this.errorMessage = error.message;
      this.loading = false;
    }
  }

  async onGoogleRegister() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      this.errorMessage = error.message;
      this.loading = false;
    }
  }
}