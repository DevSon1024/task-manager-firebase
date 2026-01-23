import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 class="text-9xl font-bold text-blue-600 dark:text-blue-500">404</h1>
        <h2 class="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Page Not Found</h2>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
        <div class="mt-6">
          <a routerLink="/" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Go back home
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
