import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<Theme>('system');

  constructor() {
    // Load saved theme or default to system
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.theme.set(savedTheme);
    }

    // Apply theme whenever it changes
    effect(() => {
      this.applyTheme(this.theme());
      localStorage.setItem('theme', this.theme());
    });
    
    // Listen for system changes if we are in system mode
    this.setupSystemListener();
  }

  setTheme(newTheme: Theme) {
    this.theme.set(newTheme);
  }

  private applyTheme(theme: Theme) {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    this.updateBrowserThemeColor(isDark ? 'dark' : 'light');
  }

  private setupSystemListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.theme() === 'system') {
        const isDark = e.matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        this.updateBrowserThemeColor(isDark ? 'dark' : 'light');
      }
    });
  }

  private updateBrowserThemeColor(mode: 'light' | 'dark'): void {
    const themeColors = {
      light: { main: '#ffffff', status: 'default' },
      dark: { main: '#111827', status: 'black-translucent' },
    };

    const color = themeColors[mode].main;
    const statusBarStyle = themeColors[mode].status;

    // Update standard theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', color);
    } else {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      themeColorMeta.setAttribute('content', color);
      document.head.appendChild(themeColorMeta);
    }

    // Update iOS status bar style
    let appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusBarMeta) {
      appleStatusBarMeta.setAttribute('content', statusBarStyle);
    } else {
      appleStatusBarMeta = document.createElement('meta');
      appleStatusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      appleStatusBarMeta.setAttribute('content', statusBarStyle);
      document.head.appendChild(appleStatusBarMeta);
    }
  }
}
