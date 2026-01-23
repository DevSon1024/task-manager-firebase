import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService, UserSettings } from '../../core/services/user-profile.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';

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
  private toastService = inject(ToastService);
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
    this.toastService.success(`Theme set to ${theme}`);
  }

  async saveSettings(): Promise<void> {
    this.isSaving = true;

    try {
      await this.userProfileService.saveSettings(this.settings);
      this.toastService.success('Settings saved successfully!');
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to save settings');
    } finally {
      this.isSaving = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}
