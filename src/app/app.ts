import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, ToastComponent],
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
        <app-toast></app-toast>
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
      this.updateNavbarVisibility();
      
      if (user) {
        console.log('User is logged in:', user.email);
        // Redirect to tasks if user is already on public pages (Login/Register)
        const currentPath = this.router.url;
        if (currentPath === '/login' || currentPath === '/register') {
          this.router.navigate(['/tasks']);
        }
      } else {
        console.log('No user logged in');
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
    // Navbar hidden on landing page, login, register, and 404/error pages if we want
    // But typically we might want navbar on Landing? 
    // The previous logic was: show if currentUser != null.
    // Let's keep it simple: Show navbar ONLY when logged in, and NOT on auth pages.
    // Maybe we want a different navbar for Landing? Use LandingComponent's internal navbar for now.
    
    const isAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/';
    this.showNavbar = this.auth.currentUser !== null && !isAuthPage;
    
    // Actually, if we are on Landing Page ('/'), we might NOT want the *App* navbar (which has dashboard links).
    // The LandingComponent has its own Navbar.
    // So hiding it on '/' is correct.
    
    // Also hide if path is '/'
    if (currentPath === '/') {
        this.showNavbar = false;
    }
    
    console.log('Show navbar:', this.showNavbar, 'Path:', currentPath);
  }
}