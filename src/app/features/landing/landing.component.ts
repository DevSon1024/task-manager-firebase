import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-hidden font-sans transition-colors duration-300 selection:bg-blue-500 selection:text-white">
      
      <!-- Glassmorphic Navbar -->
      <nav class="fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg shadow-gray-200/20 dark:shadow-black/20">
        <div class="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div class="flex items-center space-x-3 group cursor-pointer">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-12 shadow-lg shadow-blue-500/30">
               <span class="text-white font-bold text-2xl drop-shadow-md">T</span>
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
             <!-- Mobile Menu Button (mock) -->
             <button class="md:hidden p-2 text-gray-600 dark:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
             </button>
          </div>
        </div>
      </nav>

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
      
      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 py-12 text-center text-gray-600 dark:text-gray-500 transition-colors duration-300">
         <div class="flex justify-center space-x-6 mb-8">
            <a href="#" class="text-gray-400 hover:text-blue-500 transition-colors"><span class="sr-only">Twitter</span><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
            <a href="#" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><span class="sr-only">GitHub</span><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg></a>
         </div>
         <p>&copy; 2026 TaskFlow. All rights reserved.</p>
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
export class LandingComponent {}
