import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-hidden font-sans transition-colors duration-300 selection:bg-blue-500 selection:text-white">
      
      <!-- Glassmorphic Navbar — hidden when mobile drawer is open -->
      <nav *ngIf="!mobileMenuOpen"
           [class.-translate-y-full]="navHidden"
           class="fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg shadow-gray-200/20 dark:shadow-black/20">
        <div class="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div class="flex items-center space-x-3 group cursor-pointer">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-12 shadow-lg shadow-blue-500/30">
               <span class="text-white font-bold text-2xl drop-shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
                  <defs>
                    <linearGradient id="task-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#4F46E5" /> <stop offset="100%" stop-color="#7C3AED" /> </linearGradient>
                  </defs>
                  
                  <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#task-gradient)" />
                  
                  <path 
                    d="M18 32 L28 42 L46 22" 
                    fill="none" 
                    stroke="#FFFFFF" 
                    stroke-width="6" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                  />
                </svg>     
               </span>
            </div>
            <span class="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">TaskFlow</span>
          </div>
          <div class="flex items-center space-x-4 md:space-x-8">
            <app-theme-toggle></app-theme-toggle>
            <div class="hidden md:flex items-center space-x-6">
                 <a routerLink="/login" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Sign In</a>
                 <a routerLink="/register" class="px-6 py-2.5 rounded-full font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                    Get Started
                 </a>
            </div>
             <!-- Mobile Menu Button -->
             <button (click)="toggleMobileMenu()"
                     class="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
             </button>
          </div>
        </div>
      </nav>

      <!-- Mobile Drawer Backdrop -->
      <div *ngIf="mobileMenuOpen"
           (click)="closeMobileMenu()"
           class="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm md:hidden transition-opacity">
      </div>

      <!-- Mobile Drawer Sidebar (full-height, slides from right) -->
      <div class="fixed top-0 right-0 bottom-0 z-50 w-80 md:hidden bg-white dark:bg-gray-950 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
           [class.translate-x-full]="!mobileMenuOpen"
           [class.translate-x-0]="mobileMenuOpen">

        <!-- Gradient Hero Header -->
        <div class="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 pt-10 pb-8 overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div class="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full"></div>

          <!-- Close button -->
          <button (click)="closeMobileMenu()"
                  class="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Logo + Brand -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-8 h-8">
                <path d="M18 32 L28 42 L46 22" fill="none" stroke="#FFFFFF" stroke-width="6"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-white font-bold text-xl leading-none">TaskFlow</p>
              <p class="text-blue-200 text-xs mt-0.5">Organize. Focus. Achieve.</p>
            </div>
          </div>

          <p class="text-white/80 text-sm leading-relaxed">
            Join thousands of people who organize their work smarter every day.
          </p>
        </div>

        <!-- Nav Links -->
        <div class="flex flex-col flex-1 gap-3 px-5 py-7 overflow-y-auto">

          <!-- Get Started CTA -->
          <a routerLink="/register" (click)="closeMobileMenu()"
             class="flex items-center justify-center gap-2 w-full px-5 py-4 rounded-2xl font-bold text-white text-base
                    bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                    shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all active:scale-95">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Get Started — It's Free
          </a>

          <!-- Divider -->
          <div class="flex items-center gap-3 py-1">
            <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
            <span class="text-xs text-gray-400 font-medium">Already have an account?</span>
            <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
          </div>

          <!-- Sign In -->
          <a routerLink="/login" (click)="closeMobileMenu()"
             class="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl font-semibold text-base
                    text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60
                    border border-gray-200 dark:border-gray-700
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Sign In
          </a>

          <!-- Feature Bullets -->
          <div class="mt-4 space-y-2.5 px-1">
            <div *ngFor="let f of drawerFeatures" class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div class="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              {{ f }}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
          &copy; {{ currentYear }} TaskFlow &bull; Free forever
        </div>
      </div>

      <!-- Hero Section -->
      <div class="relative pt-32 pb-32 lg:pt-48 lg:pb-52 overflow-hidden">
        
        <!-- Detailed Background Animations -->
        <div class="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <!-- Animated Blobs -->
          <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob"></div>
          <div class="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-2000"></div>
          <div class="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-4000"></div>
          
          <!-- Grid Overlay for texture -->
          <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <!-- <div class="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
            <span class="flex h-2 w-2 relative mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 is now live
          </div> -->

          <h1 class="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight text-gray-900 dark:text-white animate-fade-in-up animation-delay-100">
            Organize work.<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x">Amplify productivity.</span>
          </h1>
          
          <p class="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed drop-shadow-sm animate-fade-in-up animation-delay-200">
            The ultimate task management tool designed for individuals and teams who want to get things done with style and efficiency.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up animation-delay-300">
             <a routerLink="/register" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95">
               Start for free
             </a>
             <a routerLink="/login" class="px-8 py-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-bold text-lg hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm transition-all transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
               Live Demo
             </a>
          </div>

          <!-- Feature Preview UI (3D Tilt Effect Container) -->
          <div class="mt-24 relative mx-auto max-w-6xl animate-fade-in-up animation-delay-500 perspective-1000">
            <!-- Glow behind container -->
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl blur-lg opacity-30 dark:opacity-50 animate-pulse"></div>
            
            <!-- Main Content Container with Glassmorphism -->
            <div class="relative bg-white/70 dark:bg-gray-800/60 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden backdrop-blur-md transform transition-transform hover:scale-[1.01] duration-500">
              
              <!-- Window Controls -->
              <div class="flex items-center px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50">
                <div class="flex space-x-2">
                  <div class="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500 shadow-inner"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500 shadow-inner"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500 shadow-inner"></div>
                </div>
                <div class="mx-auto text-xs font-medium text-gray-400 dark:text-gray-500">taskflow-app.local</div>
              </div>

              <div class="p-8 grid gap-6 md:grid-cols-3 text-left">
                 <!-- Mock Task Column 1 -->
                 <div class="bg-white/60 dark:bg-gray-900/60 p-5 rounded-xl border border-white/40 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                       <span class="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">To Do</span>
                       <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    </div>
                    <div class="space-y-3">
                       <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/80 shadow-sm hover:border-blue-500/50 transition-colors cursor-pointer group">
                          <div class="h-2 w-16 bg-blue-100 dark:bg-blue-900/50 rounded mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors"></div>
                          <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                          <div class="flex items-center gap-2">
                             <div class="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800"></div>
                             <div class="h-2 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                       </div>
                        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/80 shadow-sm opacity-50">
                           <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                 </div>
                 <!-- Mock Column 2 -->
                 <div class="bg-white/60 dark:bg-gray-900/60 p-5 rounded-xl border border-white/40 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                       <span class="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">In Progress</span>
                       <span class="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                    </div>
                    <div class="space-y-3">
                       <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/80 shadow-sm transition-colors cursor-pointer border-l-4 border-l-yellow-500">
                          <div class="h-2 w-16 bg-yellow-100 dark:bg-yellow-900/50 rounded mb-3"></div>
                          <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                          <div class="flex -space-x-2">
                             <div class="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800 z-10"></div>
                             <div class="h-6 w-6 rounded-full bg-gray-400 dark:bg-gray-500 ring-2 ring-white dark:ring-gray-800"></div>
                          </div>
                       </div>
                    </div>
                 </div>
                  <!-- Mock Column 3 -->
                  <div class="bg-white/60 dark:bg-gray-900/60 p-5 rounded-xl border border-white/40 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                       <span class="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Done</span>
                       <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                    </div>
                    <div class="space-y-3">
                       <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/80 shadow-sm opacity-60">
                          <div class="h-2 w-16 bg-green-100 dark:bg-green-900/50 rounded mb-3"></div>
                          <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3 decoration-slate-500 line-through"></div>
                          <div class="w-full h-1 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                             <div class="h-full w-full bg-green-500"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div> 
            </div>
          </div>
        </div>
      </div>
      
      <!-- SECTION 1: Features with placeholder screenshots -->
      <section class="py-24 bg-white dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 mb-4">Everything you need</span>
            <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">Built for how you <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">actually work</span></h2>
            <p class="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">From quick task captures to deep note-taking sessions, TaskFlow adapts to your workflow.</p>
          </div>

          <!-- Feature row 1: Kanban -->
          <div class="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div class="order-2 md:order-1">
              <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
                Kanban Board
              </div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Drag & drop tasks across your workflow</h3>
              <p class="text-gray-500 dark:text-gray-400 text-lg mb-6 leading-relaxed">Move tasks between To Do, In Progress, and Done with smooth drag-and-drop. See your entire workload at a glance and never lose track of what's next.</p>
              <ul class="space-y-3">
                <li *ngFor="let p of kanbanPoints" class="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <svg class="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>{{ p }}
                </li>
              </ul>
            </div>
            <!-- Kanban screenshot -->
            <div class="order-1 md:order-2 relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img src="assets/screenshots/UserDashboard.png" alt="TaskFlow Dashboard Screenshot"
                   (click)="openLightbox(0)"
                   class="relative w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-zoom-in">
            </div>
          </div>

          <!-- Feature row 2: Notes -->
          <div class="grid md:grid-cols-2 gap-12 items-center mb-24">
            <!-- Notes screenshot -->
            <div class="relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img src="assets/screenshots/notes.png" alt="TaskFlow Notes Screenshot"
                   (click)="openLightbox(1)"
                   class="relative w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-zoom-in">
            </div>
            <div>
              <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Notes
              </div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Write notes in Markdown, linked to tasks</h3>
              <p class="text-gray-500 dark:text-gray-400 text-lg mb-6 leading-relaxed">Capture ideas with full Markdown support, organize into color-coded notebooks, and link notes directly to related tasks for full context.</p>
              <ul class="space-y-3">
                <li *ngFor="let p of notesPoints" class="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <svg class="h-5 w-5 text-purple-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>{{ p }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Feature row 3: Search -->
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Smart Search
              </div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Find anything instantly</h3>
              <p class="text-gray-500 dark:text-gray-400 text-lg mb-6 leading-relaxed">Press <kbd class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border text-sm font-mono">/</kbd> anywhere to open unified search. Results appear as you type across all tasks and notes with highlighted matches.</p>
              <ul class="space-y-3">
                <li *ngFor="let p of searchPoints" class="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <svg class="h-5 w-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>{{ p }}
                </li>
              </ul>
            </div>
            <!-- Search screenshot -->
            <div class="relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img src="assets/screenshots/Search.png" alt="TaskFlow Smart Search Screenshot"
                   (click)="openLightbox(2)"
                   class="relative w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-zoom-in">
            </div>
          </div>
        </div>
      </section>

      <!-- ── Lightbox ── -->
      <div *ngIf="lightboxIndex !== null"
           class="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center"
           (click)="closeLightbox()">

        <!-- Image -->
        <img [src]="lightboxImages[lightboxIndex!]" alt="Screenshot"
             (click)="$event.stopPropagation()"
             class="max-h-[88vh] max-w-[92vw] rounded-2xl shadow-2xl object-contain select-none">

        <!-- Close -->
        <button (click)="closeLightbox()"
                class="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors" title="Close (ESC)">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Prev -->
        <button (click)="$event.stopPropagation(); prevImage()"
                class="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>

        <!-- Next -->
        <button (click)="$event.stopPropagation(); nextImage()"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>

        <!-- Dot indicators -->
        <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5">
          <button *ngFor="let img of lightboxImages; let i = index"
                  (click)="$event.stopPropagation(); lightboxIndex = i"
                  [class.scale-125]="i === lightboxIndex"
                  [class.bg-white]="i === lightboxIndex"
                  [class.bg-white/40]="i !== lightboxIndex"
                  class="w-2 h-2 rounded-full transition-all duration-200">
          </button>
        </div>
      </div>

      <!-- SECTION 2: How It Works -->
      <section class="py-24 bg-gray-50 dark:bg-gray-950">
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-center mb-14">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 mb-4">Simple by design</span>
            <h2 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Up and running in <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">3 steps</span></h2>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let step of howItWorks; let i = index" class="relative text-center group">
              <div *ngIf="i < 2" class="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 z-0"></div>
              <div class="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg transition-transform duration-300 group-hover:-translate-y-2" [class]="step.bg">{{ step.icon }}</div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ step.title }}</h3>
              <p class="text-gray-500 dark:text-gray-400 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: Feature Grid -->
      <section class="py-20 bg-white dark:bg-gray-900">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-12"><h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Everything in one place</h2></div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div *ngFor="let feat of featureGrid" class="group p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="text-2xl mb-3">{{ feat.emoji }}</div>
              <h4 class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ feat.title }}</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 4: CTA Banner -->
      <section class="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none"></div>
        <div class="relative max-w-3xl mx-auto text-center px-6">
          <h2 class="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">Ready to take control of your tasks?</h2>
          <p class="text-blue-100 text-lg mb-8">Join for free. No credit card required.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a routerLink="/register" class="px-8 py-4 bg-white text-blue-700 font-bold rounded-full text-lg hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95">Start for free →</a>
            <a routerLink="/login" class="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full text-lg border border-white/30 hover:bg-white/20 transition-all hover:-translate-y-1 active:scale-95">Sign in</a>
          </div>
        </div>
      </section>

      <!-- Footer -->

      <footer class="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 py-12 text-center text-gray-600 dark:text-gray-500 transition-colors duration-300">
         <div class="flex justify-center space-x-6 mb-8">
            <a href="#" class="text-gray-400 hover:text-blue-500 transition-colors"><span class="sr-only">Twitter</span><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
            <a href="https://github.com/DevSon1024/task-manager-firebase" target="_blank" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><span class="sr-only">GitHub</span><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg></a>
         </div>
         <p>&copy; {{ currentYear }} TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    .perspective-1000 {
      perspective: 1000px;
    }
    @keyframes shine {
      100% { left: 125%; }
    }
    .animate-shine {
      animation: shine 0.7s;
    }
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeIn 0.8s ease-out forwards;
        opacity: 0;
    }
    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-500 { animation-delay: 0.5s; }
  `]
})
export class LandingComponent {
  mobileMenuOpen = false;
  currentYear = new Date().getFullYear();
  navHidden = false;

  drawerFeatures = [
    'Free to use, no credit card needed',
    'Kanban board & list views',
    'Notes with Markdown support',
    'Works across all your devices',
  ];

  kanbanPoints = [
    'Visualize tasks across To Do, In Progress, and Done',
    'Priority & due-date badges at a glance',
    'Filter by tag, priority, or assignee',
  ];

  notesPoints = [
    'Full Markdown editor with live preview',
    'Color-code notes by category',
    'Link notes directly to related tasks',
    'Tag-based organization and search',
  ];

  searchPoints = [
    'Press / anywhere to open instantly',
    'Searches tasks AND notes simultaneously',
    'Highlighted keyword matches in results',
    'Debounced — no unnecessary requests',
  ];

  kanbanCols = [
    { headerClass: 'bg-gray-100 dark:bg-gray-700', cards: [0, 200] },
    { headerClass: 'bg-blue-100 dark:bg-blue-900/50', cards: [100] },
    { headerClass: 'bg-green-100 dark:bg-green-900/50', cards: [150, 300] },
  ];

  howItWorks = [
    { icon: '✉️', bg: 'bg-blue-600',   title: 'Create a free account', desc: 'Sign up in seconds with your email or Google account. No credit card needed.' },
    { icon: '✅', bg: 'bg-indigo-600', title: 'Add your first task',    desc: 'Use the + button or press the global shortcut to capture any task instantly.' },
    { icon: '🚀', bg: 'bg-purple-600', title: 'Get things done',        desc: 'Drag tasks through your workflow, write linked notes, and track everything.' },
  ];

  featureGrid = [
    { emoji: '📋', title: 'Kanban Board',      desc: 'Visual drag-and-drop workflow management' },
    { emoji: '📝', title: 'Markdown Notes',    desc: 'Rich notes with a live preview editor' },
    { emoji: '🔍', title: 'Unified Search',    desc: 'Find tasks and notes with one keystroke' },
    { emoji: '🌙', title: 'Dark Mode',         desc: 'Easy on the eyes day and night' },
    { emoji: '🏷️', title: 'Tags & Priorities', desc: 'Filter and organize by labels' },
    { emoji: '📅', title: 'Due Dates',         desc: 'Never miss a deadline again' },
    { emoji: '🔗', title: 'Task-Note Links',   desc: 'Attach context notes to any task' },
    { emoji: '☁️', title: 'Cloud Sync',        desc: 'Access your data from any device' },
  ];

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }
  private lastScrollY = 0;
  private scrollThreshold = 80;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentY = window.scrollY;
    if (currentY < this.scrollThreshold) {
      this.navHidden = false;
    } else if (currentY > this.lastScrollY + 5) {
      this.navHidden = true;  // scrolling down — hide
    } else if (currentY < this.lastScrollY - 5) {
      this.navHidden = false; // scrolling up — show
    }
    this.lastScrollY = currentY;
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if (this.lightboxIndex !== null) {
      if (event.key === 'Escape')     { this.closeLightbox(); }
      if (event.key === 'ArrowLeft')  { this.prevImage(); }
      if (event.key === 'ArrowRight') { this.nextImage(); }
    }
  }
  // ── Lightbox ──
  lightboxImages = [
    'assets/screenshots/UserDashboard.png',
    'assets/screenshots/notes.png',
    'assets/screenshots/Search.png',
  ];
  lightboxIndex: number | null = null;

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxIndex = null;
    document.body.style.overflow = '';
  }

  prevImage(): void {
    if (this.lightboxIndex === null) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxImages.length) % this.lightboxImages.length;
  }

  nextImage(): void {
    if (this.lightboxIndex === null) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxImages.length;
  }
}
