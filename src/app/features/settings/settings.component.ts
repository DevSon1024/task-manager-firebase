import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService, UserSettings } from '../../core/services/user-profile.service';

interface ThemeOption {
  value: 'light' | 'dark' | 'auto';
  label: string;
  icon: string;
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
  private router = inject(Router);

  settings: UserSettings = {
    theme: 'light',
    notifications: true,
    emailNotifications: true,
    language: 'en',
    timezone: 'Asia/Kolkata'
  };

  isSaving = false;
  successMessage = '';
  errorMessage = '';

  themes: ThemeOption[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '⚡' }
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

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.settings.theme = theme;
  }

  async saveSettings(): Promise<void> {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.userProfileService.saveSettings(this.settings);
      this.successMessage = 'Settings saved successfully!';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save settings';
    } finally {
      this.isSaving = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}