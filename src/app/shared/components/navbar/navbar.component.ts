import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService, UserProfile } from '../../../core/services/user-profile.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { LayoutService } from '../../../core/services/layout.service';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public layoutService = inject(LayoutService);
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private searchService = inject(SearchService);
  private router = inject(Router);

  userProfile: UserProfile | null = null;
  greeting: string = '';
  isProfileMenuOpen = false;

  toggleSearch() {
    this.searchService.toggleSearch();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.greeting = this.userProfileService.getGreeting();
  }

  ngOnDestroy(): void {}

  private loadUserData(): void {
    this.userProfileService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });
  }

  toggleProfileMenu(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  openSettings(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeProfileMenu();
    this.router.navigate(['/settings']);
  }

  openProfile(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeProfileMenu();
    this.router.navigate(['/profile']);
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