import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    @if (loading) {
      <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    } @else {
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        @if (showNavbar) {
          <app-navbar></app-navbar>
        }
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  loading = true;
  showNavbar = false;

  ngOnInit() {
    console.log('App initialized');
    
    // Listen to auth state changes
    authState(this.auth).subscribe((user) => {
      this.loading = false;
      
      if (user) {
        console.log('User is logged in:', user.email);
        this.updateNavbarVisibility();
        
        const currentPath = this.router.url;
        console.log('Current path:', currentPath);
        
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
          this.router.navigate(['/tasks']);
        }
      } else {
        console.log('No user logged in');
        this.showNavbar = false;
        
        const currentPath = this.router.url;
        if (currentPath !== '/login' && currentPath !== '/register') {
          this.router.navigate(['/login']);
        }
      }
    });

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      console.log('Navigation ended:', (event as NavigationEnd).url);
      this.updateNavbarVisibility();
    });
  }

  private updateNavbarVisibility(): void {
    const currentPath = this.router.url;
    const isAuthPage = currentPath === '/login' || currentPath === '/register';
    this.showNavbar = this.auth.currentUser !== null && !isAuthPage;
    console.log('Show navbar:', this.showNavbar, 'Path:', currentPath);
  }
}