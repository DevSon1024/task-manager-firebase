import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Signal to track sidebar state (mobile)
  isSidebarOpen = signal<boolean>(false);

  // Signals for scroll-based navbar hiding
  scrollY = signal<number>(0);
  isNavbarHidden = signal<boolean>(false);
  private lastScrollY = 0;
  private scrollThreshold = 60;

  // Signal for global task creation modal
  isGlobalCreateTaskOpen = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  openSidebar() {
    this.isSidebarOpen.set(true);
  }

  openGlobalCreateTask() {
    this.isGlobalCreateTaskOpen.set(true);
  }

  closeGlobalCreateTask() {
    this.isGlobalCreateTaskOpen.set(false);
  }

  onMainScroll(scrollTop: number, scrollHeight?: number, clientHeight?: number): void {
    if (scrollTop < this.scrollThreshold) {
      this.isNavbarHidden.set(false);
    } else if (scrollTop > this.lastScrollY + 5) {
      // Scrolling down
      this.isNavbarHidden.set(true);
    } else if (scrollTop < this.lastScrollY - 5) {
      // Scrolling up
      // Prevent unhiding if the browser auto-adjusted the scroll boundary because of container resizing (navbar hiding)
      if (scrollHeight && clientHeight && (scrollTop + clientHeight >= scrollHeight - 2)) {
        // We are at the bottom of the page; downward scroll caused the container to grow, forcing an apparent upward scroll.
      } else {
        this.isNavbarHidden.set(false);
      }
    }
    this.lastScrollY = scrollTop;
  }
}
