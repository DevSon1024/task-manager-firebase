import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LayoutService } from './core/services/layout.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, SidebarComponent, ToastComponent],
  template: `
    @if (loading) {
      <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    } @else {
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
        <!-- Mobile Sidebar Overlay -->
        <div *ngIf="showSidebar && layoutService.isSidebarOpen()" 
             (click)="layoutService.closeSidebar()"
             class="fixed inset-0 bg-gray-900/50 z-20 md:hidden transition-opacity"></div>

        <!-- Sidebar -->
        <!-- Fixed on mobile, Static on desktop. Uses layoutService for mobile toggle. Always visible on desktop via md:translate-x-0 -->
        <app-sidebar *ngIf="showSidebar" 
                     class="fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 md:translate-x-0 md:static md:inset-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
                     [class.-translate-x-full]="!layoutService.isSidebarOpen()">
        </app-sidebar>
        
        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-h-screen min-w-0">
           <!-- Navbar (Optional: remove if sidebar handles everything, or keep for mobile/top actions) -->
           <!-- Let's keep navbar for mobile and for top-right actions like profile/theme -->
           <app-navbar *ngIf="showNavbar" class="sticky top-0 z-10"></app-navbar>

           <main class="flex-1 overflow-y-auto p-4">
             <router-outlet></router-outlet>
           </main>
        </div>
        
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
  public layoutService = inject(LayoutService);
  loading = true;
  showNavbar = false;
  showSidebar = false;

  ngOnInit() {
    // console.log('App initialized');
    
    // Listen to auth state changes
    authState(this.auth).subscribe((user) => {
      this.loading = false;
      this.updateLayoutVisibility();
      
      if (user) {
        // console.log('User is logged in:', user.email);
        // Redirect to tasks if user is already on public pages (Login/Register)
        const currentPath = this.router.url;
        if (currentPath === '/login' || currentPath === '/register') {
          // Verify redirection based on role is handled by auth service during login, 
          // but for direct access/refresh:
          // this.router.navigate(['/tasks']); // Let's leave this to AuthGuard or simple tasks for start
        }
      } else {
        // console.log('No user logged in');
      }
    });

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      // console.log('Navigation ended:', (event as NavigationEnd).url);
      this.updateLayoutVisibility();
    });
  }

  private updateLayoutVisibility(): void {
    const currentPath = this.router.url;
    
    // Auth pages or landing page should not show sidebar/navbar
    const isPublicPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/';
    const isLoggedIn = this.auth.currentUser !== null;

    this.showNavbar = isLoggedIn && !isPublicPage;
    this.showSidebar = isLoggedIn && !isPublicPage;
    
    // console.log('Layout:', { navbar: this.showNavbar, sidebar: this.showSidebar, path: currentPath });
  }
}
