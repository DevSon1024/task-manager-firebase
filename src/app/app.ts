import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LayoutService } from './core/services/layout.service';
import { MarkdownService } from 'ngx-markdown';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { SearchOverlayComponent } from './shared/components/search-overlay/search-overlay.component';
import { SearchService } from './core/services/search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, SidebarComponent, ToastComponent, SearchOverlayComponent],
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
        <!-- Fixed on mobile, Sticky on desktop -->
        <app-sidebar *ngIf="showSidebar" 
                     class="fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
                     [class.-translate-x-full]="!layoutService.isSidebarOpen()">
        </app-sidebar>
        
        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-h-screen min-w-0">
           <!-- Navbar -->
           <app-navbar *ngIf="showNavbar" class="sticky top-0 z-10"></app-navbar>

           <main class="flex-1 overflow-y-auto">
             <router-outlet></router-outlet>
           </main>
        </div>
        
        <app-toast></app-toast>

        <!-- Global Search Overlay -->
        <app-search-overlay 
            *ngIf="searchService.isSearchOpen$ | async" 
            (close)="searchService.closeSearch()">
        </app-search-overlay>
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
  private authService = inject(AuthService); 
  private router = inject(Router);
  public layoutService = inject(LayoutService);
  public searchService = inject(SearchService); // Inject SearchService
  private markdownService = inject(MarkdownService);
  private notificationService = inject(NotificationService); 
  loading = true;
  showNavbar = false;
  showSidebar = false;

  ngOnInit() {
    // Configure Markdown Renderer for Links
    this.markdownService.renderer.link = (token: any) => {
      const href = token.href;
      const title = token.title;
      const text = token.text; 
      return `<a href="${href}" ${title ? `title="${title}"` : ''} target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    // Listen to auth state changes
    authState(this.auth).subscribe((user) => {
      this.loading = false;
      this.updateLayoutVisibility();
      
      if (user) {
        // console.log('User is logged in:', user.email);
        // Redirect to tasks if user is already on public pages (Login/Register/Landing)
        const currentPath = this.router.url;
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
           this.authService.redirectBasedOnRole(user.uid);
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
