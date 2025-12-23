import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    @if (loading) {
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `
})
export class App implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  loading = true;

  ngOnInit() {
    // Listen to auth state changes
    authState(this.auth).subscribe((user) => {
      this.loading = false;
      
      if (user) {
        console.log('User is logged in:', user.email);
        // User is logged in, navigate to tasks if on login page
        const currentPath = this.router.url;
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
          this.router.navigate(['/tasks']);
        }
      } else {
        console.log('No user logged in');
        // User is not logged in, redirect to login if trying to access protected routes
        const currentPath = this.router.url;
        if (currentPath !== '/login' && currentPath !== '/register') {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
