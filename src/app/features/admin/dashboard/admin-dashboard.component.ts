import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

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

  users$: Observable<User[]> | undefined;
  currentUser: any;

  ngOnInit(): void {
    this.users$ = this.userService.getUsers();
    this.currentUser = this.authService.getCurrentUser();
  }

  // Update Role
  async updateRole(user: User, newRole: string) {
    if (user.uid === this.currentUser?.uid) {
      alert("You cannot change your own role!");
      return;
    }
    try {
      await this.userService.updateUserRole(user.uid, newRole);
      // Optional: Add toast notification
    } catch (error) {
      console.error('Error updating role:', error);
    }
  }

  // Delete User
  async deleteUser(user: User) {
    if (user.uid === this.currentUser?.uid) {
      alert("You cannot delete yourself!");
      return;
    }
    if (confirm(`Are you sure you want to delete ${user.displayName}? This action cannot be undone.`)) {
      try {
        await this.userService.deleteUser(user.uid);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  }

  // Helper to check if user is online based on lastSeen
  isUserOnline(lastSeen: any): boolean {
    if (!lastSeen) return false;
    // Basic check: if lastSeen is within last 2 minutes
    // Firestore timestamp to Date conversion might be needed depending on object structure
    // simpler approach: rely on isOnline field if updated correctly
    // or compare timestamp
    return true; // placeholder, template will handle display
  }
}
