import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService, UserProfile } from '../../../core/services/user-profile.service';

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

  userProfile: UserProfile | null = null;
  isAdmin = false;

  ngOnInit(): void {
    this.userProfileService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      // We need to check the role. The UserProfile model in UserProfileService might not have 'role' typed yet if it's strictly UserProfile interface
      // But the data from Firestore should contain it.
      // Let's cast or check safely.
      const profileData = profile as any; 
      this.isAdmin = profileData?.role === 'admin';
    });
  }

  async logout() {
    await this.authService.logout();
  }
}
