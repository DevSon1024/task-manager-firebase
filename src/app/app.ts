import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
import { ModalComponent } from './shared/components/modal/modal.component';
import { TaskFormComponent } from './features/tasks/task-form/task-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, SidebarComponent, ToastComponent, SearchOverlayComponent, ModalComponent, TaskFormComponent],
  template: `
    @if (loading) {
      <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    } @else {
      <div [ngClass]="showSidebar ? 'h-screen overflow-hidden' : 'min-h-screen'" class="bg-gray-50 dark:bg-gray-900 flex relative">
        <!-- Mobile Sidebar Overlay -->
        <div *ngIf="showSidebar && layoutService.isSidebarOpen()" 
             (click)="layoutService.closeSidebar()"
             class="fixed inset-0 bg-gray-900/50 z-20 md:hidden transition-opacity"></div>

        <!-- Sidebar: fixed on mobile, fixed full-height on desktop -->
        <app-sidebar *ngIf="showSidebar" 
                     class="fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 md:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
                     [class.-translate-x-full]="!layoutService.isSidebarOpen()">
        </app-sidebar>
        
        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col h-full min-w-0" [ngClass]="showSidebar ? 'md:ml-20' : ''">
           <!-- Navbar: slides up when hidden but never clips overflow (so dropdown remains visible) -->
           <div class="shrink-0 transition-all duration-300 ease-in-out relative z-40"
                [class.-mt-20]="showNavbar && layoutService.isNavbarHidden()"
                [class.opacity-0]="showNavbar && layoutService.isNavbarHidden()"
                [class.pointer-events-none]="showNavbar && layoutService.isNavbarHidden()">
             <app-navbar *ngIf="showNavbar"></app-navbar>
           </div>

           <main #mainContent
                 class="flex-1 overflow-y-auto min-h-0 transition-[filter] duration-300"
                 [class.blur-sm]="searchService.isSearchOpen$ | async"
                 [class.brightness-75]="searchService.isSearchOpen$ | async"
                 (scroll)="onMainScroll($event)">
             <router-outlet></router-outlet>
           </main>
        </div>
        
        <app-toast></app-toast>

        <!-- Global Search Overlay -->
        <app-search-overlay 
            *ngIf="searchService.isSearchOpen$ | async" 
            (close)="searchService.closeSearch()">
        </app-search-overlay>

        <!-- Global Create Task Modal (accessible from any page) -->
        <app-modal 
            [isOpen]="layoutService.isGlobalCreateTaskOpen()" 
            title="Create New Task" 
            (close)="layoutService.closeGlobalCreateTask()">
          <app-task-form 
             [task]="null" 
             (cancel)="layoutService.closeGlobalCreateTask()">
          </app-task-form>
        </app-modal>
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
export class App implements OnInit, AfterViewInit {
  private auth = inject(Auth);
  private authService = inject(AuthService); 
  private router = inject(Router);
  public layoutService = inject(LayoutService);
  public searchService = inject(SearchService);
  private markdownService = inject(MarkdownService);
  private notificationService = inject(NotificationService); 
  loading = true;
  showNavbar = false;
  showSidebar = false;

  @ViewChild('mainContent') mainContent!: ElementRef<HTMLElement>;

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
        const currentPath = this.router.url;
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
           this.authService.redirectBasedOnRole(user.uid);
        }
      }
    });

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.updateLayoutVisibility();
    });
  }

  ngAfterViewInit() {}

  onMainScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.layoutService.onMainScroll(target.scrollTop);
  }

  private updateLayoutVisibility(): void {
    const currentPath = this.router.url;
    
    const isPublicPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/';
    const isLoggedIn = this.auth.currentUser !== null;

    this.showNavbar = isLoggedIn && !isPublicPage;
    this.showSidebar = isLoggedIn && !isPublicPage;
  }
}
