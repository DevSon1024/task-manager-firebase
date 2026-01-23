import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="toggleTheme()"
      class="p-2 rounded-lg transition-colors duration-200 
             hover:bg-gray-100 dark:hover:bg-gray-700
             text-gray-500 dark:text-gray-400"
      [title]="'Switch to ' + (nextTheme | titlecase) + ' mode'">
      
      <!-- Sun Icon (for Light Mode) -->
      <svg *ngIf="currentTheme() === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
        </path>
      </svg>

      <!-- Moon Icon (for Dark Mode) -->
      <svg *ngIf="currentTheme() === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z">
        </path>
      </svg>

      <!-- System Icon (Computer) -->
      <svg *ngIf="currentTheme() === 'system'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
        </path>
      </svg>
    </button>
  `
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  currentTheme = this.themeService.theme;

  get nextTheme(): string {
    const t = this.currentTheme();
    if (t === 'light') return 'dark';
    if (t === 'dark') return 'system';
    return 'light';
  }

  toggleTheme() {
    const t = this.currentTheme();
    if (t === 'light') this.themeService.setTheme('dark');
    else if (t === 'dark') this.themeService.setTheme('system');
    else this.themeService.setTheme('light');
  }
}
