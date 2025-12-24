import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService, UserProfile } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private router = inject(Router);

  userProfile: UserProfile | null = null;
  greeting: string = '';
  isProfileMenuOpen = false;
  isSettingsModalOpen = false;

  ngOnInit(): void {
    this.loadUserData();
    this.greeting = this.userProfileService.getGreeting();
  }

  private loadUserData(): void {
    this.userProfileService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  openSettings(): void {
    this.closeProfileMenu();
    this.router.navigate(['/settings']);
  }

  openProfile(): void {
    this.closeProfileMenu();
    this.router.navigate(['/profile']);
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.closeProfileMenu();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getDisplayName(): string {
    if (this.userProfile?.displayName) {
      return this.userProfile.displayName;
    }
    if (this.userProfile?.email) {
      return this.userProfile.email.split('@')[0];
    }
    return 'User';
  }

  getInitials(): string {
    const name = this.getDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}