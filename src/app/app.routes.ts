import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { redirectLoggedInTo } from '@angular/fire/auth-guard'; // Optional: if you want to redirect logged in users from landing

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    title: 'TaskFlow - Organized Productivity'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - TaskFlow'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Register - TaskFlow'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [authGuard],
    title: 'My Tasks'
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profile'
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
    title: 'Settings'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Admin Dashboard'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/error/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Access Denied'
  },
  {
    path: '**',
    loadComponent: () => import('./features/error/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found'
  }
];