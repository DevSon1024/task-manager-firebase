import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  users$: Observable<User[]> | undefined;
  currentUser: any;

  // State Management
  activeTab: 'analytics' | 'users' = 'analytics';

  // Analytics Metrics
  totalUsers = 0;
  activeUsersCount = 0;
  adminUsersCount = 0;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Fetch users and calculate metrics
    this.users$ = this.userService.getUsers().pipe(
      tap(users => {
        this.totalUsers = users.length;
        this.activeUsersCount = users.filter(u => u.isActive !== false).length;
        this.adminUsersCount = users.filter(u => u.role === 'admin').length;
      })
    );
  }

  setTab(tab: 'analytics' | 'users') {
    this.activeTab = tab;
  }

  // Action: Promote to Admin
  async promoteToAdmin(user: User) {
    if (user.uid === this.currentUser?.uid) return;
    try {
      await this.userService.updateUserRole(user.uid, 'admin');
      this.toastService.success(`${user.displayName} promoted to Admin.`);
    } catch (error) {
      console.error('Error promoting user:', error);
      this.toastService.error('Failed to promote user.');
    }
  }

  // Action: Demote to User
  async demoteToUser(user: User) {
    if (user.uid === this.currentUser?.uid) {
      this.toastService.warning("You cannot demote yourself!");
      return;
    }
    try {
      await this.userService.updateUserRole(user.uid, 'user');
      this.toastService.success(`${user.displayName} demoted to User.`);
    } catch (error) {
      console.error('Error demoting user:', error);
      this.toastService.error('Failed to demote user.');
    }
  }

  // Action: Suspend / Reactivate
  async toggleSuspend(user: User) {
    if (user.uid === this.currentUser?.uid) {
      this.toastService.warning("You cannot suspend yourself!");
      return;
    }
    
    // Default is true (active) if undefined
    const currentlyActive = user.isActive !== false;
    const newStatus = !currentlyActive;
    
    const actionName = newStatus ? 'Reactivated' : 'Suspended';
    try {
      await this.userService.toggleUserSuspension(user.uid, newStatus);
      this.toastService.success(`${user.displayName} has been ${actionName.toLowerCase()}.`);
    } catch (error) {
      console.error(`Error toggling suspension for user:`, error);
      this.toastService.error(`Failed to change suspension status.`);
    }
  }

  // Action: Delete User Document
  async confirmAndDeleteUser(user: User) {
    if (user.uid === this.currentUser?.uid) {
      this.toastService.warning("You cannot delete yourself!");
      return;
    }
    
    if (confirm(`Are you sure you want to completely delete ${user.displayName}'s data? This action is permanent and cannot be undone.`)) {
      try {
        await this.userService.deleteUser(user.uid);
        this.toastService.success(`User data for ${user.displayName} deleted.`);
      } catch (error) {
        console.error('Error deleting user:', error);
        this.toastService.error('Failed to delete user data.');
      }
    }
  }

  // Helper for Last Seen display
  isUserOnline(lastSeen: any): boolean {
    return true; // placeholder template mapping handled separately if needed
  }
}
