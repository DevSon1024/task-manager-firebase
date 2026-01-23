import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      <!-- Navbar -->
      <nav class="relative z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-md">
             <span class="text-white font-bold text-xl">T</span>
          </div>
          <span class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TaskFlow</span>
        </div>
        <div class="flex items-center space-x-6">
          <app-theme-toggle></app-theme-toggle>
          <a routerLink="/login" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Sign In</a>
          <a routerLink="/register" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30">
            Get Started
          </a>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="relative pt-20 pb-32 lg:pt-32 lg:pb-44 overflow-hidden">
        <!-- Background Gradients -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
          <div class="absolute bottom-0 right-[-5%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-gray-900 dark:text-white">
            Organize work.<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">Amplify productivity.</span>
          </h1>
          <p class="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
            The ultimate task management tool designed for individuals and teams who want to get things done with style and efficiency.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
             <a routerLink="/register" class="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-2xl">
               Start for free
             </a>
             <a routerLink="/login" class="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm hover:shadow-md">
               Live Demo
             </a>
          </div>

          <!-- Feature Preview UI -->
          <div class="mt-20 relative mx-auto max-w-5xl">
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 dark:opacity-30"></div>
            <div class="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors duration-300">
              <div class="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur">
                <div class="flex space-x-2">
                  <div class="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500"></div>
                </div>
              </div>
              <div class="p-8 bg-gray-50 dark:bg-gray-900/50 grid gap-6 md:grid-cols-3 text-left">
                 <!-- Mock Task Column 1 -->
                 <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                       <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">To Do</span>
                       <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                    </div>
                    <div class="space-y-3">
                       <div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer group">
                          <div class="h-2 w-16 bg-blue-100 dark:bg-blue-500/20 rounded mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30"></div>
                          <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                          <div class="flex items-center gap-2">
                             <div class="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                             <div class="h-2 w-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <!-- Mock Task Column 2 -->
                 <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                       <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">In Progress</span>
                       <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                    </div>
                    <div class="space-y-3">
                       <div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer">
                          <div class="h-2 w-16 bg-yellow-100 dark:bg-yellow-500/20 rounded mb-2"></div>
                          <div class="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                       </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer">
                          <div class="h-2 w-16 bg-purple-100 dark:bg-purple-500/20 rounded mb-2"></div>
                          <div class="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                       </div>
                    </div>
                 </div>
                 <!-- Mock Task Column 3 -->
                  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                       <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">Done</span>
                       <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                    <div class="space-y-3">
                       <div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 opacity-60">
                          <div class="h-2 w-16 bg-green-100 dark:bg-green-500/20 rounded mb-2"></div>
                          <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative transition-colors duration-300">
         <div class="max-w-7xl mx-auto px-6">
            <div class="grid md:grid-cols-3 gap-8">
               <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-xl dark:shadow-none">
                  <div class="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                     <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                  </div>
                  <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Lightning Fast</h3>
                  <p class="text-gray-600 dark:text-gray-400">Optimized performance ensuring your task management is as fast as your thoughts.</p>
               </div>
               <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-xl dark:shadow-none">
                  <div class="w-12 h-12 bg-purple-100 dark:bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                     <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                  </div>
                  <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Secure by Default</h3>
                  <p class="text-gray-600 dark:text-gray-400">Your data is encrypted and protected with enterprise-grade security protocols.</p>
               </div>
               <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-xl dark:shadow-none">
                  <div class="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                     <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Goal Oriented</h3>
                  <p class="text-gray-600 dark:text-gray-400">Stay focused on what matters most with intuitve tracking and progress insights.</p>
               </div>
            </div>
         </div>
      </div>
      
      <!-- Footer -->
      <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 text-center text-gray-600 dark:text-gray-500 transition-colors duration-300">
         <p>&copy; 2026 TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: []
})
export class LandingComponent {}
