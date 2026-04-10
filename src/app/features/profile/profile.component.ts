import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService, UserProfile } from '../../core/services/user-profile.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private userProfileService = inject(UserProfileService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  userProfile: UserProfile | null = null;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  editForm: Partial<UserProfile> = {};

  // ----- Provider helpers -----
  providers: string[] = [];

  get isEmailPasswordUser(): boolean {
    return this.providers.includes('password');
  }

  get isGoogleOnlyUser(): boolean {
    return this.providers.includes('google.com') && !this.providers.includes('password');
  }

  // ----- Change Password (email/password users) -----
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // ----- Add Password (Google-only users) -----
  addPasswordForm = { newPassword: '', confirmPassword: '' };
  isAddingPassword = false;
  addPasswordError = '';
  addPasswordSuccess = '';
  showAddNewPassword = false;
  showAddConfirmPassword = false;

  ngOnInit(): void {
    this.loadProfile();
    this.providers = this.authService.getProviders();
  }

  private loadProfile(): void {
    this.userProfileService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      if (profile) {
        this.editForm = { ...profile };
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.isEditing && this.userProfile) {
      this.editForm = { ...this.userProfile };
    }
  }

  async saveProfile(): Promise<void> {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.userProfileService.updateProfile({
        displayName: this.editForm.displayName,
        bio: this.editForm.bio,
        phone: this.editForm.phone
      });

      this.successMessage = 'Profile updated successfully!';
      this.isEditing = false;
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update profile';
    } finally {
      this.isSaving = false;
    }
  }

  // ----- Password Change -----
  async changePassword(): Promise<void> {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.passwordForm.currentPassword) {
      this.passwordError = 'Please enter your current password.';
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters.';
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    this.isChangingPassword = true;
    try {
      await this.authService.updatePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword);
      this.passwordSuccess = 'Password updated successfully!';
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      setTimeout(() => { this.passwordSuccess = ''; }, 4000);
    } catch (error: any) {
      this.passwordError = error.message || 'Failed to update password.';
    } finally {
      this.isChangingPassword = false;
    }
  }

  async sendResetEmail(): Promise<void> {
    this.passwordError = '';
    this.passwordSuccess = '';
    try {
      await this.authService.sendPasswordResetEmail();
      this.passwordSuccess = `Password reset email sent to ${this.userProfile?.email}. Check your inbox.`;
      setTimeout(() => { this.passwordSuccess = ''; }, 6000);
    } catch (error: any) {
      this.passwordError = error.message || 'Failed to send reset email.';
    }
  }

  // ----- Add Password (Google → Email+Password) -----
  async addPassword(): Promise<void> {
    this.addPasswordError = '';
    this.addPasswordSuccess = '';

    if (this.addPasswordForm.newPassword.length < 6) {
      this.addPasswordError = 'Password must be at least 6 characters.';
      return;
    }
    if (this.addPasswordForm.newPassword !== this.addPasswordForm.confirmPassword) {
      this.addPasswordError = 'Passwords do not match.';
      return;
    }

    this.isAddingPassword = true;
    try {
      await this.authService.linkEmailPassword(this.addPasswordForm.newPassword);
      this.addPasswordSuccess = 'Password added! You can now sign in with your email and this password.';
      this.addPasswordForm = { newPassword: '', confirmPassword: '' };
      // Refresh providers list
      this.providers = this.authService.getProviders();
      setTimeout(() => { this.addPasswordSuccess = ''; }, 6000);
    } catch (error: any) {
      this.addPasswordError = error.message || 'Failed to add password.';
    } finally {
      this.isAddingPassword = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  getInitials(): string {
    const name = this.userProfile?.displayName || this.userProfile?.email || 'User';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Temporary method for development to become admin
  async promoteToAdmin(): Promise<void> {
    if (!this.userProfile) return;
    try {
      await this.userService.updateUserRole(this.userProfile.uid, 'admin');
      alert('You are now an Admin! Please refresh the page or re-login.');
    } catch (error) {
      console.error('Error promoting to admin:', error);
      alert('Failed to promote to admin.');
    }
  }
}