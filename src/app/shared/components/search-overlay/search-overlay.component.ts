import {
  Component, EventEmitter, Output, inject, OnInit, OnDestroy,
  HostListener, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService } from '../../../core/services/search.service';
import { TaskService } from '../../../core/services/task.service';
import { NoteService } from '../../../core/services/note.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { Note } from '../../../core/models/note.model';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Full-screen click-trap backdrop (invisible) -->
    <div class="fixed inset-0 z-40" (click)="close.emit()"></div>

    <!-- Floating search panel - anchored below the navbar -->
    <div class="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 md:pt-16 pointer-events-none">
      <div class="w-full max-w-2xl pointer-events-auto search-panel" #panel>

        <!-- ── Search Input ── -->
        <div class="relative">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input #searchInput
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onQueryChange($event)"
            placeholder="Search tasks and notes...  Press ESC to close"
            class="w-full pl-12 pr-14 py-4 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          >
          <!-- Keyboard hint -->
          <div class="absolute inset-y-0 right-4 flex items-center gap-2">
            <kbd class="hidden sm:flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-600">
              ESC
            </kbd>
            <button (click)="close.emit()" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ── Results dropdown ── -->
        <div *ngIf="searchQuery.trim().length > 0"
             class="mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden results-panel">

          <!-- Loading -->
          <div *ngIf="isLoading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>

          <div *ngIf="!isLoading" class="max-h-[70vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">

            <!-- ── TASKS SECTION ── -->
            <div *ngIf="filteredTasks.length > 0" class="p-3">
              <div class="flex items-center gap-2 px-2 mb-2">
                <svg class="h-3.5 w-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tasks ({{ filteredTasks.length }})</span>
              </div>
              <div class="space-y-0.5">
                <div *ngFor="let task of filteredTasks.slice(0, 5)"
                  (click)="goToTasks(task)"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">

                  <!-- Status dot -->
                  <div [ngClass]="{
                    'bg-gray-300 dark:bg-gray-500': !task.status || task.status === 'todo',
                    'bg-blue-400': task.status === 'in-progress',
                    'bg-green-400': task.status === 'done'
                  }" class="h-2.5 w-2.5 rounded-full shrink-0"></div>

                  <div class="flex-1 min-w-0">
                    <p [class.line-through]="task.completed" [class.opacity-60]="task.completed"
                       class="text-sm font-medium text-gray-900 dark:text-white truncate"
                       [innerHTML]="highlight(task.title, searchQuery)"></p>
                    <p *ngIf="task.description" class="text-xs text-gray-400 truncate mt-0.5">{{ task.description | slice:0:80 }}</p>
                  </div>

                  <!-- Priority badge -->
                  <span [ngClass]="{
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': task.priority === 'high',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': task.priority === 'medium',
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': task.priority === 'low'
                  }" class="text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 hidden group-hover:inline-flex">
                    {{ task.priority }}
                  </span>

                  <svg class="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <button *ngIf="filteredTasks.length > 5"
                (click)="goToTasksAll()"
                class="mt-1 w-full text-xs text-blue-600 dark:text-blue-400 hover:underline py-1.5 text-center">
                See all {{ filteredTasks.length }} task results →
              </button>
            </div>

            <!-- ── NOTES SECTION ── -->
            <div *ngIf="filteredNotes.length > 0" class="p-3">
              <div class="flex items-center gap-2 px-2 mb-2">
                <svg class="h-3.5 w-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Notes ({{ filteredNotes.length }})</span>
              </div>
              <div class="space-y-0.5">
                <div *ngFor="let note of filteredNotes.slice(0, 5)"
                  (click)="goToNotes()"
                  class="flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">

                  <div class="h-2.5 w-2.5 rounded-full bg-purple-400 shrink-0 mt-1.5"></div>

                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate"
                       [innerHTML]="highlight(note.title, searchQuery)"></p>
                    <p class="text-xs text-gray-400 truncate mt-0.5">{{ note.content | slice:0:80 }}</p>
                  </div>

                  <span class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 shrink-0">{{ note.category }}</span>

                  <svg class="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <button *ngIf="filteredNotes.length > 5"
                (click)="goToNotes()"
                class="mt-1 w-full text-xs text-purple-600 dark:text-purple-400 hover:underline py-1.5 text-center">
                See all {{ filteredNotes.length }} note results in Notes →
              </button>
            </div>

            <!-- ── EMPTY STATE ── -->
            <div *ngIf="filteredTasks.length === 0 && filteredNotes.length === 0"
                 class="flex flex-col items-center justify-center py-10 text-gray-400">
              <svg class="h-10 w-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p class="text-sm font-medium">No results for "{{ searchQuery }}"</p>
              <p class="text-xs mt-1 text-gray-300 dark:text-gray-600">Try different keywords</p>
            </div>
          </div>
        </div>

        <!-- ── Empty state: shortcuts hint when no query ── -->
        <div *ngIf="searchQuery.trim().length === 0"
             class="mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">/</kbd>
              Open search
            </span>
            <span class="flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">ESC</kbd>
              Close
            </span>
            <span class="flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">↵</kbd>
              Open result
            </span>
          </div>
          <p class="mt-3 text-xs text-gray-400">Search across your tasks and notes simultaneously</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .search-panel {
      animation: search-drop-in 0.18s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes search-drop-in {
      from { opacity: 0; transform: translateY(-12px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .results-panel {
      animation: results-fade-in 0.15s ease-out;
    }
    @keyframes results-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SearchOverlayComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() close = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchService = inject(SearchService);
  private taskService = inject(TaskService);
  private noteService = inject(NoteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = '';
  filteredTasks: Task[] = [];
  filteredNotes: Note[] = [];
  isLoading = false;

  private querySubject = new BehaviorSubject<string>('');
  private allTasks: Task[] = [];
  private allNotes: Note[] = [];
  private subs: Subscription[] = [];

  @HostListener('document:keydown.escape')
  onEscape() { this.close.emit(); }

  ngOnInit(): void {
    // Load data
    const taskSub = this.authService.user$.pipe(
      switchMap(u => u ? this.taskService.getUserTasks() : of([]))
    ).subscribe(tasks => { this.allTasks = tasks; this.runSearch(); });

    const noteSub = this.authService.user$.pipe(
      switchMap(u => u ? this.noteService.getUserNotes() : of([]))
    ).subscribe(notes => { this.allNotes = notes; this.runSearch(); });

    // Debounced search - only runs 300ms after user stops typing
    const qSub = this.querySubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => { this.runSearch(); this.isLoading = false; });

    this.subs.push(taskSub, noteSub, qSub);
  }

  ngAfterViewInit(): void {
    // Auto-focus the input when overlay opens
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 50);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.searchService.clearFilters();
  }

  onQueryChange(query: string): void {
    this.isLoading = query.trim().length > 0; // show spinner immediately on typing
    this.querySubject.next(query);
    this.searchService.updateQuery(query);
  }

  private runSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredTasks = [];
      this.filteredNotes = [];
      return;
    }
    this.filteredTasks = this.allTasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
    this.filteredNotes = this.allNotes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.category?.toLowerCase().includes(q) ||
      n.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }

  highlight(text: string, query: string): string {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'),
      '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5 not-italic">$1</mark>');
  }

  goToTasks(task: Task): void {
    this.searchService.updateQuery(this.searchQuery);
    this.close.emit();
    this.router.navigate(['/tasks']);
  }

  goToTasksAll(): void {
    this.close.emit();
    this.router.navigate(['/tasks']);
  }

  goToNotes(): void {
    this.close.emit();
    this.router.navigate(['/notes']);
  }
}
