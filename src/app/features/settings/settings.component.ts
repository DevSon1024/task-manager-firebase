import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService, UserSettings } from '../../core/services/user-profile.service';
import { ThemeService, Theme } from '../../core/services/theme.service';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: string;
  description: string;
}

interface LanguageOption {
  value: string;
  label: string;
}

interface TimezoneOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private userProfileService = inject(UserProfileService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // Read theme from ThemeService signal
  currentTheme = this.themeService.theme;

  // Other settings stored in Firebase
  settings: UserSettings = {
    notifications: true,
    emailNotifications: true,
    language: 'en',
    timezone: 'Asia/Kolkata'
  };

  isSaving = false;
  successMessage = '';
  errorMessage = '';

  themes: ThemeOption[] = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: '☀️',
      description: 'Bright and clear'
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: '🌙',
      description: 'Easy on the eyes'
    },
    { 
      value: 'system', 
      label: 'System', 
      icon: '⚡',
      description: 'Follows system'
    }
  ];

  languages: LanguageOption[] = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी (Hindi)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' }
  ];

  timezones: TimezoneOption[] = [
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
  ];

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.userProfileService.userSettings$.subscribe(settings => {
      this.settings = { ...settings };
    });
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.showSuccessMessage('Theme changed successfully!');
  }

  async saveSettings(): Promise<void> {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.userProfileService.saveSettings(this.settings);
      this.showSuccessMessage('Settings saved successfully!');
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save settings';
    } finally {
      this.isSaving = false;
    }
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}
