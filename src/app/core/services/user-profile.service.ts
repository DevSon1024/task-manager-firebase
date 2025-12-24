import { Injectable, inject } from '@angular/core';
import { Auth, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, docData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, filter, switchMap, of } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSettings {
  notifications: boolean;
  emailNotifications: boolean;
  language: string;
  timezone: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private userSettingsSubject = new BehaviorSubject<UserSettings>({
    notifications: true,
    emailNotifications: true,
    language: 'en',
    timezone: 'Asia/Kolkata',
  });

  userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();
  userSettings$: Observable<UserSettings> = this.userSettingsSubject.asObservable();

  constructor() {
    // Initialize with current user if available
    this.initializeUserData();
    // Apply saved theme on service initialization
    this.applySavedTheme();
  }

  private initializeUserData(): void {
    // Subscribe to auth state changes
    const user = this.auth.currentUser;
    if (user) {
      this.loadUserData(user);
    }

    // Listen to future auth changes
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.loadUserData(user);
      } else {
        this.userProfileSubject.next(null);
      }
    });
  }

  private async loadUserData(user: FirebaseUser): Promise<void> {
    try {
      // First, set basic profile from auth
      const basicProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
      };

      this.userProfileSubject.next(basicProfile);

      // Then try to load extended profile from Firestore
      await this.loadProfile(user.uid);
      await this.loadSettings(user.uid);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Keep basic profile even if Firestore fails
    }
  }

  async loadProfile(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `users/${uid}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        this.userProfileSubject.next(data);
      } else {
        // Create initial profile if doesn't exist
        const user = this.auth.currentUser;
        if (user) {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await this.createProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't throw - keep working with auth data
    }
  }

  async createProfile(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(this.firestore, `users/${profile.uid}`);
      await setDoc(docRef, profile);
      this.userProfileSubject.next(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      // Don't throw - profile creation is optional
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      const docRef = doc(this.firestore, `users/${user.uid}`);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await updateDoc(docRef, updateData);

      const currentProfile = this.userProfileSubject.value;
      if (currentProfile) {
        this.userProfileSubject.next({
          ...currentProfile,
          ...updateData,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async loadSettings(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `users/${uid}/settings/preferences`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.userSettingsSubject.next(docSnap.data() as UserSettings);
      } else {
        // Save default settings
        await this.saveSettings(this.userSettingsSubject.value);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Keep default settings
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      const docRef = doc(this.firestore, `users/${user.uid}/settings/preferences`);
      await setDoc(docRef, settings);
      this.userSettingsSubject.next(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // ========== THEME MANAGEMENT (Browser LocalStorage) ==========

  /**
   * Get the current theme from localStorage
   */
  getTheme(): 'light' | 'dark' | 'auto' {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
      return savedTheme;
    }
    return 'light'; // Default theme
  }

  /**
   * Save theme preference to localStorage and apply it
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    console.log('Setting theme to:', theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  /**
   * Apply the saved theme on initialization
   */
  private applySavedTheme(): void {
    const savedTheme = this.getTheme();
    console.log('Applying saved theme:', savedTheme);
    this.applyTheme(savedTheme);
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    console.log('Applying theme:', theme);

    // Remove existing listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', this.handleSystemThemeChange);

    // Theme colors for browser URL bar
    const themeColors = {
      light: {
        main: '#ffffff', // White
        status: 'default', // iOS status bar
      },
      dark: {
        main: '#111827', // gray-900
        status: 'black-translucent', // iOS status bar
      },
    };

    let appliedTheme: 'light' | 'dark' = 'light';

    if (theme === 'auto') {
      // Check system preference
      const prefersDark = mediaQuery.matches;
      console.log('Auto mode - system prefers dark:', prefersDark);

      appliedTheme = prefersDark ? 'dark' : 'light';

      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Listen for system theme changes
      mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    } else if (theme === 'dark') {
      console.log('Setting dark mode');
      document.documentElement.classList.add('dark');
      appliedTheme = 'dark';
    } else {
      console.log('Setting light mode');
      document.documentElement.classList.remove('dark');
      appliedTheme = 'light';
    }

    // Update browser theme color (URL bar color on mobile)
    this.updateBrowserThemeColor(themeColors[appliedTheme].main, themeColors[appliedTheme].status);

    // Log the current classes for debugging
    console.log('Document classes:', document.documentElement.className);
    console.log('Browser theme color set to:', themeColors[appliedTheme].main);
  }
  private updateBrowserThemeColor(color: string, statusBarStyle: string): void {
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
    let appleStatusBarMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );
    if (appleStatusBarMeta) {
      appleStatusBarMeta.setAttribute('content', statusBarStyle);
    } else {
      appleStatusBarMeta = document.createElement('meta');
      appleStatusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      appleStatusBarMeta.setAttribute('content', statusBarStyle);
      document.head.appendChild(appleStatusBarMeta);
    }

    // Update Microsoft tile color
    let msTileColorMeta = document.querySelector('meta[name="msapplication-TileColor"]');
    if (msTileColorMeta) {
      msTileColorMeta.setAttribute('content', color);
    }
  }

  /**
   * Setup listener for system theme changes (for auto mode)
   */
  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Remove previous listener if exists
    mediaQuery.removeEventListener('change', this.handleSystemThemeChange);

    // Add new listener only if theme is auto
    if (this.getTheme() === 'auto') {
      mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    }
  }

  /**
   * Handle system theme changes
   */
  private handleSystemThemeChange = (e: MediaQueryListEvent): void => {
    console.log('System theme changed:', e.matches ? 'dark' : 'light');

    if (this.getTheme() === 'auto') {
      const themeColors = {
        light: { main: '#ffffff', status: 'default' },
        dark: { main: '#111827', status: 'black-translucent' },
      };

      const theme = e.matches ? 'dark' : 'light';

      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Update browser theme color
      this.updateBrowserThemeColor(themeColors[theme].main, themeColors[theme].status);
    }
  };

  getUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  getUserSettings(): UserSettings {
    return this.userSettingsSubject.value;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  }
}
