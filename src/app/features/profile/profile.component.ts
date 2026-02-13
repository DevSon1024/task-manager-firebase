import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService, UserProfile } from '../../core/services/user-profile.service';
import { UserService } from '../../core/services/user.service';

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
  private router = inject(Router);

  userProfile: UserProfile | null = null;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  editForm: Partial<UserProfile> = {};

  ngOnInit(): void {
    this.loadProfile();
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
      // location.reload();
    } catch (error) {
      console.error('Error promoting to admin:', error);
      alert('Failed to promote to admin.');
    }
  }
}