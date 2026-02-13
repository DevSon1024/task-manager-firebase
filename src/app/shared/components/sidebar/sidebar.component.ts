import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationStart } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService, UserProfile } from '../../../core/services/user-profile.service';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  public layoutService = inject(LayoutService);
  private router = inject(Router);

  userProfile: UserProfile | null = null;
  isAdmin = false;

  ngOnInit(): void {
    this.userProfileService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      const profileData = profile as any; 
      this.isAdmin = profileData?.role === 'admin';
    });
    
    // Close sidebar on route change (for mobile)
    this.router.events.subscribe(() => {
       this.layoutService.closeSidebar();
    });
  }

  async logout() {
    await this.authService.logout();
    this.close();
  }
  
  close() {
    this.layoutService.closeSidebar();
  }
}
