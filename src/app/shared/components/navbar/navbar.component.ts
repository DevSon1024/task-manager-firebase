import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService, UserProfile } from '../../../core/services/user-profile.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
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

  ngOnInit(): void {
    this.loadUserData();
    this.greeting = this.userProfileService.getGreeting();
  }

  private loadUserData(): void {
    this.userProfileService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      console.log('User profile loaded:', profile);
    });
  }

  toggleProfileMenu(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    console.log('Menu toggled:', this.isProfileMenuOpen);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  openSettings(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Opening settings...');
    this.closeProfileMenu();
    this.router.navigate(['/settings']).then(success => {
      console.log('Navigation to settings:', success);
    });
  }

  openProfile(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Opening profile...');
    this.closeProfileMenu();
    this.router.navigate(['/profile']).then(success => {
      console.log('Navigation to profile:', success);
    });
  }

  goToTasks(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeProfileMenu();
    this.router.navigate(['/tasks']);
  }

  async logout(event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    try {
      console.log('Logging out...');
      this.closeProfileMenu();
      await this.authService.logout();
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