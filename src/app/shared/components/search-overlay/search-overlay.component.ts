import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SearchService } from '../../../core/services/search.service';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { ModalComponent } from '../modal/modal.component';
import { TaskDetailViewComponent } from '../../../features/tasks/task-detail-view/task-detail-view.component';
import { TaskFormComponent } from '../../../features/tasks/task-form/task-form.component';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, TaskDetailViewComponent, TaskFormComponent],
  template: `
    <div class="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="close.emit()"></div>

      <!-- Slide-down panel -->
      <div class="fixed inset-x-0 top-0 bottom-0 md:bottom-auto md:h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out rounded-b-xl z-50">
        <div class="max-w-4xl mx-auto px-4 py-6">
          
          <!-- Search Input header -->
          <div class="flex items-center space-x-4 mb-6">
            <div class="flex-1 relative">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="onQueryChange($event)"
                placeholder="Search tasks..." 
                class="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                autofocus
              >
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <button (click)="close.emit()" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Close
            </button>
          </div>

          <!-- Active Filters Chips -->
          <div *ngIf="(hasActiveFilters$ | async)" class="flex flex-wrap gap-2 mb-4 animate-fade-in">
             <span *ngFor="let tag of (searchService.searchState$ | async)?.tags" 
                   class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
               {{ tag }}
               <button (click)="searchService.toggleTag(tag)" class="ml-2 focus:outline-none">
                 <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
               </button>
             </span>
             
             <span *ngIf="(searchService.searchState$ | async)?.priority as p" 
                   class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 capitalize">
               {{ p }} Priority
               <button (click)="searchService.setPriority(p)" class="ml-2 focus:outline-none">
                 <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
               </button>
             </span>
          </div>

          <!-- Live Results (Show if Query OR Filters matched) -->
          <div *ngIf="searchQuery || (hasActiveFilters$ | async)" class="mb-8 animate-fade-in">
             <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
               Results ({{ (filteredTasks$ | async)?.length || 0 }})
             </h3>
             
             <div class="space-y-2">
                <div 
                  *ngFor="let task of filteredTasks$ | async"
                  (click)="selectTask(task)"
                  class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                   <div [ngClass]="{
                      'bg-gray-200': !task.status || task.status === 'todo',
                      'bg-blue-100 text-blue-600': task.status === 'in-progress',
                      'bg-green-100 text-green-600': task.status === 'done'
                   }" class="h-2 w-2 rounded-full mr-3"></div>
                   
                   <span class="flex-1 text-gray-900 dark:text-gray-200 font-medium">{{ task.title }}</span>
                   
                   <span *ngIf="task.dueDate" class="text-xs text-gray-500 mr-2">
                      {{ task.dueDate.toDate() | date:'shortDate' }}
                   </span>
                   <span class="text-gray-400">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                   </span>
                </div>
                
                <div *ngIf="(filteredTasks$ | async)?.length === 0" class="text-center py-4 text-gray-500">
                   No tasks found matching your criteria.
                </div>
             </div>
          </div>

          <!-- Quick Filters (Show only if NO filters active to allow adding first filter easily) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" *ngIf="!(hasActiveFilters$ | async) && !searchQuery">
             
             <!-- Tags Section -->
             <div>
                <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Filter by Tag</h3>
                <div class="flex flex-wrap gap-2">
                   <button 
                     *ngFor="let tag of availableTags"
                     (click)="selectTag(tag)"
                     class="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-blue-100 dark:hover:bg-gray-600 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                     {{ tag }}
                   </button>
                </div>
             </div>

             <!-- Priority Section -->
             <div>
                <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Filter by Priority</h3>
                <div class="flex flex-wrap gap-2">
                   <button 
                     *ngFor="let p of priorities"
                     (click)="selectPriority(p)"
                     class="px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors hover:bg-blue-100 dark:hover:bg-gray-600 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                     {{ p }}
                   </button>
                </div>
             </div>

          </div>

          <div class="mt-8 text-center text-sm text-gray-400" *ngIf="!searchQuery && !(hasActiveFilters$ | async)">
             Typing will show matching tasks immediately. Selecting a filter will apply it dynamically.
          </div>

        </div>
      </div>
      
      <!-- Detail View Modal -->
      <app-modal [isOpen]="!!viewingTask" [title]="viewingTask?.title || 'Task Details'" (close)="viewingTask = null">
          <app-task-detail-view 
            [task]="viewingTask" 
            (edit)="onEditTask($event)"
            (close)="viewingTask = null">
          </app-task-detail-view>
      </app-modal>

      <!-- Edit Task Modal -->
      <app-modal [isOpen]="!!editingTask" [title]="'Edit Task'" (close)="editingTask = null">
          <app-task-form 
             [task]="editingTask" 
             (cancel)="editingTask = null"
             (save)="editingTask = null">
          </app-task-form>
      </app-modal>
    </div>
  `
})
export class SearchOverlayComponent {
  @Output() close = new EventEmitter<void>();
  
  searchService = inject(SearchService);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  searchQuery = '';
  availableTags = ['Work', 'Personal', 'Urgent', 'Health', 'Finance'];
  priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  filteredTasks$: Observable<Task[]>;
  hasActiveFilters$: Observable<boolean>;

  viewingTask: Task | null = null;
  editingTask: Task | null = null;

  constructor() {
    this.searchService.searchState$.subscribe(state => {
      if (this.searchQuery !== state.query) {
        this.searchQuery = state.query;
      }
    });

    this.hasActiveFilters$ = this.searchService.searchState$.pipe(
      map(state => state.tags.length > 0 || !!state.priority)
    );

    const tasks$ = this.authService.user$.pipe(
      switchMap(user => user ? this.taskService.getUserTasks() : of([]))
    );

    this.filteredTasks$ = combineLatest([
      tasks$,
      this.searchService.searchState$
    ]).pipe(
      map(([tasks, filters]) => {
        // If no filter at all, return empty (clean state)
        if (!filters.query && filters.tags.length === 0 && !filters.priority) return [];
        
        const lowerTerm = filters.query.toLowerCase();
        
        return tasks.filter(task => {
           const matchesQuery = !filters.query || 
            task.title.toLowerCase().includes(lowerTerm) ||
            task.description.toLowerCase().includes(lowerTerm) ||
            task.tags?.some(tag => tag.toLowerCase().includes(lowerTerm));

           const matchesTags = filters.tags.length === 0 || 
            (task.tags && filters.tags.every(t => task.tags?.includes(t)));

           const matchesPriority = !filters.priority || task.priority === filters.priority;

           return matchesQuery && matchesTags && matchesPriority;
        });
      })
    );
  }

  onQueryChange(query: string) {
    this.searchService.updateQuery(query);
  }

  selectTag(tag: string) {
    this.searchService.toggleTag(tag);
    // Removed closeAndNavigate to keep overlay open
  }

  selectPriority(p: 'low' | 'medium' | 'high') {
    this.searchService.setPriority(p);
    // Removed closeAndNavigate to keep overlay open
  }

  selectTask(task: Task) {
    this.viewingTask = task;
  }

  onEditTask(task: Task) {
    this.viewingTask = null;
    this.editingTask = task;
  }
}
